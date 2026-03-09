"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ModeloCasa = {
  id: string;
  nombre: string;
  anchoExterior: number;
  profundidadExterior: number;
  alturaParedes: number;
  grosorMuro: number;
  tipoTecho: string;
  numVentanasFront: number;
  numVentanasSide: number;
  tienePuerta: boolean;
};

type Unidad = { id: string; etiqueta: string; modeloCasaId?: string | null; modeloCasa?: ModeloCasa | null };

export function EditorDiseñoButton({ unidades = [] }: { unidades?: Array<{ modeloCasa?: unknown }> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [modelos, setModelos] = useState<ModeloCasa[]>([]);
  const [modelo, setModelo] = useState<ModeloCasa | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/modelos-casa")
        .then((r) => (r.ok ? r.json() : []))
        .then((list) => {
          setModelos(list);
          const def = list[0] ?? (unidades.find((u) => u.modeloCasa)?.modeloCasa as ModeloCasa | undefined) ?? null;
          setModelo(def ? { ...def } : null);
        })
        .catch(() => setModelos([]));
    }
  }, [open, unidades]);

  const save = async () => {
    if (!modelo) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/modelos-casa/${modelo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modelo),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al guardar");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded px-3 py-1.5 text-[11px] font-semibold transition"
        style={{
          background: "var(--bg3)",
          color: "var(--text2)",
          border: "1px solid var(--border2)",
        }}
        title="Editor de diseño"
      >
        ✎ Diseño
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border p-4"
            style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 font-bold">Editor de diseño</h3>
            {modelos.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text3)" }}>Cargando modelos…</p>
            ) : !modelo ? (
              <p className="text-sm" style={{ color: "var(--text3)" }}>Selecciona un modelo</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs" style={{ color: "var(--text3)" }}>Modelo</label>
                  <select
                    value={modelo.id}
                    onChange={(e) => {
                      const m = modelos.find((x) => x.id === e.target.value);
                      if (m) setModelo({ ...m });
                    }}
                    className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                    style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                  >
                    {modelos.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs" style={{ color: "var(--text3)" }}>Ancho (m)</label>
                    <input
                      type="number"
                      min={2}
                      max={50}
                      step={0.5}
                      value={modelo.anchoExterior}
                      onChange={(e) => setModelo({ ...modelo, anchoExterior: Number(e.target.value) })}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                      style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs" style={{ color: "var(--text3)" }}>Profundidad (m)</label>
                    <input
                      type="number"
                      min={2}
                      max={50}
                      step={0.5}
                      value={modelo.profundidadExterior}
                      onChange={(e) => setModelo({ ...modelo, profundidadExterior: Number(e.target.value) })}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                      style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs" style={{ color: "var(--text3)" }}>Altura paredes (m)</label>
                    <input
                      type="number"
                      min={2}
                      max={50}
                      step={0.5}
                      value={modelo.alturaParedes}
                      onChange={(e) => setModelo({ ...modelo, alturaParedes: Number(e.target.value) })}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                      style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs" style={{ color: "var(--text3)" }}>Tipo techo</label>
                    <select
                      value={modelo.tipoTecho}
                      onChange={(e) => setModelo({ ...modelo, tipoTecho: e.target.value })}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                      style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                    >
                      <option value="PIRAMIDAL">Piramidal</option>
                      <option value="PLANO">Plano</option>
                      <option value="DOS_AGUAS">Dos aguas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs" style={{ color: "var(--text3)" }}>Ventanas fachada</label>
                    <input
                      type="number"
                      min={0}
                      max={4}
                      value={modelo.numVentanasFront}
                      onChange={(e) => setModelo({ ...modelo, numVentanasFront: Number(e.target.value) })}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                      style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs" style={{ color: "var(--text3)" }}>Ventanas laterales</label>
                    <input
                      type="number"
                      min={0}
                      max={3}
                      value={modelo.numVentanasSide}
                      onChange={(e) => setModelo({ ...modelo, numVentanasSide: Number(e.target.value) })}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                      style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={modelo.tienePuerta}
                    onChange={(e) => setModelo({ ...modelo, tienePuerta: e.target.checked })}
                  />
                  Tiene puerta
                </label>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="rounded px-3 py-2 text-sm font-semibold text-black"
                    style={{ background: "var(--accent)" }}
                  >
                    {saving ? "Guardando…" : "Guardar diseño"}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border2)", color: "var(--text2)" }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
