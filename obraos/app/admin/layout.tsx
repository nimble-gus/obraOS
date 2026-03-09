import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/platform");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <aside className="flex w-64 flex-col" style={{ background: "var(--sidebar-bg)", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex h-14 items-center px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/admin" className="font-semibold" style={{ color: "var(--accent)" }}>
            obraOS Admin
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <Link
            href="/admin"
            className="rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/usuarios"
            className="rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Usuarios
          </Link>
          <Link
            href="/admin/configuracion"
            className="rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Configuración
          </Link>
          <Link
            href="/admin/contenido"
            className="rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Contenido
          </Link>
          <Link
            href="/admin/tipos-servicio"
            className="rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Tipos de servicio
          </Link>
          <Link
            href="/admin/auditoria"
            className="rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Auditoría
          </Link>
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <Link
              href="/platform"
              className="rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
              style={{ color: "var(--sidebar-text-muted)" }}
            >
              ← Volver a plataforma
            </Link>
          </div>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6" style={{ background: "var(--bg2)", color: "var(--text)" }}>{children}</main>
    </div>
  );
}
