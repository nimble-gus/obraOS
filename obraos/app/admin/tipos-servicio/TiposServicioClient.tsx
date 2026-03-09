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
        <span className="text-sm text-slate-400">{tiposIniciales.length} tipos</span>
        <button
          onClick={() => setShowNuevo(true)}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
        >
          + Nuevo tipo
        </button>
      </div>

      {showNuevo && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4">
          <input
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            placeholder="Ej. Renta grúa, Fletes"
            className="flex-1 rounded border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500"
          />
          <button
            onClick={agregar}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
          >
            Crear
          </button>
          <button
            onClick={() => { setShowNuevo(false); setNombreNuevo(""); }}
            className="rounded border border-slate-600 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">Orden</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">Nombre</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-800/50">
            {tiposIniciales.map((t) => (
              <tr key={t.id} className="hover:bg-slate-700/30">
                <td className="px-4 py-3 text-sm text-slate-400">{t.orden}</td>
                <td className="px-4 py-3">
                  {editando === t.id ? (
                    <input
                      value={nombreEdit}
                      onChange={(e) => setNombreEdit(e.target.value)}
                      className="w-64 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white"
                    />
                  ) : (
                    <span className="text-sm text-white">{t.nombre}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editando === t.id ? (
                    <>
                      <button
                        onClick={() => actualizar(t.id)}
                        className="mr-2 text-sm text-amber-400 hover:text-amber-300"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => { setEditando(null); setNombreEdit(""); }}
                        className="text-sm text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditando(t.id); setNombreEdit(t.nombre); }}
                        className="mr-3 text-sm text-amber-400 hover:text-amber-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminar(t.id)}
                        className="text-sm text-red-400 hover:text-red-300"
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
        <p className="rounded-xl border border-dashed border-slate-600 p-8 text-center text-slate-400">
          No hay tipos de servicio. Crea el primero para poder clasificar costos varios.
        </p>
      )}
    </div>
  );
}
