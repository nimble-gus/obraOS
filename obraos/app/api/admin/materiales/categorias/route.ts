import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

async function ensureAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }
}

const CATEGORIA_ENUM_VALUES = [
  "MAMPOSTERIA",
  "CIMENTACION",
  "ESTRUCTURA",
  "ACABADOS",
  "MEZCLAS",
  "INSTALACIONES",
] as const;

export async function GET(req: Request) {
  try {
    await ensureAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const soloActivas = searchParams.get("activa") === "true";

  const categorias = await prisma.categoriaMaterialConfig.findMany({
    where: soloActivas ? { activa: true } : undefined,
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });

  return NextResponse.json(categorias);
}

export async function POST(req: Request) {
  try {
    await ensureAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { slug, nombre, orden } = body ?? {};
    if (typeof slug !== "string" || !CATEGORIA_ENUM_VALUES.includes(slug)) {
      return NextResponse.json(
        { error: "Slug de categoría inválido" },
        { status: 400 },
      );
    }
    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "Nombre requerido" },
        { status: 400 },
      );
    }

    const created = await prisma.categoriaMaterialConfig.create({
      data: {
        slug,
        nombre: nombre.trim(),
        orden: typeof orden === "number" ? orden : 0,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo crear categoría" },
      { status: 400 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await ensureAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, nombre, orden, activa } = body ?? {};
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400 },
      );
    }

    const updated = await prisma.categoriaMaterialConfig.update({
      where: { id },
      data: {
        nombre: typeof nombre === "string" ? nombre.trim() : undefined,
        orden: typeof orden === "number" ? orden : undefined,
        activa: typeof activa === "boolean" ? activa : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo actualizar categoría" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await ensureAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400 },
      );
    }

    await prisma.categoriaMaterialConfig.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo eliminar categoría" },
      { status: 400 },
    );
  }
}

