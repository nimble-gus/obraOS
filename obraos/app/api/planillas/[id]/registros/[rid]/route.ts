import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; rid: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { rid } = await params;
  await prisma.planillaRegistro.delete({ where: { id: rid } });
  return NextResponse.json({ ok: true });
}
