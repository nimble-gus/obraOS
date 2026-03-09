import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.nombre != null) data.nombre = String(body.nombre);
  if (body.anchoExterior != null) data.anchoExterior = Math.max(2, Math.min(50, Number(body.anchoExterior)));
  if (body.profundidadExterior != null) data.profundidadExterior = Math.max(2, Math.min(50, Number(body.profundidadExterior)));
  if (body.alturaParedes != null) data.alturaParedes = Math.max(2, Math.min(50, Number(body.alturaParedes)));
  if (body.grosorMuro != null) data.grosorMuro = Math.max(0.1, Math.min(2, Number(body.grosorMuro)));
  if (body.tipoTecho != null) data.tipoTecho = body.tipoTecho;
  if (body.numVentanasFront != null) data.numVentanasFront = Math.max(0, Math.min(4, Number(body.numVentanasFront)));
  if (body.numVentanasSide != null) data.numVentanasSide = Math.max(0, Math.min(3, Number(body.numVentanasSide)));
  if (body.tienePuerta != null) data.tienePuerta = Boolean(body.tienePuerta);

  const modelo = await prisma.modeloCasa.update({
    where: { id },
    data: data as Parameters<typeof prisma.modeloCasa.update>[0]["data"],
  });

  return NextResponse.json(modelo);
}
