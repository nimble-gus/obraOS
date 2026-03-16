import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: proyectoId } = await params;

  try {
    const body = await req.json();
    const {
      precioVenta,
      presupuestoTotal,
      margenObjetivoPct,
      pctIndirectosPct,
      pctContingenciaPct,
      rubros,
    } = body ?? {};

    await prisma.$transaction(async (tx) => {
      await tx.proyecto.update({
        where: { id: proyectoId },
        data: {
          precioVenta: typeof precioVenta === "number" ? precioVenta : undefined,
          presupuestoTotal:
            typeof presupuestoTotal === "number" ? presupuestoTotal : null,
          margenObjetivo:
            typeof margenObjetivoPct === "number"
              ? margenObjetivoPct / 100
              : undefined,
          pctCostosIndirectos:
            typeof pctIndirectosPct === "number"
              ? pctIndirectosPct / 100
              : undefined,
          pctContingencia:
            typeof pctContingenciaPct === "number"
              ? pctContingenciaPct / 100
              : undefined,
        },
      });

      if (rubros && typeof rubros === "object") {
        const entries: [string, unknown][] = Object.entries(rubros);
        for (const [rubro, pct] of entries) {
          if (typeof pct !== "number") continue;
          await tx.presupuestoRubro.upsert({
            where: {
              proyectoId_rubro: {
                proyectoId,
                rubro,
              },
            },
            update: {
              pctPresupuesto: pct / 100,
            },
            create: {
              proyectoId,
              rubro,
              pctPresupuesto: pct / 100,
            },
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo guardar el CAPEX" },
      { status: 400 },
    );
  }
}

