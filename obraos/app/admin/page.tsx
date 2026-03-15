import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
        Panel de administración
      </h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Gestiona usuarios, configuración y contenido de la plataforma
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/usuarios"
          className="block rounded-xl border p-6 transition hover:border-[var(--accent)]"
          style={{
            background: "var(--bg2)",
            borderColor: "var(--border)",
          }}
        >
          <h3 className="font-semibold" style={{ color: "var(--text)" }}>Usuarios</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text3)" }}>
            Crear, editar y administrar usuarios
          </p>
        </Link>
        <Link
          href="/admin/configuracion"
          className="block rounded-xl border p-6 transition hover:border-[var(--accent)]"
          style={{
            background: "var(--bg2)",
            borderColor: "var(--border)",
          }}
        >
          <h3 className="font-semibold" style={{ color: "var(--text)" }}>Configuración</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text3)" }}>
            Parámetros de la plataforma
          </p>
        </Link>
        <Link
          href="/admin/contenido"
          className="block rounded-xl border p-6 transition hover:border-[var(--accent)]"
          style={{
            background: "var(--bg2)",
            borderColor: "var(--border)",
          }}
        >
          <h3 className="font-semibold" style={{ color: "var(--text)" }}>Contenido</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text3)" }}>
            Páginas, términos, FAQs
          </p>
        </Link>
        <Link
          href="/admin/auditoria"
          className="block rounded-xl border p-6 transition hover:border-[var(--accent)]"
          style={{
            background: "var(--bg2)",
            borderColor: "var(--border)",
          }}
        >
          <h3 className="font-semibold" style={{ color: "var(--text)" }}>Auditoría</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text3)" }}>
            Registro de acciones
          </p>
        </Link>
      </div>
    </div>
  );
}
