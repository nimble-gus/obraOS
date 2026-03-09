"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MODULOS, MODULO_LABELS } from "@/lib/permissions";
import { crearUsuario } from "./actions";

export function CrearUsuarioForm() {
  const searchParams = useSearchParams();
  const rolParam = searchParams.get("rol");
  const [rol, setRol] = useState(rolParam ?? "SUPERVISOR");

  useEffect(() => {
    if (rolParam && ["SUPERVISOR", "PROJECT_MANAGER", "GERENCIA", "ADMIN"].includes(rolParam)) {
      setRol(rolParam);
    }
  }, [rolParam]);
  const [modulos, setModulos] = useState<string[]>(["proyectos", "visor"]);

  const toggleModulo = (m: string) => {
    setModulos((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  return (
    <form action={crearUsuario} className="mt-6 max-w-md space-y-4">
      <input type="hidden" name="modulosAcceso" value={JSON.stringify(modulos)} />
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Nombre</label>
        <input
          name="nombre"
          required
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Contraseña</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Rol</label>
        <select
          name="rol"
          required
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="SUPERVISOR">Supervisor (solo agregar avance)</option>
          <option value="PROJECT_MANAGER">Project Manager</option>
          <option value="GERENCIA">Gerencia</option>
          <option value="ADMIN">Admin (acceso total)</option>
        </select>
      </div>

      {rol !== "ADMIN" && (
        <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
          <label className="mb-3 block text-sm font-medium text-slate-300">
            Módulos a los que tendrá acceso
          </label>
          <div className="flex flex-wrap gap-2">
            {MODULOS.map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition"
                style={{
                  borderColor: modulos.includes(m) ? "var(--amber-500)" : "var(--slate-600)",
                  background: modulos.includes(m) ? "rgba(245,158,11,0.1)" : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={modulos.includes(m)}
                  onChange={() => toggleModulo(m)}
                />
                {MODULO_LABELS[m]}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-500"
        >
          Crear usuario
        </button>
        <a
          href="/admin/usuarios"
          className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300 hover:bg-slate-700"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
