"use client";

import { useState } from "react";

type UnidadPct = { etiqueta: string; numero: number; pct: number };

export function UnidadesAvanceExpandible({
  pctPorUnidad,
  pctTotal,
  color,
}: {
  pctPorUnidad: UnidadPct[];
  pctTotal: number;
  color: string;
}) {
  const [expandido, setExpandido] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandido((v) => !v);
  };

  return (
    <div className="mt-1.5" onClick={handleClick}>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between rounded border px-2 py-1.5 text-left text-[11px] transition hover:bg-black/5"
        style={{ borderColor: "var(--border2)" }}
      >
        <span style={{ color: "var(--text3)" }}>
          Ver {pctPorUnidad.length} unidades · {pctTotal}% total
        </span>
        <span
          className="shrink-0 transition-transform"
          style={{
            transform: expandido ? "rotate(180deg)" : "rotate(0deg)",
            color: "var(--text3)",
            fontSize: "8px",
          }}
        >
          ▼
        </span>
      </button>
      {expandido && (
        <div
          className="mt-1.5 max-h-24 space-y-1 overflow-y-auto rounded border px-2 py-1.5"
          style={{
            background: "var(--bg3)",
            borderColor: "var(--border2)",
          }}
        >
          {pctPorUnidad.map((u) => (
            <div
              key={u.numero}
              className="flex items-center justify-between font-mono text-[10px]"
            >
              <span style={{ color: "var(--text2)" }}>{u.etiqueta}</span>
              <span
                style={{
                  color:
                    u.pct >= 80 ? "var(--green)" : u.pct >= 20 ? "var(--accent)" : "var(--text3)",
                }}
              >
                {u.pct}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
