"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fase = {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
};

export function FasesCatalogoClient({
  fasesIniciales,
}: {
  fasesIniciales: Fase[];
}) {
  const router = useRouter();
  const [showNuevo, setShowNuevo] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [nombreEdit, setNombreEdit] = useState("");

  const agregar = async () => {
    if (!nombreNuevo.trim()) return;
    const res = await fetch("/api/admin/fases-catalogo", {
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
    const res = await fetch(`/api/admin/fases-catalogo/${id}`, {
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
    if (!confirm("¿Eliminar esta fase del catálogo? No se puede si hay fases de proyectos que la usen.")) return;
    const res = await fetch(`/api/admin/fases-catalogo/${id}`, {
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
        <span className="text-sm" style={{ color: "var(--text3)" }}>{fasesIniciales.length} fases</span>
        <button
          onClick={() => setShowNuevo(true)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          + Nueva fase
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
            placeholder="Ej. Movimiento de tierra, Cimentación, Levantamiento de muros"
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
            {fasesIniciales.map((f) => (
              <tr key={f.id} style={{ background: "var(--bg2)" }} className="hover:opacity-90">
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text3)" }}>{f.orden}</td>
                <td className="px-4 py-3">
                  {editando === f.id ? (
                    <input
                      value={nombreEdit}
                      onChange={(e) => setNombreEdit(e.target.value)}
                      className="w-64 rounded border px-2 py-1 text-sm"
                      style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                    />
                  ) : (
                    <span className="text-sm" style={{ color: "var(--text)" }}>{f.nombre}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editando === f.id ? (
                    <>
                      <button
                        onClick={() => actualizar(f.id)}
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
                        onClick={() => { setEditando(f.id); setNombreEdit(f.nombre); }}
                        className="mr-3 text-sm hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminar(f.id)}
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

      {fasesIniciales.length === 0 && !showNuevo && (
        <p
          className="rounded-xl border border-dashed p-8 text-center"
          style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
        >
          No hay fases predefinidas. Crea las primeras para que el usuario pueda seleccionarlas al crear Bloques.
        </p>
      )}
    </div>
  );
}
