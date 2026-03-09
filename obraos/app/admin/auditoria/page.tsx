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
      <h1 className="text-2xl font-bold text-white">Auditoría</h1>
      <p className="mt-1 text-slate-400">
        Registro de acciones en la plataforma
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Acción
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Módulo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-800/50">
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  No hay registros de auditoría
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(log.createdAt).toLocaleString("es")}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {log.usuario?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-600 px-2 py-0.5 text-xs text-slate-200">
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
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
