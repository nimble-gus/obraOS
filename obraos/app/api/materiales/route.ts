import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const materiales = await prisma.catalogoMaterial.findMany({
    where: { activo: true },
    orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
  });

  return NextResponse.json(materiales);
}

const CATEGORIAS = [
  "MAMPOSTERIA",
  "CIMENTACION",
  "ESTRUCTURA",
  "ACABADOS",
  "MEZCLAS",
  "INSTALACIONES",
] as const;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { puedeAgregarMateriales } = await import("@/lib/permissions");
  if (!puedeAgregarMateriales(session.user.role ?? "")) {
    return NextResponse.json(
      { error: "No tienes permiso para agregar materiales" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { nombre, categoria, unidad, stockTotal, costoUnitario, presupuestoAsignado, colorHex } = body;

  if (!nombre || !categoria || !unidad) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: nombre, categoria, unidad" },
      { status: 400 }
    );
  }

  if (!CATEGORIAS.includes(categoria)) {
    return NextResponse.json(
      { error: "Categoría inválida" },
      { status: 400 }
    );
  }

  const material = await prisma.catalogoMaterial.create({
    data: {
      nombre: String(nombre),
      categoria,
      unidad: String(unidad),
      stockTotal: parseInt(stockTotal) || 0,
      costoUnitario: parseFloat(costoUnitario) || 0,
      presupuestoAsignado: presupuestoAsignado != null ? parseFloat(presupuestoAsignado) : null,
      colorHex: colorHex && String(colorHex).trim() ? String(colorHex) : null,
    },
  });

  return NextResponse.json(material);
}
