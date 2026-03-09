import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
        });

        if (!usuario || usuario.estado !== "ACTIVO") return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          usuario.passwordHash
        );
        if (!valid) return null;

        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { ultimoAcceso: new Date() },
        });

        const modulosAcceso = usuario.modulosAcceso as string[] | null;
        return {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          role: usuario.rol,
          modulosAcceso: modulosAcceso ?? [],
        };
      },
    }),
  ],
});
