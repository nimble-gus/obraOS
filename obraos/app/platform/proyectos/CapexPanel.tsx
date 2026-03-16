"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PresupuestoRubro = {
  rubro: string;
  pctPresupuesto: number; // 0-1 en DB
};

type Props = {
  proyectoId: string;
  precioVenta: number;
  presupuestoTotal?: number | null;
  margenObjetivo: number; // 0-1
  pctCostosIndirectos: number; // 0-1
  pctContingencia: number; // 0-1
  presupuestoRubros: PresupuestoRubro[];
  puedeEditar: boolean;
};

const RUBROS_BASE = ["materiales", "planilla", "otros"];

export function CapexPanel({
  proyectoId,
  precioVenta,
  presupuestoTotal,
  margenObjetivo,
  pctCostosIndirectos,
  pctContingencia,
  presupuestoRubros,
  puedeEditar,
}: Props) {
  const router = useRouter();
  const [presupuesto, setPresupuesto] = useState<number | "">(
    presupuestoTotal ?? "",
  );
  const [margen, setMargen] = useState(Math.round(margenObjetivo * 100));
  const [indirectos, setIndirectos] = useState(
    Math.round(pctCostosIndirectos * 100),
  );
  const [contingencia, setContingencia] = useState(
    Math.round(pctContingencia * 100),
  );

  const byRubro: Record<string, number> = {};
  for (const r of presupuestoRubros) {
    byRubro[r.rubro] = Math.round((r.pctPresupuesto ?? 0) * 100);
  }
  const [rubrosPct, setRubrosPct] = useState<Record<string, number>>({
    materiales: byRubro.materiales ?? 0,
    planilla: byRubro.planilla ?? 0,
    otros: byRubro.otros ?? 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const totalPctRubros =
    (rubrosPct.materiales ?? 0) +
    (rubrosPct.planilla ?? 0) +
    (rubrosPct.otros ?? 0);

  const presupuestoObra =
    (typeof presupuesto === "number" ? presupuesto : 0) *
    Math.max(
      0,
      1 - (margen + indirectos + contingencia) / 100,
    );

  async function handleSave() {
    if (!puedeEditar) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/proyectos/${proyectoId}/capex`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          precioVenta,
          presupuestoTotal:
            typeof presupuesto === "number" ? presupuesto : null,
          margenObjetivoPct: margen,
          pctIndirectosPct: indirectos,
          pctContingenciaPct: contingencia,
          rubros: {
            materiales: rubrosPct.materiales ?? 0,
            planilla: rubrosPct.planilla ?? 0,
            otros: rubrosPct.otros ?? 0,
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Error al guardar CAPEX");
      }
      setSaved(true);
      // Refrescar los datos del server component (tarjetas de abajo)
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar CAPEX");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="mb-6 rounded-xl border p-5"
      style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
            CAPEX del proyecto
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text3)" }}>
            Define presupuesto, utilidad, contingencia e índices máximos por rubro.
          </p>
        </div>
        {puedeEditar && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {saving ? "Guardando..." : "Guardar CAPEX"}
          </button>
        )}
      </div>

      {error && (
        <div
          className="mb-3 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "var(--red)", color: "var(--red)", background: "rgba(239,68,68,0.06)" }}
        >
          {error}
        </div>
      )}
      {saved && (
        <div
          className="mb-3 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "var(--green)", color: "var(--green)", background: "rgba(34,197,94,0.06)" }}
        >
          Cambios guardados.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text3)" }}>
              Presupuesto total de obra (Q)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              disabled={!puedeEditar}
              value={presupuesto === "" ? "" : presupuesto}
              onChange={(e) =>
                setPresupuesto(e.target.value ? Number(e.target.value) : "")
              }
              className="mt-1 w-full rounded-lg border px-3 py-1.5 text-sm"
              style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between">
              <span style={{ color: "var(--text3)" }}>Obra directa estimada</span>
              <span className="font-semibold tabular-nums" style={{ color: "var(--text)" }}>
                {formatMoneda(presupuestoObra)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium" style={{ color: "var(--text3)" }}>
            Estructura financiera (% sobre precio de venta)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <PctInput
              label="Utilidad"
              value={margen}
              onChange={setMargen}
              disabled={!puedeEditar}
            />
            <PctInput
              label="Indirectos"
              value={indirectos}
              onChange={setIndirectos}
              disabled={!puedeEditar}
            />
            <PctInput
              label="Contingencia"
              value={contingencia}
              onChange={setContingencia}
              disabled={!puedeEditar}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium" style={{ color: "var(--text3)" }}>
            Límite por rubro (% del presupuesto de obra)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {RUBROS_BASE.map((r) => (
              <PctInput
                key={r}
                label={r === "otros" ? "Otros costos" : r[0].toUpperCase() + r.slice(1)}
                value={rubrosPct[r] ?? 0}
                onChange={(v) =>
                  setRubrosPct((prev) => ({
                    ...prev,
                    [r]: v,
                  }))
                }
                disabled={!puedeEditar}
              />
            ))}
          </div>
          <div className="text-[11px]" style={{ color: totalPctRubros === 100 ? "var(--green)" : "var(--text3)" }}>
            Suma rubros: {totalPctRubros}% {totalPctRubros !== 100 && "(ideal: 100%)"}
          </div>
        </div>
      </div>
    </section>
  );
}

function PctInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <span className="block text-[11px]" style={{ color: "var(--text3)" }}>
        {label}
      </span>
      <div className="mt-0.5 flex items-center gap-1 rounded-lg border px-2 py-1" style={{ borderColor: "var(--border)", background: "var(--bg3)" }}>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : 0)}
          className="w-full border-none bg-transparent text-xs outline-none"
          style={{ color: "var(--text)" }}
        />
        <span className="text-[10px]" style={{ color: "var(--text3)" }}>
          %
        </span>
      </div>
    </div>
  );
}

function formatMoneda(valor: number): string {
  if (!valor) return "Q0";
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 0,
  }).format(valor);
}

