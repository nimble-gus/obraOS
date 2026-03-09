import Link from "next/link";
import { CrearUsuarioForm } from "./Form";

export default function NuevoUsuarioPage() {
  return (
    <div>
      <Link
        href="/admin/usuarios"
        className="mb-4 inline-block text-sm text-slate-400 hover:text-white"
      >
        ← Volver a usuarios
      </Link>
      <h1 className="text-2xl font-bold text-white">Nuevo usuario</h1>
      <p className="mt-1 text-sm text-slate-400">
        Los usuarios no-admin solo verán los módulos que selecciones
      </p>
      <CrearUsuarioForm />
    </div>
  );
}
