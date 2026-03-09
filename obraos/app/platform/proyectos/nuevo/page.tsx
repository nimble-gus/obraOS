import { prisma } from "@/lib/db";
import Link from "next/link";
import { CrearProyectoForm } from "./form";

export default async function NuevoProyectoPage() {
  const pms = await prisma.usuario.findMany({
    where: { rol: "PROJECT_MANAGER", estado: "ACTIVO" },
    select: { id: true, nombre: true },
  });

  return (
    <div>
      <Link
        href="/platform/proyectos"
        className="mb-4 inline-block text-sm hover:underline"
        style={{ color: "var(--text3)" }}
      >
        ← Volver a proyectos
      </Link>
      <h1 className="text-2xl font-extrabold tracking-tight">Nuevo Proyecto</h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Crea un proyecto y luego añade fases y materiales
      </p>
      <div className="mt-6 max-w-xl">
        <CrearProyectoForm pms={pms} />
      </div>
    </div>
  );
}
