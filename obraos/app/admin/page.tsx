import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Panel de administración</h1>
      <p className="mt-1 text-slate-400">
        Gestiona usuarios, configuración y contenido de la plataforma
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/usuarios"
          className="rounded-xl border border-slate-700 bg-slate-800 p-6 transition hover:border-amber-500/50"
        >
          <h3 className="font-semibold text-white">Usuarios</h3>
          <p className="mt-1 text-sm text-slate-400">
            Crear, editar y administrar usuarios
          </p>
        </Link>
        <Link
          href="/admin/configuracion"
          className="rounded-xl border border-slate-700 bg-slate-800 p-6 transition hover:border-amber-500/50"
        >
          <h3 className="font-semibold text-white">Configuración</h3>
          <p className="mt-1 text-sm text-slate-400">
            Parámetros de la plataforma
          </p>
        </Link>
        <Link
          href="/admin/contenido"
          className="rounded-xl border border-slate-700 bg-slate-800 p-6 transition hover:border-amber-500/50"
        >
          <h3 className="font-semibold text-white">Contenido</h3>
          <p className="mt-1 text-sm text-slate-400">
            Páginas, términos, FAQs
          </p>
        </Link>
        <Link
          href="/admin/auditoria"
          className="rounded-xl border border-slate-700 bg-slate-800 p-6 transition hover:border-amber-500/50"
        >
          <h3 className="font-semibold text-white">Auditoría</h3>
          <p className="mt-1 text-sm text-slate-400">
            Registro de acciones
          </p>
        </Link>
      </div>
    </div>
  );
}
