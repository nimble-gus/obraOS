import { prisma } from "@/lib/db";
import { TiposServicioClient } from "./TiposServicioClient";

export default async function TiposServicioPage() {
  const tipos = await prisma.catalogoTipoServicio.findMany({
    orderBy: { orden: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>Tipos de servicio</h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Catálogo de rubros para costos varios (Renta grúa, Fletes, etc.). Se usa en Costos varios y en el desglose del dashboard.
      </p>
      <TiposServicioClient tiposIniciales={tipos} />
    </div>
  );
}
