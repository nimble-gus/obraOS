"use client";

import { useState } from "react";
import { MODULOS, MODULO_LABELS } from "@/lib/permissions";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
};

export function EditarUsuarioForm({
  usuario,
  modulosIniciales,
  action,
}: {
  usuario: Usuario;
  modulosIniciales: string[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [rol, setRol] = useState(usuario.rol);
  const [modulos, setModulos] = useState<string[]>(
    modulosIniciales.length > 0 ? modulosIniciales : ["proyectos", "visor"]
  );

  const toggleModulo = (m: string) => {
    setModulos((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  return (
    <form action={action} className="mt-6 max-w-md space-y-4">
      <input type="hidden" name="modulosAcceso" value={JSON.stringify(modulos)} />
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Nombre</label>
        <input
          name="nombre"
          defaultValue={usuario.nombre}
          required
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={usuario.email}
          required
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Nueva contraseña (dejar vacío para no cambiar)
        </label>
        <input
          name="password"
          type="password"
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
          <option value="SUPERVISOR">Supervisor</option>
          <option value="PROJECT_MANAGER">Project Manager</option>
          <option value="GERENCIA">Gerencia</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Estado</label>
        <select
          name="estado"
          defaultValue={usuario.estado}
          required
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
          <option value="SUSPENDIDO">Suspendido</option>
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
                  borderColor: modulos.includes(m) ? "#f59e0b" : "#475569",
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
          Guardar
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
