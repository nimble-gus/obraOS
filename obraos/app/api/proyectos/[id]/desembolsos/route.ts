import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: proyectoId } = await params;
  try {
    const body = await req.json();
    const { monto, descripcion, unidadId } = body ?? {};
    if (typeof monto !== "number" || monto <= 0) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 },
      );
    }

    await prisma.desembolsoProyecto.create({
      data: {
        proyectoId,
        monto,
        descripcion: descripcion || null,
        unidadId: unidadId || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo registrar el desembolso" },
      { status: 400 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: proyectoId } = await params;
  try {
    const body = await req.json();
    const { desembolsoId, monto, descripcion, unidadId } = body ?? {};
    if (!desembolsoId || typeof desembolsoId !== "string") {
      return NextResponse.json(
        { error: "desembolsoId requerido" },
        { status: 400 },
      );
    }
    if (typeof monto !== "number" || monto <= 0) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 },
      );
    }

    await prisma.desembolsoProyecto.update({
      where: { id: desembolsoId },
      data: {
        proyectoId,
        monto,
        descripcion: descripcion || null,
        unidadId: unidadId || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo actualizar el desembolso" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await params; // solo para cumplir firma, el id del proyecto no es necesario aquí
  try {
    const { searchParams } = new URL(req.url);
    const desembolsoId = searchParams.get("desembolsoId");
    if (!desembolsoId) {
      return NextResponse.json(
        { error: "desembolsoId requerido" },
        { status: 400 },
      );
    }

    await prisma.desembolsoProyecto.delete({
      where: { id: desembolsoId },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo eliminar el desembolso" },
      { status: 400 },
    );
  }
}

