import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * PATCH: Solo permite agregar stock (incrementar). No se puede reducir manualmente.
 * Body: { agregarStock?: number } - cantidad a sumar al stock
 *       { presupuestoAsignado?: number } - actualizar presupuesto
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { puedeAgregarMateriales } = await import("@/lib/permissions");
  if (!puedeAgregarMateriales(session.user.role ?? "")) {
    return NextResponse.json(
      { error: "No tienes permiso para modificar materiales" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const { agregarStock, presupuestoAsignado } = body;

  const data: Record<string, unknown> = {};
  if (agregarStock != null) {
    const inc = parseInt(String(agregarStock)) || 0;
    if (inc < 0) {
      return NextResponse.json(
        { error: "Solo se puede agregar stock. El material se resta al usar en fases." },
        { status: 400 }
      );
    }
    if (inc > 0) {
      data.stockTotal = { increment: inc };
    }
  }
  if (presupuestoAsignado !== undefined) {
    data.presupuestoAsignado = presupuestoAsignado != null ? parseFloat(presupuestoAsignado) : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Ningún campo para actualizar" }, { status: 400 });
  }

  const material = await prisma.catalogoMaterial.update({
    where: { id },
    data: data as Parameters<typeof prisma.catalogoMaterial.update>[0]["data"],
  });

  return NextResponse.json(material);
}

/**
 * DELETE: Desactivar material del inventario (solo ADMIN).
 * Soft delete: activo = false. El material sigue en BD por referencias en fases.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { puedeEliminarMateriales } = await import("@/lib/permissions");
  if (!puedeEliminarMateriales(session.user.role ?? "")) {
    return NextResponse.json(
      { error: "Solo el administrador puede eliminar materiales del inventario" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const material = await prisma.catalogoMaterial.findUnique({ where: { id } });
  if (!material) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
  }

  await prisma.catalogoMaterial.update({
    where: { id },
    data: { activo: false },
  });

  return NextResponse.json({ ok: true });
}
