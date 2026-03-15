import Link from "next/link";
import { CrearUsuarioForm } from "./Form";

export default function NuevoUsuarioPage() {
  return (
    <div>
      <Link
        href="/admin/usuarios"
        className="mb-4 inline-block text-sm hover:underline"
        style={{ color: "var(--text3)" }}
      >
        ← Volver a usuarios
      </Link>
      <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>Nuevo usuario</h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Los usuarios no-admin solo verán los módulos que selecciones
      </p>
      <CrearUsuarioForm />
    </div>
  );
}
