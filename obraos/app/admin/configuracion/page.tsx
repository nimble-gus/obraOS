import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ConfiguracionPage() {
  const configs = await prisma.configuracionPlataforma.findMany({
    orderBy: { clave: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Configuración</h1>
      <p className="mt-1 text-slate-400">
        Parámetros generales de la plataforma
      </p>
      <div className="mt-6 space-y-4">
        {configs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-600 p-8 text-center text-slate-400">
            No hay configuraciones. Agrega parámetros desde el API o seed.
          </p>
        ) : (
          configs.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-4"
            >
              <div>
                <span className="font-mono text-sm text-amber-400">
                  {c.clave}
                </span>
                {c.descripcion && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {c.descripcion}
                  </p>
                )}
              </div>
              <span className="max-w-xs truncate text-sm text-slate-300">
                {c.valor}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
