import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { puedeAgregarMateriales, puedeEliminarMateriales } from "@/lib/permissions";
import { AgregarStockButton } from "./AgregarStockButton";
import { EliminarMaterialButton } from "./EliminarMaterialButton";

const CAT_COLORS: Record<string, string> = {
  MAMPOSTERIA: "#e67e22",
  CIMENTACION: "#7f8c8d",
  ESTRUCTURA: "#2980b9",
  ACABADOS: "#c0392b",
  MEZCLAS: "#f39c12",
  INSTALACIONES: "#27ae60",
};

function stockLabel(stock: number): { text: string; color: string } {
  if (stock <= 0) return { text: "AGOTADO", color: "var(--red)" };
  if (stock <= 50) return { text: "BAJO", color: "var(--red)" };
  if (stock <= 200) return { text: "MED", color: "var(--accent)" };
  return { text: "OK", color: "var(--green)" };
}

export default async function MaterialesPage() {
  const session = await auth();
  const puedeAgregar = puedeAgregarMateriales(session?.user?.role ?? "");
  const puedeEliminar = puedeEliminarMateriales(session?.user?.role ?? "");

  const materiales = await prisma.catalogoMaterial.findMany({
    where: { activo: true },
    orderBy: { categoria: "asc" },
  });

  const totalValor = materiales.reduce((s, m) => s + m.stockTotal * m.costoUnitario, 0);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Control de Materiales
          </h1>
          <p style={{ color: "var(--text3)" }} className="mt-0.5 text-sm">
            Inventario y costos
          </p>
        </div>
        {puedeAgregar && (
          <Link
            href="/platform/materiales/nuevo"
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            + Agregar Material
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div
          className="overflow-hidden rounded-xl border lg:col-span-2"
          style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
        >
          <div className="border-b px-4 py-4" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-bold">Inventario General</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: "var(--bg3)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>Material</th>
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>Categoría</th>
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>Inventario</th>
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>Costo Unit.</th>
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>Total</th>
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>Stock</th>
                  {(puedeAgregar || puedeEliminar) && (
                    <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {materiales.map((m) => {
                  const st = stockLabel(m.stockTotal);
                  const total = m.stockTotal * m.costoUnitario;
                  return (
                    <tr
                      key={m.id}
                      className="transition hover:bg-black/5"
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: m.colorHex || CAT_COLORS[m.categoria] || "#888" }}
                          />
                          <span className="font-semibold">{m.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text3)" }}>{m.categoria}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: "var(--text2)" }}>
                        {m.stockTotal.toLocaleString()} {m.unidad}
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ color: "var(--accent)" }}>
                        Q{m.costoUnitario.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ color: "var(--text2)" }}>
                        Q{Math.round(total).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-[10px] font-medium" style={{ color: st.color }}>
                        {st.text}
                      </td>
                      {(puedeAgregar || puedeEliminar) && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {puedeAgregar && (
                              <AgregarStockButton
                                materialId={m.id}
                                nombre={m.nombre}
                                unidad={m.unidad}
                                puedeAgregar={puedeAgregar}
                              />
                            )}
                            {puedeEliminar && (
                              <EliminarMaterialButton materialId={m.id} nombre={m.nombre} />
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {materiales.length === 0 && (
            <div className="py-12 text-center" style={{ color: "var(--text3)" }}>
              No hay materiales en el catálogo
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">Presupuesto</h3>
              <span className="rounded px-2 py-0.5 font-mono text-[10px]" style={{ background: "var(--bg3)", color: "var(--text2)" }}>
                Q{Math.round(totalValor).toLocaleString()} total
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--text3)" }}>
              Valor total del inventario actual. Los costos por fase se calculan al asignar materiales a proyectos.
            </p>
          </div>

          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
          >
            <h3 className="mb-4 font-bold">Alertas de Stock</h3>
            {materiales.filter((m) => m.stockTotal <= 50).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--green)" }}>
                Sin alertas. Todos los materiales tienen stock suficiente.
              </p>
            ) : (
              <div className="space-y-2">
                {materiales
                  .filter((m) => m.stockTotal <= 50)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg border p-3 text-xs"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        borderColor: "rgba(239,68,68,0.2)",
                      }}
                    >
                      <div className="font-bold" style={{ color: "var(--red)" }}>{m.nombre}</div>
                      <div style={{ color: "var(--text3)" }}>
                        Quedan {m.stockTotal} {m.unidad}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
