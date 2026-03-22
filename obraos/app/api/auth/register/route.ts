import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { nombre, email, password } = await req.json();

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const unUsuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (unUsuario) {
      return NextResponse.json(
        { error: "Este correo ya está registrado" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash,
        rol: "ADMIN", // Cada usuario nuevo es administrador de su propio workspace
        estado: "ACTIVO",
        modulosAcceso: ["proyectos", "visor", "materiales", "planilla", "servicios", "equipo"],
      },
    });

    return NextResponse.json(
      { success: true, user: { id: nuevoUsuario.id, email: nuevoUsuario.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
