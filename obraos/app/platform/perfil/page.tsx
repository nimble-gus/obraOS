import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const user = session.user as { nombre?: string; email?: string; role?: string };
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Mi perfil</h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Información de tu cuenta
      </p>
      <div
        className="mt-6 rounded-xl border p-6"
        style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
      >
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase" style={{ color: "var(--text3)" }}>
              Nombre
            </dt>
            <dd className="mt-1" style={{ color: "var(--text)" }}>
              {user.nombre ?? user.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase" style={{ color: "var(--text3)" }}>
              Email
            </dt>
            <dd className="mt-1" style={{ color: "var(--text)" }}>
              {user.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase" style={{ color: "var(--text3)" }}>
              Rol
            </dt>
            <dd className="mt-1" style={{ color: "var(--text)" }}>
              {user.role ?? "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
