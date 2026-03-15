import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminTopbar } from "./AdminTopbar";

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
      <aside
        className="flex w-64 shrink-0 flex-col"
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        <div
          className="flex h-14 items-center px-5"
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
        >
          <Link href="/admin" className="font-semibold" style={{ color: "var(--accent)" }}>
            obraOS
          </Link>
          <span className="ml-2 text-xs" style={{ color: "var(--sidebar-text-muted)" }}>
            Admin
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          <Link
            href="/admin"
            className="rounded-lg px-3 py-2.5 text-sm transition hover:bg-[var(--sidebar-hover)]"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/usuarios"
            className="rounded-lg px-3 py-2.5 text-sm transition hover:bg-[var(--sidebar-hover)]"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Usuarios
          </Link>
          <Link
            href="/admin/configuracion"
            className="rounded-lg px-3 py-2.5 text-sm transition hover:bg-[var(--sidebar-hover)]"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Configuración
          </Link>
          <Link
            href="/admin/contenido"
            className="rounded-lg px-3 py-2.5 text-sm transition hover:bg-[var(--sidebar-hover)]"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Contenido
          </Link>
          <Link
            href="/admin/fases-catalogo"
            className="rounded-lg px-3 py-2.5 text-sm transition hover:bg-[var(--sidebar-hover)]"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Fases predefinidas
          </Link>
          <Link
            href="/admin/tipos-servicio"
            className="rounded-lg px-3 py-2.5 text-sm transition hover:bg-[var(--sidebar-hover)]"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Tipos de servicio
          </Link>
          <Link
            href="/admin/auditoria"
            className="rounded-lg px-3 py-2.5 text-sm transition hover:bg-[var(--sidebar-hover)]"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            Auditoría
          </Link>
          <div
            className="mt-4 pt-3"
            style={{ borderTop: "1px solid var(--sidebar-border)" }}
          >
            <Link
              href="/platform"
            className="rounded-lg px-3 py-2.5 text-sm transition hover:bg-[var(--sidebar-hover)]"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            ← Volver
            </Link>
          </div>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar userName={session.user?.nombre ?? undefined} />
        <main
          className="flex-1 overflow-auto p-6"
          style={{ background: "var(--bg2)", color: "var(--text)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
