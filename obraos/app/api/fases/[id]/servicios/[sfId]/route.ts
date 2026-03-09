import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; sfId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { sfId } = await params;
  await prisma.servicioFase.delete({ where: { id: sfId } });
  return NextResponse.json({ ok: true });
}
