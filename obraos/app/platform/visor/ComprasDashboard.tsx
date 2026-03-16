"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";

type DashboardResponse = {
  resumen: {
    materiales: number;
    planilla: number;
    otrosCostos: number;
    total: number;
  };
  seriesDiaria: {
    fecha: string;
    materiales: number;
    planilla: number;
    otrosCostos: number;
    total: number;
  }[];
};

type UnidadOpcion = {
  id: string;
  etiqueta: string;
  numero: number;
};

export function ComprasDashboard({
  proyectoId,
  unidades,
}: {
  proyectoId: string;
  unidades: UnidadOpcion[];
}) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unidadId, setUnidadId] = useState<string | "all">("all");

  useEffect(() => {
    if (!proyectoId) return;
    setLoading(true);
    setError(null);
    const search = unidadId && unidadId !== "all" ? `?unidad=${unidadId}` : "";
    fetch(`/api/proyectos/${proyectoId}/compras-dashboard${search}`)
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error ?? "Error al cargar dashboard de compras");
        }
        return r.json();
      })
      .then((json: DashboardResponse) => {
        setData(json);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Error");
      })
      .finally(() => setLoading(false));
  }, [proyectoId, unidadId]);

  const series = useMemo(
    () => data?.seriesDiaria ?? [],
    [data?.seriesDiaria],
  );

  const resumen = data?.resumen;

  return (
    <section className="rounded-2xl border p-5 shadow-sm" style={{ background: "var(--bg2)", borderColor: "var(--border)" }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
            Dashboard de compras por rubro
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text3)" }}>
            Evolución diaria de desembolsos en planilla, materiales y otros costos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px]" style={{ color: "var(--text3)" }}>
            Vista:
          </span>
          <select
            value={unidadId}
            onChange={(e) => setUnidadId(e.target.value as "all" | string)}
            className="rounded-lg border px-2 py-1 text-xs"
            style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <option value="all">Proyecto completo</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.etiqueta || `Unidad ${u.numero}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <p className="text-sm" style={{ color: "var(--text3)" }}>
          Cargando indicadores de compras...
        </p>
      )}

      {error && !loading && (
        <p className="text-sm" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}

      {!loading && !error && data && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <ResumenCard
              titulo="Total desembolsado"
              monto={resumen?.total ?? 0}
              badge="Global"
            />
            <ResumenCard
              titulo="Planilla"
              monto={resumen?.planilla ?? 0}
              badge="Mano de obra"
            />
            <ResumenCard
              titulo="Materiales"
              monto={resumen?.materiales ?? 0}
              badge="Compras"
            />
            <ResumenCard
              titulo="Otros costos"
              monto={resumen?.otrosCostos ?? 0}
              badge="Servicios"
            />
          </div>

          {series.length === 0 ? (
            <p className="mt-2 text-sm" style={{ color: "var(--text3)" }}>
              Aún no hay movimientos de compras registrados para este proyecto.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={series}
                  margin={{ top: 12, right: 24, bottom: 0, left: -16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 11, fill: "var(--text3)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text3)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatMiles(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg3)",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                    formatter={(value) =>
                      typeof value === "number" ? formatMoneda(value) : (value as string | number)
                    }
                    labelFormatter={(label) => `Día ${label}`}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, color: "var(--text3)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="planilla"
                    name="Planilla"
                    stroke="var(--accent)"
                    strokeWidth={2.2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="materiales"
                    name="Materiales"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="otrosCostos"
                    name="Otros costos"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ResumenCard({
  titulo,
  monto,
  badge,
}: {
  titulo: string;
  monto: number;
  badge?: string;
}) {
  return (
    <div
      className="rounded-xl border p-3.5"
      style={{ background: "var(--bg3)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--text3)" }}>
            {titulo}
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums" style={{ color: "var(--text)" }}>
            {formatMoneda(monto)}
          </p>
        </div>
        {badge && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: "rgba(148,163,184,0.16)", color: "var(--text2)" }}
          >
            {badge}
          </span>
        )}
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

function formatMiles(valor: number): string {
  if (!valor) return "0";
  return new Intl.NumberFormat("es-GT", {
    maximumFractionDigits: 0,
  }).format(valor);
}

