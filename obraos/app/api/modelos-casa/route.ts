import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const modelos = await prisma.modeloCasa.findMany({
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(modelos);
}
