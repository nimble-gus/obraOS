"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TipoServicio = { id: string; nombre: string; orden: number };

export function NuevoServicioForm({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState<TipoServicio[]>([]);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    fetch("/api/tipos-servicio")
      .then((r) => r.ok ? r.json() : [])
      .then(setTipos);
  }, []);

  function onTipoChange(tipoId: string) {
    const tipo = tipos.find((t) => t.id === tipoId);
    if (tipo) setNombre(tipo.nombre);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const res = await fetch("/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: fd.get("nombre"),
        unidad: fd.get("unidad"),
        costoUnitario: parseFloat(fd.get("costoUnitario") as string) || 0,
        tipoServicioId: fd.get("tipoServicioId") || undefined,
      }),
    });

    if (res.ok) {
      router.push("/platform/servicios");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      alert(data?.error || "Error al crear servicio");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 rounded-xl border p-6 ${className}`}
      style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
    >
      {tipos.length === 0 && (
        <div className="rounded-lg border px-3 py-2 text-sm" style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text2)" }}>
          No hay tipos de servicio. Crea tipos en <Link href="/admin/tipos-servicio" className="underline">Admin &gt; Tipos de servicio</Link> antes de agregar servicios.
        </div>
      )}
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--text2)" }}>
          Tipo de servicio
        </label>
        <select
          name="tipoServicioId"
          required
          disabled={tipos.length === 0}
          onChange={(e) => onTipoChange(e.target.value)}
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          style={{
            background: "var(--bg3)",
            borderColor: "var(--border2)",
            color: "var(--text)",
          }}
        >
          <option value="">— Seleccionar —</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--text2)" }}>
          Nombre
        </label>
        <input
          name="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          placeholder="Se completa al elegir tipo; edita si necesitas más detalle"
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          style={{
            background: "var(--bg3)",
            borderColor: "var(--border2)",
            color: "var(--text)",
          }}
        />
      </div>
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--text2)" }}>
          Unidad
        </label>
        <input
          name="unidad"
          required
          placeholder="Ej. día, viaje, mes"
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          style={{
            background: "var(--bg3)",
            borderColor: "var(--border2)",
            color: "var(--text)",
          }}
        />
      </div>
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--text2)" }}>
          Costo unitario (Q)
        </label>
        <input
          name="costoUnitario"
          type="number"
          step="0.01"
          min="0"
          required
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
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
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-black"
          style={{ background: "var(--accent)" }}
        >
          {loading ? "Guardando…" : "Crear"}
        </button>
        <Link
          href="/platform/servicios"
          className="rounded-lg border px-4 py-2.5 text-sm"
          style={{ borderColor: "var(--border2)", color: "var(--text2)" }}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
