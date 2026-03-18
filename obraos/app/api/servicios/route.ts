import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const servicios = await prisma.catalogoServicio.findMany({
    where: { activo: true },
    include: { tipoServicio: true },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(servicios);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { puedeAgregarMateriales } = await import("@/lib/permissions");
  if (!puedeAgregarMateriales(session.user.role ?? "")) {
    return NextResponse.json(
      { error: "No tienes permiso para agregar servicios" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { nombre, unidad, costoUnitario, tipoServicioId } = body;

  if (!nombre?.trim() || !unidad?.trim()) {
    return NextResponse.json(
      { error: "nombre y unidad son requeridos" },
      { status: 400 }
    );
  }

  if (!tipoServicioId) {
    return NextResponse.json(
      { error: "Selecciona un tipo de servicio. Créalos en Admin > Tipos de servicio." },
      { status: 400 }
    );
  }

  const servicio = await prisma.catalogoServicio.create({
    data: {
      nombre: nombre.trim(),
      unidad: unidad.trim(),
      costoUnitario: parseFloat(costoUnitario) || 0,
      tipoServicioId,
    },
    include: { tipoServicio: true },
  });

  return NextResponse.json(servicio);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { puedeAgregarMateriales } = await import("@/lib/permissions");
  if (!puedeAgregarMateriales(session.user.role ?? "")) {
    return NextResponse.json(
      { error: "No tienes permiso para eliminar servicios" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "ID de servicio requerido" },
      { status: 400 },
    );
  }

  // Eliminación suave: marcar inactivo para no romper referencias
  await prisma.catalogoServicio.update({
    where: { id },
    data: { activo: false },
  });

  return NextResponse.json({ ok: true });
}

