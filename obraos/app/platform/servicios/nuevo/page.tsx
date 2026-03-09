import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NuevoServicioForm } from "./form";

export default async function NuevoServicioPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div>
      <Link
        href="/platform/servicios"
        className="text-sm font-medium"
        style={{ color: "var(--accent)" }}
      >
        ← Volver a Costos varios
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
        Nuevo servicio
      </h1>
      <NuevoServicioForm className="mt-6 max-w-md" />
    </div>
  );
}
