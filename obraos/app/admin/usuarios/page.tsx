import { prisma } from "@/lib/db";
import Link from "next/link";
import { auth } from "@/auth";

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
  const session = await auth();

  // -- Multi-Tenant Logic --
  // @ts-expect-error - custom property
  const rootAdminId = session?.user?.creadoPorId || session?.user?.id;

  const usuarios = await prisma.usuario.findMany({
    where: { OR: [{ id: rootAdminId }, { creadoPorId: rootAdminId }] },
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
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>Usuarios</h1>
        <Link
          href="/admin/usuarios/nuevo"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Nuevo usuario
        </Link>
      </div>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Gestiona los usuarios de la plataforma
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
        <table className="min-w-full divide-y" style={{ borderColor: "var(--border)" }}>
          <thead style={{ background: "var(--bg3)" }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
                Último acceso
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)", background: "var(--bg2)" }}>
            {usuarios.map((u) => (
              <tr key={u.id} style={{ background: "var(--bg2)" }} className="hover:opacity-90">
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text)" }}>{u.nombre}</td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text2)" }}>{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                    style={u.rol === "ADMIN" ? { background: "var(--accent-muted)", color: "var(--accent)" } : { background: "var(--bg3)", color: "var(--text2)" }}
                  >
                    {ROL_LABELS[u.rol] ?? u.rol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                    style={
                      u.estado === "ACTIVO"
                        ? { background: "rgba(34,197,94,0.15)", color: "var(--green)" }
                        : u.estado === "SUSPENDIDO"
                          ? { background: "rgba(239,68,68,0.15)", color: "var(--red)" }
                          : { background: "var(--bg3)", color: "var(--text3)" }
                    }
                  >
                    {ESTADO_LABELS[u.estado] ?? u.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text3)" }}>
                  {u.ultimoAcceso
                    ? new Date(u.ultimoAcceso).toLocaleDateString("es")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/usuarios/${u.id}/editar`}
                    className="text-sm hover:underline"
                    style={{ color: "var(--accent)" }}
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
