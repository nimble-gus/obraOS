import { prisma } from "@/lib/db";
import { FasesCatalogoClient } from "./FasesCatalogoClient";

export default async function FasesCatalogoPage() {
  const fases = await prisma.catalogoFase.findMany({
    orderBy: { orden: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
        Fases predefinidas
      </h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Catálogo de fases (Movimiento de tierra, Cimentación, Levantamiento de muros, etc.). El usuario las selecciona al crear Bloques.
      </p>
      <FasesCatalogoClient fasesIniciales={fases} />
    </div>
  );
}
