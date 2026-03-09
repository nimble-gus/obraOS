import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ContenidoPage() {
  const contenidos = await prisma.contenidoPlataforma.findMany({
    orderBy: { slug: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Contenido</h1>
      <p className="mt-1 text-slate-400">
        Páginas estáticas, términos, FAQs y otros contenidos
      </p>
      <div className="mt-6 space-y-4">
        {contenidos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-600 p-8 text-center text-slate-400">
            No hay contenido. Crea páginas desde el API o seed.
          </p>
        ) : (
          contenidos.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-4"
            >
              <div>
                <span className="font-mono text-sm text-amber-400">
                  {c.slug}
                </span>
                {c.titulo && (
                  <p className="mt-0.5 text-sm text-slate-300">{c.titulo}</p>
                )}
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  c.activo ? "bg-green-500/20 text-green-400" : "bg-slate-600 text-slate-400"
                }`}
              >
                {c.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
