import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ConfiguracionPage() {
  const configs = await prisma.configuracionPlataforma.findMany({
    orderBy: { clave: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>Configuración</h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Parámetros generales de la plataforma
      </p>
      <div className="mt-6 space-y-4">
        {configs.length === 0 ? (
          <p
            className="rounded-xl border border-dashed p-8 text-center"
            style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
          >
            No hay configuraciones. Agrega parámetros desde el API o seed.
          </p>
        ) : (
          configs.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border p-4"
              style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
            >
              <div>
                <span className="font-mono text-sm" style={{ color: "var(--accent)" }}>
                  {c.clave}
                </span>
                {c.descripcion && (
                  <p className="mt-0.5 text-xs" style={{ color: "var(--text3)" }}>
                    {c.descripcion}
                  </p>
                )}
              </div>
              <span className="max-w-xs truncate text-sm" style={{ color: "var(--text2)" }}>
                {c.valor}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
