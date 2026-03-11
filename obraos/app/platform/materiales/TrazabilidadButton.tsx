"use client";

import { useState, useEffect } from "react";

export function TrazabilidadButton({
  materialId,
  nombre,
  unidad,
}: {
  materialId: string;
  nombre: string;
  unidad: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    material: { nombre: string; unidad: string; stockTotal: number };
    movimientos: {
      id: string;
      tipo: string;
      cantidad: number;
      saldoAntes: number | null;
      saldoDespues: number | null;
      createdAt: string;
      unidad?: { etiqueta: string } | null;
    }[];
  } | null>(null);

  useEffect(() => {
    if (open && materialId) {
      setLoading(true);
      fetch(`/api/materiales/${materialId}/movimientos?limit=30`)
        .then((r) => (r.ok ? r.json() : null))
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [open, materialId]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] font-semibold"
        style={{ color: "var(--accent)" }}
      >
        Trazabilidad
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-xl overflow-hidden rounded-xl border"
            style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Trazabilidad: {nombre}</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[10px] font-medium"
                  style={{ color: "var(--text3)" }}
                >
                  Cerrar ×
                </button>
              </div>
              {data && (
                <p className="mt-0.5 text-xs" style={{ color: "var(--text3)" }}>
                  Stock actual: {data.material.stockTotal} {unidad}
                </p>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {loading ? (
                <p className="py-8 text-center text-sm" style={{ color: "var(--text3)" }}>
                  Cargando…
                </p>
              ) : data && data.movimientos.length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr
                      style={{
                        background: "var(--bg3)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <th className="px-3 py-2 text-left font-mono text-[9px] uppercase" style={{ color: "var(--text3)" }}>Fecha</th>
                      <th className="px-3 py-2 text-left font-mono text-[9px] uppercase" style={{ color: "var(--text3)" }}>Tipo</th>
                      <th className="px-3 py-2 text-right font-mono text-[9px] uppercase" style={{ color: "var(--text3)" }}>Cantidad</th>
                      <th className="px-3 py-2 text-right font-mono text-[9px] uppercase" style={{ color: "var(--text3)" }}>Saldo antes</th>
                      <th className="px-3 py-2 text-right font-mono text-[9px] uppercase" style={{ color: "var(--text3)" }}>Saldo después</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.movimientos.map((m) => (
                      <tr key={m.id} style={{ borderBottom: "1px solid var(--border2)" }}>
                        <td className="px-3 py-2" style={{ color: "var(--text2)" }}>
                          {new Date(m.createdAt).toLocaleString("es-GT", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                            style={{
                              background: m.tipo === "ENTRADA" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                              color: m.tipo === "ENTRADA" ? "var(--green)" : "var(--red)",
                            }}
                          >
                            {m.tipo}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {m.tipo === "ENTRADA" ? "+" : "-"}
                          {m.cantidad}
                        </td>
                        <td className="px-3 py-2 text-right font-mono" style={{ color: "var(--text2)" }}>
                          {m.saldoAntes ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono" style={{ color: "var(--text)" }}>
                          {m.saldoDespues ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : data ? (
                <p className="py-8 text-center text-sm" style={{ color: "var(--text3)" }}>
                  Sin movimientos registrados
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
