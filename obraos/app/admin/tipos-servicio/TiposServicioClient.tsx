"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tipo = {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
};

export function TiposServicioClient({
  tiposIniciales,
}: {
  tiposIniciales: Tipo[];
}) {
  const router = useRouter();
  const [showNuevo, setShowNuevo] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [nombreEdit, setNombreEdit] = useState("");

  const agregar = async () => {
    if (!nombreNuevo.trim()) return;
    const res = await fetch("/api/admin/tipos-servicio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreNuevo.trim() }),
    });
    if (res.ok) {
      setShowNuevo(false);
      setNombreNuevo("");
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Error");
    }
  };

  const actualizar = async (id: string) => {
    if (!nombreEdit.trim()) return;
    const res = await fetch(`/api/admin/tipos-servicio/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreEdit.trim() }),
    });
    if (res.ok) {
      setEditando(null);
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Error");
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este tipo? No se puede si hay servicios que lo usan.")) return;
    const res = await fetch(`/api/admin/tipos-servicio/${id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
    else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Error");
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: "var(--text3)" }}>{tiposIniciales.length} tipos</span>
        <button
          onClick={() => setShowNuevo(true)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          + Nuevo tipo
        </button>
      </div>

      {showNuevo && (
        <div
          className="flex items-center gap-3 rounded-xl border p-4"
          style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
        >
          <input
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            placeholder="Ej. Renta grúa, Fletes"
            className="flex-1 rounded border px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            style={{
              background: "var(--bg3)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <button
            onClick={agregar}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Crear
          </button>
          <button
            onClick={() => { setShowNuevo(false); setNombreNuevo(""); }}
            className="rounded border px-4 py-2 text-sm transition"
            style={{ borderColor: "var(--border)", color: "var(--text2)" }}
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
        <table className="min-w-full divide-y" style={{ borderColor: "var(--border)" }}>
          <thead style={{ background: "var(--bg3)" }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>Orden</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>Nombre</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)", background: "var(--bg2)" }}>
            {tiposIniciales.map((t) => (
              <tr key={t.id} style={{ background: "var(--bg2)" }} className="hover:opacity-90">
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text3)" }}>{t.orden}</td>
                <td className="px-4 py-3">
                  {editando === t.id ? (
                    <input
                      value={nombreEdit}
                      onChange={(e) => setNombreEdit(e.target.value)}
                      className="w-64 rounded border px-2 py-1 text-sm"
                      style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                    />
                  ) : (
                    <span className="text-sm" style={{ color: "var(--text)" }}>{t.nombre}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editando === t.id ? (
                    <>
                      <button
                        onClick={() => actualizar(t.id)}
                        className="mr-2 text-sm hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => { setEditando(null); setNombreEdit(""); }}
                        className="text-sm hover:underline"
                        style={{ color: "var(--text3)" }}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditando(t.id); setNombreEdit(t.nombre); }}
                        className="mr-3 text-sm hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminar(t.id)}
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

      {tiposIniciales.length === 0 && !showNuevo && (
        <p
          className="rounded-xl border border-dashed p-8 text-center"
          style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
        >
          No hay tipos de servicio. Crea el primero para poder clasificar costos varios.
        </p>
      )}
    </div>
  );
}
