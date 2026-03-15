"use client";

import { useState, useRef } from "react";
import { ModalNuevoProyecto } from "./ModalNuevoProyecto";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "@/app/components/Link";
import { UnidadesAvanceExpandible } from "./UnidadesAvanceExpandible";

const TIPO_LABEL: Record<string, string> = {
  RESIDENCIAL: "Residencial",
  APARTAMENTOS: "Apartamentos",
  VILLAS: "Villas",
  CONDOMINIO: "Condominio",
  COMERCIAL: "Comercial",
};

type ProyectoCard = {
  id: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  imagenUrl?: string | null;
  numUnidades: number;
  presupuestoObra: number;
  pmAsignado: { nombre: string };
  pctTotal: number;
  pctPorUnidad: { etiqueta: string; numero: number; pct: number }[];
};

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function PhotoCameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ProyectosGrid({
  proyectos,
  pms = [],
  esAdmin = false,
  puedeCrear = false,
}: {
  proyectos: ProyectoCard[];
  pms?: { id: string; nombre: string }[];
  esAdmin?: boolean;
  puedeCrear?: boolean;
}) {
  const router = useRouter();
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleDeleteProject = async (proyectoId: string, nombre: string) => {
    if (!confirm(`¿Eliminar el proyecto "${nombre}"? Se borrarán todas las fases, unidades, planillas y datos asociados. Esta acción no se puede deshacer.`)) return;
    setDeletingId(proyectoId);
    try {
      const res = await fetch(`/api/proyectos/${proyectoId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al eliminar");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar proyecto");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddImage = async (proyectoId: string, file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploadingId(proyectoId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/proyectos/${proyectoId}/imagen`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir imagen");

      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      style={{ gap: "var(--spacing, 16px)" }}
    >
      {proyectos.map((p) => {
        const pct = p.pctTotal;
        const status = pct >= 80 ? "done" : pct >= 20 ? "active" : "planning";
        const colorCss = status === "done" ? "var(--green)" : status === "active" ? "var(--accent)" : "var(--blue)";
        const bgGradient =
          status === "done"
            ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))"
            : status === "active"
              ? "linear-gradient(135deg, rgba(92,149,255,0.15), rgba(92,149,255,0.05))"
              : "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))";

        return (
          <div
            key={p.id}
            className="overflow-hidden rounded-xl transition"
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              className="relative flex h-36 items-center justify-center overflow-hidden"
              style={{ background: p.imagenUrl ? "transparent" : bgGradient }}
            >
              {p.imagenUrl ? (
                <Image
                  src={`/api/proyectos/${p.id}/imagen`}
                  alt={p.nombre}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colorCss }}>
                  {TIPO_LABEL[p.tipo] ?? "Proyecto"}
                </span>
              )}
              {esAdmin && (
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteProject(p.id, p.nombre);
                  }}
                  disabled={deletingId === p.id}
                  className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white transition disabled:opacity-60"
                  style={{
                    background: deletingId === p.id ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.6)",
                  }}
                  aria-label="Eliminar proyecto"
                >
                  {deletingId === p.id ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <CloseIcon />
                  )}
                </button>
              )}
              <span
                className="absolute right-3 top-3 z-10 rounded px-2 py-0.5 text-[10px] font-bold"
                style={{ background: "rgba(15,23,42,0.9)", color: "#f9fafb" }}
              >
                {status === "done" ? `${pct}% LISTO` : status === "active" ? "ACTIVO" : "INICIO"}
              </span>
              {esAdmin && (
                <>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const input = fileInputRefs.current[p.id];
                      if (input) input.click();
                    }}
                    disabled={uploadingId === p.id}
                    className="absolute bottom-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white transition disabled:opacity-60"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    {uploadingId === p.id ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <PhotoCameraIcon />
                    )}
                  </button>
                  <input
                    ref={(el) => { fileInputRefs.current[p.id] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAddImage(p.id, file);
                      e.target.value = "";
                    }}
                  />
                </>
              )}
            </div>
            <Link
              href={`/platform/proyectos/${p.id}`}
              className="block p-4 no-underline transition hover:opacity-95"
              style={{ color: "var(--text)" }}
            >
              <h3 className="font-bold" style={{ color: "var(--text)" }}>{p.nombre}</h3>
              <p className="mt-1 text-xs" style={{ color: "var(--text2)" }}>
                {p.tipo} · {p.ubicacion}
              </p>
              <div className="mt-2 flex gap-4 text-sm" style={{ color: "var(--text2)" }}>
                <span>
                  <strong style={{ color: "var(--text)" }}>{p.numUnidades}</strong> Unidades
                </span>
                <span>
                  <strong style={{ color: "var(--text)" }}>
                    Q{p.presupuestoObra >= 1e6 ? `${(p.presupuestoObra / 1e6).toFixed(1)}M` : Math.round(p.presupuestoObra).toLocaleString()}
                  </strong>{" "}
                  Presupuesto
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bg3)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: colorCss }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs" style={{ color: "var(--text2)" }}>
                <span>
                  PM: <strong style={{ color: "var(--text2)" }}>{p.pmAsignado.nombre}</strong>
                </span>
                <span className="font-semibold" style={{ color: colorCss }}>
                  {pct}% total
                </span>
              </div>
              {p.pctPorUnidad.length > 0 && (
                <UnidadesAvanceExpandible pctPorUnidad={p.pctPorUnidad} pctTotal={pct} color={colorCss} />
              )}
            </Link>
          </div>
        );
      })}

      {puedeCrear && (
        <>
          <button
            type="button"
            onClick={() => setShowModalNuevo(true)}
            className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            style={{
              borderColor: "rgba(148,163,184,0.6)",
              background: "radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 60%)",
              color: "var(--text)",
            }}
          >
            <div
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "rgba(59,130,246,0.12)", color: "var(--accent)" }}
            >
              <AddIcon />
            </div>
            <span className="font-bold">Agregar proyecto</span>
            <span className="mt-1 max-w-[200px] text-center text-sm" style={{ color: "var(--text2)" }}>
              Crea un nuevo proyecto para empezar a dar seguimiento.
            </span>
          </button>
          {showModalNuevo && (
            <ModalNuevoProyecto pms={pms} onClose={() => setShowModalNuevo(false)} />
          )}
        </>
      )}
    </div>
  );
}
