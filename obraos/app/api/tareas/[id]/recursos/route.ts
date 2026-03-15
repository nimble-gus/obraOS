import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: tareaId } = await params;
  const body = await req.json();
  const { tipo, unidadId } = body;

  if (!tareaId || !unidadId) {
    return NextResponse.json(
      { error: "Faltan tareaId o unidadId" },
      { status: 400 }
    );
  }

  const tarea = await prisma.tarea.findUnique({
    where: { id: tareaId },
    include: { fase: { select: { proyectoId: true } } },
  });
  if (!tarea) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  const proyectoId = tarea.fase.proyectoId;

  // Verificar que la unidad pertenece al proyecto
  const unidad = await prisma.unidad.findFirst({
    where: { id: unidadId, proyectoId },
  });
  if (!unidad) {
    return NextResponse.json({ error: "Unidad no válida" }, { status: 400 });
  }

  if (tipo === "material") {
    const { catalogoMaterialId, cantidad } = body;
    if (!catalogoMaterialId || cantidad == null || cantidad <= 0) {
      return NextResponse.json(
        { error: "Faltan catalogoMaterialId o cantidad válida" },
        { status: 400 }
      );
    }

    const material = await prisma.catalogoMaterial.findFirst({
      where: { id: catalogoMaterialId, activo: true },
    });
    if (!material) {
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
    }
    const cantidadNum = Math.round(parseFloat(String(cantidad)));
    if (material.stockTotal < cantidadNum) {
      return NextResponse.json(
        { error: `Stock insuficiente en Materiales. Disponible: ${material.stockTotal} ${material.unidad}` },
        { status: 400 }
      );
    }

    const monto = cantidadNum * material.costoUnitario;

    await prisma.$transaction([
      prisma.materialAsignadoTarea.create({
        data: {
          catalogoMaterialId,
          tareaId,
          unidadId,
          cantidad: cantidadNum,
          monto,
        },
      }),
      prisma.catalogoMaterial.update({
        where: { id: catalogoMaterialId },
        data: { stockTotal: { decrement: cantidadNum } },
      }),
    ]);

    return NextResponse.json({ ok: true });
  }

  if (tipo === "planilla") {
    // Asignación por bloque: planillaId + unidad + cantidad → monto = (suma tarifas del bloque en esa unidad) × cantidad
    const { planillaId, unidad, cantidad } = body;
    if (!planillaId || !unidad || cantidad == null || cantidad <= 0) {
      return NextResponse.json(
        { error: "Faltan planillaId, unidad o cantidad válida" },
        { status: 400 }
      );
    }

    const unidadUpper = String(unidad).toUpperCase();
    if (!["DIA", "M2", "M3"].includes(unidadUpper)) {
      return NextResponse.json({ error: "Unidad debe ser DIA, M2 o M3" }, { status: 400 });
    }

    const planilla = await prisma.planilla.findFirst({
      where: { id: planillaId, proyectoId },
      include: { registros: true },
    });
    if (!planilla) {
      return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
    }

    // Solo registros del bloque con la unidad elegida
    const registrosEnUnidad = planilla.registros.filter((r) => r.unidad === unidadUpper);
    if (registrosEnUnidad.length === 0) {
      return NextResponse.json(
        { error: `El bloque no tiene registros con unidad ${unidadUpper}. Agrega al menos uno en Planilla.` },
        { status: 400 }
      );
    }

    const sumaTarifas = registrosEnUnidad.reduce((s, r) => s + r.tarifa, 0);
    const cantidadNum = parseFloat(String(cantidad));

    // Validar que la unidad y cantidad coincidan con la tarea
    if (unidadUpper === "M2") {
      if (tarea.cantidadM2 <= 0) {
        return NextResponse.json(
          { error: "Esta tarea no tiene cantidad en m². Usa m³ o día según corresponda." },
          { status: 400 }
        );
      }
      if (cantidadNum > tarea.cantidadM2) {
        return NextResponse.json(
          { error: `La cantidad no puede superar los ${tarea.cantidadM2} m² de la tarea.` },
          { status: 400 }
        );
      }
    } else if (unidadUpper === "M3") {
      if (tarea.cantidadM3 <= 0) {
        return NextResponse.json(
          { error: "Esta tarea no tiene cantidad en m³. Usa m² o día según corresponda." },
          { status: 400 }
        );
      }
      if (cantidadNum > tarea.cantidadM3) {
        return NextResponse.json(
          { error: `La cantidad no puede superar los ${tarea.cantidadM3} m³ de la tarea.` },
          { status: 400 }
        );
      }
    }

    const monto = sumaTarifas * cantidadNum;

    await prisma.planillaAsignadaTarea.create({
      data: {
        planillaId,
        tareaId,
        unidadId,
        unidadTipo: unidadUpper as "DIA" | "M2" | "M3",
        cantidad: cantidadNum,
        monto,
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (tipo === "servicio") {
    const { servicioId, cantidad } = body;
    if (!servicioId || cantidad == null || cantidad <= 0) {
      return NextResponse.json(
        { error: "Faltan servicioId o cantidad válida" },
        { status: 400 }
      );
    }

    const servicio = await prisma.catalogoServicio.findFirst({
      where: { id: servicioId, activo: true },
    });
    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    const monto = cantidad * servicio.costoUnitario;

    await prisma.servicioAsignadoTarea.create({
      data: { servicioId, tareaId, unidadId, cantidad, monto },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Tipo de recurso no válido" }, { status: 400 });
}
