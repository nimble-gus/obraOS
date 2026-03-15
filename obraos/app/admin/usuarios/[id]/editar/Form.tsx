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
        <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text2)" }}>Nombre</label>
        <input
          name="nombre"
          defaultValue={usuario.nombre}
          required
          className="w-full rounded-lg border px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
          style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text2)" }}>Email</label>
        <input
          name="email"
          type="email"
          defaultValue={usuario.email}
          required
          className="w-full rounded-lg border px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
          style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text2)" }}>
          Nueva contraseña (dejar vacío para no cambiar)
        </label>
        <input
          name="password"
          type="password"
          minLength={6}
          className="w-full rounded-lg border px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
          style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text2)" }}>Rol</label>
        <select
          name="rol"
          required
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
          style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          <option value="SUPERVISOR">Supervisor</option>
          <option value="PROJECT_MANAGER">Project Manager</option>
          <option value="GERENCIA">Gerencia</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text2)" }}>Estado</label>
        <select
          name="estado"
          defaultValue={usuario.estado}
          required
          className="w-full rounded-lg border px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
          style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
          <option value="SUSPENDIDO">Suspendido</option>
        </select>
      </div>

      {rol !== "ADMIN" && (
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--bg3)" }}>
          <label className="mb-3 block text-sm font-medium" style={{ color: "var(--text2)" }}>
            Módulos a los que tendrá acceso
          </label>
          <div className="flex flex-wrap gap-2">
            {MODULOS.map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition"
                style={{
                  borderColor: modulos.includes(m) ? "var(--accent)" : "var(--border)",
                  background: modulos.includes(m) ? "var(--accent-muted)" : "transparent",
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
          className="rounded-lg px-4 py-2 font-semibold text-black transition hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Guardar
        </button>
        <a
          href="/admin/usuarios"
          className="rounded-lg border px-4 py-2 transition"
          style={{ borderColor: "var(--border)", color: "var(--text2)" }}
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
