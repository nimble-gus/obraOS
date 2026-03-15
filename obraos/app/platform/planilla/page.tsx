import { prisma } from "@/lib/db";
import { PlanillaClient } from "./PlanillaClient";

export default async function PlanillaPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string }>;
}) {
  const { proyecto: proyectoId } = await searchParams;

  const proyectos = await prisma.proyecto.findMany({
    where: { status: "ACTIVO" },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });

  const proyectoSeleccionado = proyectoId
    ? proyectos.find((p) => p.id === proyectoId) ?? proyectos[0]
    : proyectos[0];

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Planilla</h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Gestión de bloques y registros de planilla por proyecto
      </p>

      {proyectos.length === 0 ? (
        <div
          className="mt-8 rounded-xl border border-dashed p-12 text-center"
          style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
        >
          <p>No hay proyectos activos.</p>
          <p className="mt-1 text-sm">Crea un proyecto para gestionar planillas.</p>
        </div>
      ) : proyectoSeleccionado ? (
        <div className="mt-8">
          <PlanillaClient
            proyectoId={proyectoSeleccionado.id}
            proyectoNombre={proyectoSeleccionado.nombre}
            proyectos={proyectos}
          />
        </div>
      ) : null}
    </div>
  );
}
