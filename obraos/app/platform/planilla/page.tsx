import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { PlanillaClient } from "./PlanillaClient";

export default async function PlanillaPage() {
  await auth();

  const proyectos = await prisma.proyecto.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Planilla</h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
          Gestiona nóminas y registra costos en fases al pagar
        </p>
      </div>

      <PlanillaClient proyectos={proyectos} />
    </div>
  );
}
