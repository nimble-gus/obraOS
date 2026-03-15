import { prisma } from "@/lib/db";

export default async function AuditoriaPage() {
  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      usuario: {
        select: { nombre: true, email: true },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>Auditoría</h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Registro de acciones en la plataforma
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
        <table className="min-w-full divide-y" style={{ borderColor: "var(--border)" }}>
          <thead style={{ background: "var(--bg3)" }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>Acción</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>Módulo</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)", background: "var(--bg2)" }}>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center" style={{ color: "var(--text3)" }}>
                  No hay registros de auditoría
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ background: "var(--bg2)" }} className="hover:opacity-90">
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text3)" }}>
                    {new Date(log.createdAt).toLocaleString("es")}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text2)" }}>
                    {log.usuario?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded px-2 py-0.5 text-xs" style={{ background: "var(--bg3)", color: "var(--text)" }}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text3)" }}>
                    {log.modulo}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
