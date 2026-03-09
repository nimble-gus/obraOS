import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { puedeAgregarMateriales } from "@/lib/permissions";
import { ServiciosList } from "./ServiciosList";

export default async function ServiciosPage() {
  const session = await auth();
  const puedeAgregar = puedeAgregarMateriales(session?.user?.role ?? "");

  const servicios = await prisma.catalogoServicio.findMany({
    where: { activo: true },
    include: { tipoServicio: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Costos varios
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
            Renta de grúas, fletes, transporte y otros servicios
          </p>
        </div>
        {puedeAgregar && (
          <Link
            href="/platform/servicios/nuevo"
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            + Agregar servicio
          </Link>
        )}
      </div>

      <ServiciosList servicios={servicios} puedeAgregar={puedeAgregar} />
    </div>
  );
}
