import { prisma } from "@/lib/db";
import Link from "next/link";

const ROL_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  GERENCIA: "Gerencia",
  PROJECT_MANAGER: "Project Manager",
  SUPERVISOR: "Supervisor",
};

const ESTADO_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
};

export default async function UsuariosPage() {
  const usuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      estado: true,
      ultimoAcceso: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Usuarios</h1>
        <Link
          href="/admin/usuarios/nuevo"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
        >
          Nuevo usuario
        </Link>
      </div>
      <p className="mt-1 text-slate-400">
        Gestiona los usuarios de la plataforma
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Último acceso
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-800/50">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-slate-700/30">
                <td className="px-4 py-3 text-sm text-white">{u.nombre}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.rol === "ADMIN"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-slate-600 text-slate-300"
                    }`}
                  >
                    {ROL_LABELS[u.rol] ?? u.rol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.estado === "ACTIVO"
                        ? "bg-green-500/20 text-green-400"
                        : u.estado === "SUSPENDIDO"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-slate-600 text-slate-400"
                    }`}
                  >
                    {ESTADO_LABELS[u.estado] ?? u.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {u.ultimoAcceso
                    ? new Date(u.ultimoAcceso).toLocaleDateString("es")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/usuarios/${u.id}/editar`}
                    className="text-sm text-amber-400 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
