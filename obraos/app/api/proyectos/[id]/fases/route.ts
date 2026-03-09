import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: proyectoId } = await params;

  const fases = await prisma.fase.findMany({
    where: { proyectoId },
    select: { id: true, nombre: true },
    orderBy: { orden: "asc" },
  });

  return NextResponse.json(fases);
}
