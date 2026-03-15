import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const proyectoId = searchParams.get("proyectoId");
  if (!proyectoId) {
    return NextResponse.json({ error: "proyectoId requerido" }, { status: 400 });
  }

  const planillas = await prisma.planilla.findMany({
    where: { proyectoId },
    include: {
      registros: true,
      asignaciones: { include: { fase: { select: { nombre: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(planillas);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { proyectoId, nombre, periodo } = body;

  if (!proyectoId || !nombre?.trim()) {
    return NextResponse.json(
      { error: "proyectoId y nombre son requeridos" },
      { status: 400 }
    );
  }

  const planilla = await prisma.planilla.create({
    data: {
      proyectoId,
      nombre: nombre.trim(),
      periodo: periodo?.trim() || null,
    },
  });

  return NextResponse.json(planilla);
}
