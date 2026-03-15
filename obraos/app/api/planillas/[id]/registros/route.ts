import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Crear registro en un bloque de planilla: nombre, unidad (DIA|M2|M3), tarifa
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: planillaId } = await params;
  const body = await req.json();
  const { nombre, unidad, tarifa } = body;

  if (!nombre?.trim()) {
    return NextResponse.json({ error: "nombre es requerido" }, { status: 400 });
  }
  const unidades = ["DIA", "M2", "M3"];
  if (!unidad || !unidades.includes(String(unidad).toUpperCase())) {
    return NextResponse.json({ error: "unidad debe ser DIA, M2 o M3" }, { status: 400 });
  }
  const tarifaNum = parseFloat(String(tarifa));
  if (isNaN(tarifaNum) || tarifaNum < 0) {
    return NextResponse.json({ error: "tarifa debe ser un número >= 0" }, { status: 400 });
  }

  const planilla = await prisma.planilla.findUnique({ where: { id: planillaId } });
  if (!planilla) {
    return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
  }

  const registro = await prisma.planillaRegistro.create({
    data: {
      planillaId,
      nombre: nombre.trim(),
      unidad: String(unidad).toUpperCase() as "DIA" | "M2" | "M3",
      tarifa: tarifaNum,
    },
  });

  return NextResponse.json(registro);
}
