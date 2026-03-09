import { prisma } from "@/lib/db";
import { TiposServicioClient } from "./TiposServicioClient";

export default async function TiposServicioPage() {
  const tipos = await prisma.catalogoTipoServicio.findMany({
    orderBy: { orden: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Tipos de servicio</h1>
      <p className="mt-1 text-slate-400">
        Catálogo de rubros para costos varios (Renta grúa, Fletes, etc.). Se usa en Costos varios y en el desglose del dashboard.
      </p>
      <TiposServicioClient tiposIniciales={tipos} />
    </div>
  );
}
