"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Categoria = {
  id: string;
  slug: string;
  nombre: string;
  orden: number;
  activa: boolean;
};

const SLUG_LABELS: Record<string, string> = {
  MAMPOSTERIA: "Mampostería",
  CIMENTACION: "Cimentación",
  ESTRUCTURA: "Estructura",
  ACABADOS: "Acabados",
  MEZCLAS: "Mezclas",
  INSTALACIONES: "Instalaciones",
};

export function CategoriasMaterialClient({
  categoriasIniciales,
}: {
  categoriasIniciales: Categoria[];
}) {
  const router = useRouter();
  const [slugNuevo, setSlugNuevo] = useState("");
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [ordenNuevo, setOrdenNuevo] = useState<number | "">("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editOrden, setEditOrden] = useState<number | "">("");
  const [editActiva, setEditActiva] = useState<boolean>(true);

  const usados = new Set(categoriasIniciales.map((c) => c.slug));
  const slugsDisponibles = Object.keys(SLUG_LABELS).filter(
    (s) => !usados.has(s),
  );

  const crear = async () => {
    if (!slugNuevo || !nombreNuevo.trim()) return;
    const res = await fetch("/api/admin/materiales/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slugNuevo,
        nombre: nombreNuevo.trim(),
        orden: typeof ordenNuevo === "number" ? ordenNuevo : 0,
      }),
    });
    if (res.ok) {
      setSlugNuevo("");
      setNombreNuevo("");
      setOrdenNuevo("");
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Error al crear categoría");
    }
  };

  const guardarEdicion = async (id: string) => {
    if (!editNombre.trim()) return;
    const res = await fetch("/api/admin/materiales/categorias", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        nombre: editNombre.trim(),
        orden: typeof editOrden === "number" ? editOrden : undefined,
        activa: editActiva,
      }),
    });
    if (res.ok) {
      setEditandoId(null);
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Error al actualizar categoría");
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const res = await fetch(
      `/api/admin/materiales/categorias?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    if (res.ok) router.refresh();
    else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Error al eliminar categoría");
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: "var(--text3)" }}>
          {categoriasIniciales.length} categorías
        </span>
      </div>

      {/* Crear nueva */}
      {slugsDisponibles.length > 0 && (
        <div
          className="flex flex-wrap items-end gap-3 rounded-xl border p-4"
          style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
        >
          <div className="w-40">
            <label className="text-[11px] font-mono uppercase" style={{ color: "var(--text3)" }}>
              Slug
            </label>
            <select
              value={slugNuevo}
              onChange={(e) => setSlugNuevo(e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm outline-none"
              style={{
                background: "var(--bg3)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              <option value="">Selecciona…</option>
              {slugsDisponibles.map((s) => (
                <option key={s} value={s}>
                  {SLUG_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-[11px] font-mono uppercase" style={{ color: "var(--text3)" }}>
              Nombre visible
            </label>
            <input
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm outline-none"
              style={{
                background: "var(--bg3)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              placeholder="Ej. Cimentación"
            />
          </div>
          <div className="w-24">
            <label className="text-[11px] font-mono uppercase" style={{ color: "var(--text3)" }}>
              Orden
            </label>
            <input
              type="number"
              min={0}
              value={ordenNuevo === "" ? "" : ordenNuevo}
              onChange={(e) =>
                setOrdenNuevo(e.target.value ? Number(e.target.value) : "")
              }
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm outline-none"
              style={{
                background: "var(--bg3)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
          <button
            onClick={crear}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Crear
          </button>
        </div>
      )}

      {/* Tabla */}
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--border)" }}
      >
        <table className="min-w-full divide-y" style={{ borderColor: "var(--border)" }}>
          <thead style={{ background: "var(--bg3)" }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
                Orden
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
                Slug
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
                Nombre visible
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
                Activa
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)", background: "var(--bg2)" }}>
            {categoriasIniciales.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text3)" }}>
                  {editandoId === c.id ? (
                    <input
                      type="number"
                      min={0}
                      value={editOrden === "" ? "" : editOrden}
                      onChange={(e) =>
                        setEditOrden(e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-16 rounded border px-2 py-1 text-xs outline-none"
                      style={{
                        background: "var(--bg3)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  ) : (
                    c.orden
                  )}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text3)" }}>
                  {c.slug}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editandoId === c.id ? (
                    <input
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-64 rounded border px-2 py-1 text-sm outline-none"
                      style={{
                        background: "var(--bg3)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  ) : (
                    <span style={{ color: "var(--text)" }}>{c.nombre}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editandoId === c.id ? (
                    <label className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text3)" }}>
                      <input
                        type="checkbox"
                        checked={editActiva}
                        onChange={(e) => setEditActiva(e.target.checked)}
                      />{" "}
                      Activa
                    </label>
                  ) : (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px]"
                      style={{
                        background: c.activa ? "rgba(34,197,94,0.16)" : "rgba(148,163,184,0.16)",
                        color: c.activa ? "var(--green)" : "var(--text3)",
                      }}
                    >
                      {c.activa ? "Activa" : "Inactiva"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  {editandoId === c.id ? (
                    <>
                      <button
                        onClick={() => guardarEdicion(c.id)}
                        className="mr-3 text-sm hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="text-sm hover:underline"
                        style={{ color: "var(--text3)" }}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditandoId(c.id);
                          setEditNombre(c.nombre);
                          setEditOrden(c.orden);
                          setEditActiva(c.activa);
                        }}
                        className="mr-3 text-sm hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminar(c.id)}
                        className="text-sm hover:underline"
                        style={{ color: "var(--red)" }}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

