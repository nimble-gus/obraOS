import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ asignacionId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { asignacionId } = await params;
  await prisma.planillaAsignadaFase.delete({ where: { id: asignacionId } });
  return NextResponse.json({ ok: true });
}
