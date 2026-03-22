import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { ProyectoSelector } from "./ProyectoSelector";
import { ControlObraClient } from "./ControlObraClient";

export default async function VisorPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string }>;
}) {
  const session = await auth();
  
  // -- Multi-Tenant Logic --
  // @ts-expect-error - custom property
  const rootAdminId = session?.user?.creadoPorId || session?.user?.id;
  const tenantUsers = await prisma.usuario.findMany({
    where: { OR: [{ id: rootAdminId }, { creadoPorId: rootAdminId }] },
    select: { id: true }
  });
  const tenantUserIds = tenantUsers.map(u => u.id);

  const { proyecto: proyectoId } = await searchParams;
  const proyectos = await prisma.proyecto.findMany({
    where: { pmAsignadoId: { in: tenantUserIds }, status: "ACTIVO" },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });

  let proyecto = null;
  if (proyectoId) {
    const raw = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
      select: {
        id: true,
        nombre: true,
        numUnidades: true,
        fases: {
          orderBy: { orden: "asc" },
          select: {
            id: true,
            nombre: true,
            orden: true,
            status: true,
            pctAvance: true,
            tareas: {
              orderBy: { orden: "asc" },
              select: {
                id: true,
                nombre: true,
                cantidadM2: true,
                cantidadM3: true,
                fechaInicio: true,
                fechaFin: true,
              },
            },
          },
        },
        unidades: {
          where: { activa: true },
          orderBy: { numero: "asc" },
          select: {
            id: true,
            numero: true,
            etiqueta: true,
            pctAvanceGlobal: true,
            fechaEntregaEstimada: true,
          },
        },
      },
    });
    if (raw) {
      proyecto = {
        ...raw,
        fases: raw.fases.map((f) => ({
          ...f,
          tareas: f.tareas.map((t) => ({
            ...t,
            fechaInicio: t.fechaInicio?.toISOString().slice(0, 10) ?? null,
            fechaFin: t.fechaFin?.toISOString().slice(0, 10) ?? null,
          })),
        })),
        unidades: raw.unidades.map((u) => ({
          ...u,
          fechaEntregaEstimada: u.fechaEntregaEstimada?.toISOString().slice(0, 10) ?? null,
        })),
      };
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Control de Obra</h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Gestiona Bloques (unidades), fases y tareas del proyecto
      </p>
      <div className="mt-6">
        <ProyectoSelector proyectos={proyectos} value={proyectoId ?? null} />
      </div>
      <ControlObraClient proyectoId={proyectoId ?? null} proyecto={proyecto} />
    </div>
  );
}
