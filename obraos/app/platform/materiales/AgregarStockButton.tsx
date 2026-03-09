"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AgregarStockButton({
  materialId,
  nombre,
  unidad,
  puedeAgregar,
}: {
  materialId: string;
  nombre: string;
  unidad: string;
  puedeAgregar: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cantidad <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/materiales/${materialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agregarStock: cantidad }),
      });
      if (res.ok) {
        setOpen(false);
        setCantidad(1);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Error al agregar stock");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!puedeAgregar) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] font-semibold"
        style={{ color: "var(--accent)" }}
      >
        + Stock
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border p-4"
            style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 font-bold">Agregar stock: {nombre}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs" style={{ color: "var(--text3)" }}>
                  Cantidad ({unidad})
                </label>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--bg3)",
                    borderColor: "var(--border2)",
                    color: "var(--text)",
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-black"
                  style={{ background: "var(--accent)" }}
                >
                  {loading ? "Agregando…" : "Agregar"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border2)", color: "var(--text2)" }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
