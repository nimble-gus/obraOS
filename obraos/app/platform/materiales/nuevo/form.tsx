"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const UNIDADES = [
  { value: "m²", label: "m²" },
  { value: "m³", label: "m³" },
  { value: "un", label: "unidad" },
  { value: "kg", label: "kg" },
  { value: "qq", label: "quintal" },
  { value: "t", label: "tonelada" },
  { value: "lt", label: "litro" },
  { value: "gl", label: "galón" },
];

export function CrearMaterialForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/admin/materiales/categorias?activa=true")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { slug: string; nombre: string }[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategorias(
            data.map((c) => ({
              value: c.slug,
              label: c.nombre,
            })),
          );
        } else {
          // Fallback a categorías estáticas si aún no hay config en admin
          setCategorias([
            { value: "MAMPOSTERIA", label: "Mampostería" },
            { value: "CIMENTACION", label: "Cimentación" },
            { value: "ESTRUCTURA", label: "Estructura" },
            { value: "ACABADOS", label: "Acabados" },
            { value: "MEZCLAS", label: "Mezclas" },
            { value: "INSTALACIONES", label: "Instalaciones" },
          ]);
        }
      })
      .catch(() => {
        setCategorias([
          { value: "MAMPOSTERIA", label: "Mampostería" },
          { value: "CIMENTACION", label: "Cimentación" },
          { value: "ESTRUCTURA", label: "Estructura" },
          { value: "ACABADOS", label: "Acabados" },
          { value: "MEZCLAS", label: "Mezclas" },
          { value: "INSTALACIONES", label: "Instalaciones" },
        ]);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const res = await fetch("/api/materiales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: fd.get("nombre"),
        categoria: fd.get("categoria"),
        unidad: fd.get("unidad"),
        stockTotal: parseInt((fd.get("stockTotal") as string) || "0") || 0,
        costoUnitario: parseFloat((fd.get("costoUnitario") as string) || "0") || 0,
        presupuestoAsignado: (() => {
          const v = fd.get("presupuestoAsignado") as string;
          return v && !isNaN(parseFloat(v)) ? parseFloat(v) : null;
        })(),
        colorHex: (fd.get("colorHex") as string) || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      alert(data.error ?? "Error al crear material");
      return;
    }
    router.push("/platform/materiales");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border p-6"
      style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
    >
      <div>
        <label
          className="mb-1 block font-mono text-[11px] uppercase tracking-wider"
          style={{ color: "var(--text2)" }}
        >
          Nombre
        </label>
        <input
          name="nombre"
          required
          placeholder="Ej. Block 15x20"
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          style={{
            background: "var(--bg3)",
            borderColor: "var(--border2)",
            color: "var(--text)",
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="mb-1 block font-mono text-[11px] uppercase tracking-wider"
            style={{ color: "var(--text2)" }}
          >
            Categoría
          </label>
          <select
            name="categoria"
            required
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            style={{
              background: "var(--bg3)",
              borderColor: "var(--border2)",
              color: "var(--text)",
            }}
          >
            {categorias.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="mb-1 block font-mono text-[11px] uppercase tracking-wider"
            style={{ color: "var(--text2)" }}
          >
            Unidad
          </label>
          <select
            name="unidad"
            required
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            style={{
              background: "var(--bg3)",
              borderColor: "var(--border2)",
              color: "var(--text)",
            }}
          >
            {UNIDADES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="mb-1 block font-mono text-[11px] uppercase tracking-wider"
            style={{ color: "var(--text2)" }}
          >
            Stock inicial
          </label>
          <input
            name="stockTotal"
            type="number"
            min="0"
            defaultValue="0"
            placeholder="0"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            style={{
              background: "var(--bg3)",
              borderColor: "var(--border2)",
              color: "var(--text)",
            }}
          />
        </div>
        <div>
          <label
            className="mb-1 block font-mono text-[11px] uppercase tracking-wider"
            style={{ color: "var(--text2)" }}
          >
            Costo unitario (Q)
          </label>
          <input
            name="costoUnitario"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            style={{
              background: "var(--bg3)",
              borderColor: "var(--border2)",
              color: "var(--text)",
            }}
          />
        </div>
      </div>
        <div>
          <label
            className="mb-1 block font-mono text-[11px] uppercase tracking-wider"
            style={{ color: "var(--text2)" }}
          >
            Presupuesto asignado (Q, opcional)
          </label>
          <input
            name="presupuestoAsignado"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            style={{
              background: "var(--bg3)",
              borderColor: "var(--border2)",
              color: "var(--text)",
            }}
          />
        </div>
        <div>
          <label
            className="mb-1 block font-mono text-[11px] uppercase tracking-wider"
            style={{ color: "var(--text2)" }}
          >
            Color (hex, opcional)
          </label>
        <input
          name="colorHex"
          type="text"
          placeholder="#2980b9"
          maxLength={7}
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          style={{
            background: "var(--bg3)",
            borderColor: "var(--border2)",
            color: "var(--text)",
          }}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {loading ? "Creando…" : "Agregar Material →"}
        </button>
        <Link
          href="/platform/materiales"
          className="rounded-lg border px-4 py-2.5 text-sm font-medium transition"
          style={{ borderColor: "var(--border2)", color: "var(--text2)" }}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
