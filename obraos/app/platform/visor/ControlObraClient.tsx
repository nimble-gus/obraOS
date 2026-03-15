"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WizardCrearBloque } from "./WizardCrearBloque";

type Fase = {
  id: string;
  nombre: string;
  orden: number;
  status: string;
  pctAvance: number;
  tareas: {
    id: string;
    nombre: string;
    cantidadM2: number;
    cantidadM3: number;
    fechaInicio?: string | null;
    fechaFin?: string | null;
  }[];
};

type Unidad = {
  id: string;
  numero: number;
  etiqueta: string;
  pctAvanceGlobal: number;
  fechaEntregaEstimada?: string | null;
};

type Proyecto = {
  id: string;
  nombre: string;
  numUnidades: number;
  fases: Fase[];
  unidades: Unidad[];
};

export function ControlObraClient({
  proyectoId,
  proyecto,
}: {
  proyectoId: string | null;
  proyecto: Proyecto | null;
}) {
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(false);
  const [editandoUnidad, setEditandoUnidad] = useState<Unidad | null>(null);

  if (!proyectoId || !proyecto) {
    return (
      <p className="mt-6 text-sm" style={{ color: "var(--text3)" }}>
        Selecciona un proyecto para gestionar sus Bloques (unidades).
      </p>
    );
  }

  const totalM2PorFase = (fase: Fase) =>
    fase.tareas.reduce((s, t) => s + (t.cantidadM2 ?? 0), 0);
  const totalM3PorFase = (fase: Fase) =>
    fase.tareas.reduce((s, t) => s + (t.cantidadM3 ?? 0), 0);

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
          Bloques (unidades) — {proyecto.nombre}
        </h2>
        <button
          onClick={() => setShowWizard(true)}
          disabled={proyecto.unidades.length >= proyecto.numUnidades}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          + Crear Bloque
        </button>
      </div>

      {proyecto.unidades.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-12 text-center"
          style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
        >
          <p className="font-medium">No hay Bloques en este proyecto</p>
          <p className="mt-1 text-sm">Crea el primer Bloque con el asistente paso a paso.</p>
          <button
            onClick={() => setShowWizard(true)}
            className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Crear primer Bloque
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proyecto.unidades.map((u) => {
            const pct = Math.round(u.pctAvanceGlobal);
            const colorBarra = pct >= 100 ? "var(--green)" : pct >= 50 ? "var(--accent)" : "var(--blue)";
            return (
            <div
              key={u.id}
              className="relative rounded-xl border p-4 transition hover:border-[var(--accent)]"
              style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditandoUnidad(u);
                }}
                className="absolute right-3 top-3 rounded p-1.5 text-xs font-medium transition hover:opacity-80"
                style={{ color: "var(--text3)", background: "var(--bg3)" }}
                title="Editar unidad"
              >
                Editar
              </button>
              <Link
                href={`/platform/proyectos/${proyectoId}/unidades/${u.id}`}
                className="block pr-16"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="font-bold" style={{ color: "var(--text)" }}>
                  {u.etiqueta}
                </div>
                <div className="mt-1 text-sm" style={{ color: "var(--text3)" }}>
                  Bloque {u.numero} · {pct}% avance
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bg3)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, pct)}%`, background: colorBarra }}
                  />
                </div>
                {proyecto.fases.length > 0 && (
                  <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                    {proyecto.fases.slice(0, 3).map((f) => (
                      <div key={f.id} className="flex justify-between text-xs" style={{ color: "var(--text2)" }}>
                        <span>{f.nombre}</span>
                        <span className="font-mono">
                          {totalM2PorFase(f) > 0 && `${totalM2PorFase(f)} m²`}
                          {totalM2PorFase(f) > 0 && totalM3PorFase(f) > 0 && " · "}
                          {totalM3PorFase(f) > 0 && `${totalM3PorFase(f)} m³`}
                        </span>
                      </div>
                    ))}
                    {proyecto.fases.length > 3 && (
                      <div className="text-xs" style={{ color: "var(--text3)" }}>
                        +{proyecto.fases.length - 3} fases más
                      </div>
                    )}
                  </div>
                )}
              </Link>
            </div>
          );
          })}
        </div>
      )}

      {showWizard && (
        <WizardCrearBloque
          proyectoId={proyectoId}
          fasesExistentes={proyecto.fases}
          onClose={() => {
            setShowWizard(false);
            router.refresh();
          }}
          onSuccess={() => {
            setShowWizard(false);
            router.refresh();
          }}
        />
      )}

      {editandoUnidad && (
        <WizardCrearBloque
          proyectoId={proyectoId}
          fasesExistentes={proyecto.fases}
          unidad={editandoUnidad}
          onClose={() => setEditandoUnidad(null)}
          onSuccess={() => {
            setEditandoUnidad(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

