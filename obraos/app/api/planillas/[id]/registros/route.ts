import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function calcularTotal(
  tarifaDia: number,
  diasTrabajados: number,
  horasExtras: number,
  tarifaHoraExtra: number | null
): number {
  const regular = tarifaDia * diasTrabajados;
  const thExtra =
    tarifaHoraExtra ?? (tarifaDia / 8) * 1.5;
  const extras = horasExtras * thExtra;
  return Math.round((regular + extras) * 100) / 100;
}

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
  const { nombrePersona, tarifaDia, diasTrabajados, horasExtras, tarifaHoraExtra } =
    body;

  if (!nombrePersona?.trim() || tarifaDia == null || diasTrabajados == null) {
    return NextResponse.json(
      { error: "nombrePersona, tarifaDia y diasTrabajados son requeridos" },
      { status: 400 }
    );
  }

  const td = parseFloat(String(tarifaDia)) || 0;
  const dias = Math.max(0, parseInt(String(diasTrabajados)) || 0);
  const he = Math.max(0, parseInt(String(horasExtras)) || 0);
  const the = tarifaHoraExtra != null ? parseFloat(String(tarifaHoraExtra)) : null;

  const total = calcularTotal(td, dias, he, the);

  const registro = await prisma.planillaRegistro.create({
    data: {
      planillaId,
      nombrePersona: nombrePersona.trim(),
      tarifaDia: td,
      diasTrabajados: dias,
      horasExtras: he,
      tarifaHoraExtra: the,
      total,
    },
  });

  return NextResponse.json(registro);
}
