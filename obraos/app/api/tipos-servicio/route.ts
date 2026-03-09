import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/** GET: Lista de tipos de servicio activos (para selects en plataforma) */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tipos = await prisma.catalogoTipoServicio.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
  });

  return NextResponse.json(tipos);
}
