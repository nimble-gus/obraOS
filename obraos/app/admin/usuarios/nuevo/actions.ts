"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { RolEnum } from "@/app/generated/prisma/enums";

export async function crearUsuario(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rol = formData.get("rol") as RolEnum;
  const modulosRaw = formData.get("modulosAcceso") as string | null;
  const modulosAcceso =
    modulosRaw && modulosRaw.trim()
      ? (JSON.parse(modulosRaw) as string[])
      : [];

  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) {
    redirect("/admin/usuarios/nuevo?error=email_exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash,
      rol,
    },
  });

  if (rol !== "ADMIN" && modulosAcceso.length > 0) {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { modulosAcceso },
    });
  }

  redirect("/admin/usuarios");
}
