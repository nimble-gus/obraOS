import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ContenidoPage() {
  const contenidos = await prisma.contenidoPlataforma.findMany({
    orderBy: { slug: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>Contenido</h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Páginas estáticas, términos, FAQs y otros contenidos
      </p>
      <div className="mt-6 space-y-4">
        {contenidos.length === 0 ? (
          <p
            className="rounded-xl border border-dashed p-8 text-center"
            style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
          >
            No hay contenido. Crea páginas desde el API o seed.
          </p>
        ) : (
          contenidos.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border p-4"
              style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
            >
              <div>
                <span className="font-mono text-sm" style={{ color: "var(--accent)" }}>
                  {c.slug}
                </span>
                {c.titulo && (
                  <p className="mt-0.5 text-sm" style={{ color: "var(--text2)" }}>{c.titulo}</p>
                )}
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={c.activo ? { background: "rgba(34,197,94,0.15)", color: "var(--green)" } : { background: "var(--bg3)", color: "var(--text3)" }}
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
