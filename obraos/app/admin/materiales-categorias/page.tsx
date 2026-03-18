import { prisma } from "@/lib/db";
import { CategoriasMaterialClient } from "./CategoriasMaterialClient";

export default async function MaterialesCategoriasPage() {
  const categorias = await prisma.categoriaMaterialConfig.findMany({
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
        Categorías de materiales
      </h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
        Administra las categorías que aparecen en el formulario de materiales.
      </p>

      <CategoriasMaterialClient categoriasIniciales={categorias} />
    </div>
  );
}

