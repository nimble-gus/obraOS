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

  const { id: faseId } = await params;
  const body = await req.json();
  const { servicioId, cantidadRequerida } = body;

  if (!servicioId || cantidadRequerida == null) {
    return NextResponse.json(
      { error: "servicioId y cantidadRequerida son requeridos" },
      { status: 400 }
    );
  }

  const cant = Math.max(1, parseInt(String(cantidadRequerida)) || 1);

  const existing = await prisma.servicioFase.findUnique({
    where: { faseId_servicioId: { faseId, servicioId } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Este servicio ya está en la fase" },
      { status: 400 }
    );
  }

  const sf = await prisma.servicioFase.create({
    data: {
      faseId,
      servicioId,
      cantidadRequerida: cant,
    },
    include: { servicio: true },
  });

  return NextResponse.json(sf);
}
