import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { puedeAgregarMateriales } from "@/lib/permissions";
import { CrearMaterialForm } from "./form";

export default async function NuevoMaterialPage() {
  const session = await auth();
  if (!puedeAgregarMateriales(session?.user?.role ?? "")) {
    redirect("/platform/materiales");
  }

  return (
    <div>
      <Link
        href="/platform/materiales"
        className="mb-4 inline-block text-sm hover:underline"
        style={{ color: "var(--text3)" }}
      >
        ← Volver a materiales
      </Link>
      <h1 className="text-2xl font-extrabold tracking-tight">
        Agregar Material
      </h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Añade un nuevo material al catálogo
      </p>
      <div className="mt-6 max-w-xl">
        <CrearMaterialForm />
      </div>
    </div>
  );
}
