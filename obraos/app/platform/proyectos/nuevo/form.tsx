"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CrearProyectoForm({
  pms,
}: {
  pms: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const res = await fetch("/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: fd.get("nombre"),
        tipo: fd.get("tipo"),
        ubicacion: fd.get("ubicacion"),
        numUnidades: parseInt(fd.get("numUnidades") as string) || 0,
        pmAsignadoId: (fd.get("pmAsignadoId") as string) || pms[0]?.id,
        precioVenta: parseFloat(fd.get("precioVenta") as string) || 0,
        presupuestoTotal: (() => {
          const v = fd.get("presupuestoTotal") as string;
          return v && !isNaN(parseFloat(v)) ? parseFloat(v) : null;
        })(),
        margenObjetivo: parseFloat(fd.get("margenObjetivo") as string) / 100 || 0.25,
        pctCostosIndirectos: parseFloat(fd.get("pctCostosIndirectos") as string) / 100 || 0.12,
        pctContingencia: parseFloat(fd.get("pctContingencia") as string) / 100 || 0.05,
      }),
    });

    if (!res.ok) {
      setLoading(false);
      alert("Error al crear proyecto");
      return;
    }
    const data = await res.json();
    router.push(`/platform/proyectos/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-6" style={{ background: "var(--bg2)", borderColor: "var(--border)" }}>
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--text2)" }}>Nombre del Proyecto</label>
        <input
          name="nombre"
          required
          placeholder="Ej. Residencial Los Altos"
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase" style={{ color: "var(--text2)" }}>Tipo</label>
          <select
            name="tipo"
            required
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
          >
            <option value="RESIDENCIAL">Residencial</option>
            <option value="APARTAMENTOS">Apartamentos</option>
            <option value="VILLAS">Villas</option>
            <option value="CONDOMINIO">Condominio</option>
            <option value="COMERCIAL">Comercial</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase" style={{ color: "var(--text2)" }}>Ubicación</label>
          <input
            name="ubicacion"
            required
            placeholder="Zona 16, Guatemala"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase" style={{ color: "var(--text2)" }}>N° Unidades</label>
          <input name="numUnidades" type="number" required placeholder="24" min="1"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase" style={{ color: "var(--text2)" }}>Precio Venta (Q)</label>
          <input name="precioVenta" type="number" required placeholder="3200000" min="0"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
          />
        </div>
      </div>
        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase" style={{ color: "var(--text2)" }}>Presupuesto de obra (Q)</label>
          <input
            name="presupuestoTotal"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej. 2500000"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase" style={{ color: "var(--text2)" }}>PM Asignado</label>
        <select
          name="pmAsignadoId"
          required
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
        >
          {pms.length === 0 && (
            <option value="">Crea un usuario con rol PROJECT_MANAGER primero</option>
          )}
          {pms.map((pm) => (
            <option key={pm.id} value={pm.id}>{pm.nombre}</option>
          ))}
        </select>
      </div>
      <div className="rounded-lg border p-4" style={{ background: "var(--bg3)", borderColor: "var(--border2)" }}>
        <div className="mb-3 font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--accent)" }}>Parámetros Financieros</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-[10px]" style={{ color: "var(--text2)" }}>% Margen Objetivo</label>
            <input name="margenObjetivo" type="number" placeholder="25" defaultValue="25" min="0" max="100"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              style={{ background: "var(--bg2)", borderColor: "var(--border2)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px]" style={{ color: "var(--text2)" }}>% Costos Indirectos</label>
            <input name="pctCostosIndirectos" type="number" placeholder="12" defaultValue="12" min="0" max="100"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              style={{ background: "var(--bg2)", borderColor: "var(--border2)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px]" style={{ color: "var(--text2)" }}>% Contingencia</label>
            <input name="pctContingencia" type="number" placeholder="5" defaultValue="5" min="0" max="100"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              style={{ background: "var(--bg2)", borderColor: "var(--border2)", color: "var(--text)" }}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {loading ? "Creando…" : "Crear Proyecto →"}
        </button>
        <Link
          href="/platform/proyectos"
          className="rounded-lg border px-4 py-2.5 text-sm font-medium transition"
          style={{ borderColor: "var(--border2)", color: "var(--text2)" }}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
