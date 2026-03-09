"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { RolEnum, EstadoUsuarioEnum } from "@/app/generated/prisma/enums";

export async function actualizarUsuario(
  id: string,
  formData: FormData
) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rol = formData.get("rol") as RolEnum;
  const estado = formData.get("estado") as EstadoUsuarioEnum;

  const modulosRaw = formData.get("modulosAcceso") as string | null;
  const modulosAcceso =
    modulosRaw && modulosRaw.trim()
      ? (JSON.parse(modulosRaw) as string[])
      : undefined;

  const data: {
    nombre: string;
    email: string;
    rol: RolEnum;
    estado: EstadoUsuarioEnum;
    passwordHash?: string;
    modulosAcceso?: string[];
  } = {
    nombre,
    email,
    rol,
    estado,
  };

  if (password?.trim()) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  if (rol !== "ADMIN" && modulosAcceso) {
    data.modulosAcceso = modulosAcceso;
  }

  await prisma.usuario.update({
    where: { id },
    data,
  });

  redirect("/admin/usuarios");
}
