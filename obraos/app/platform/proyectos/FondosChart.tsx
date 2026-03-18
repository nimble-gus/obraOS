"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  series: {
    fecha: string; // YYYY-MM-DD
    presupuesto: number;
    fondos: number;
    ejecucion: number;
  }[];
};

export function FondosChart({ series }: Props) {
  const data = series;

  return (
    <section
      className="mb-6 rounded-2xl border p-5 shadow-sm"
      style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
            Comparativo de fondos y ejecución
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text3)" }}>
            Compara el límite máximo de obra, los fondos desembolsados y la ejecución real del proyecto.
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 24, bottom: 0, left: -10 }}>
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
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 11, color: "var(--text3)" }}
            />
            <Line
              type="monotone"
              dataKey="presupuesto"
              name="Presupuesto de obra (límite)"
              stroke="#6366f1"
              strokeWidth={2.4}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="fondos"
              name="Fondos desembolsados"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="ejecucion"
              name="Gastos ejecutados"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
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

