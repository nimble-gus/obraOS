"use client";

import { useState, useEffect } from "react";

export function ProyeccionCard({
  materialId,
  nombre,
  unidad,
  stockTotal,
}: {
  materialId: string;
  nombre: string;
  unidad: string;
  stockTotal: number;
}) {
  const [loading, setLoading] = useState(true);
  const [proyeccion, setProyeccion] = useState<{
    diasHastaAgotamiento: number | null;
    consumoPromedioPorDia: number;
    diasAnalizados: number;
    mensaje: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/materiales/${materialId}/proyeccion?dias=30`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => res?.proyeccion ?? null)
      .then(setProyeccion)
      .finally(() => setLoading(false));
  }, [materialId]);

  if (loading || !proyeccion) return null;

  if (stockTotal <= 0) {
    return (
      <div
        className="rounded-lg border p-3 text-xs"
        style={{
          background: "rgba(239,68,68,0.08)",
          borderColor: "rgba(239,68,68,0.2)",
        }}
      >
        <div className="font-bold" style={{ color: "var(--red)" }}>{nombre}</div>
        <div style={{ color: "var(--text3)" }}>Stock agotado</div>
      </div>
    );
  }

  const dias = proyeccion.diasHastaAgotamiento;
  const isBajo = dias != null && dias <= 30;
  const color = dias == null ? "var(--text3)" : isBajo ? "var(--red)" : "var(--green)";

  return (
    <div
      className="rounded-lg border p-3 text-xs"
      style={{
        background: isBajo ? "rgba(239,68,68,0.08)" : "var(--bg3)",
        borderColor: isBajo ? "rgba(239,68,68,0.2)" : "var(--border2)",
      }}
    >
      <div className="font-bold" style={{ color: "var(--text)" }}>{nombre}</div>
      <div className="mt-0.5 font-mono" style={{ color }}>
        {dias != null
          ? `~${dias} días hasta agotamiento`
          : "Sin consumo reciente"}
      </div>
      {proyeccion.consumoPromedioPorDia > 0 && (
        <div className="mt-0.5" style={{ color: "var(--text3)" }}>
          {proyeccion.consumoPromedioPorDia.toFixed(1)} {unidad}/día
        </div>
      )}
    </div>
  );
}
