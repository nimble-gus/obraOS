import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { actualizarUsuario } from "./actions";
import { EditarUsuarioForm } from "./Form";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      estado: true,
      modulosAcceso: true,
    },
  });

  if (!usuario) notFound();

  const modulos = (usuario.modulosAcceso as string[] | null) ?? [];

  return (
    <div>
      <Link
        href="/admin/usuarios"
        className="mb-4 inline-block text-sm hover:underline"
        style={{ color: "var(--text3)" }}
      >
        ← Volver a usuarios
      </Link>
      <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>Editar usuario</h1>
      <EditarUsuarioForm usuario={usuario} modulosIniciales={modulos} action={actualizarUsuario.bind(null, id)} />
    </div>
  );
}
