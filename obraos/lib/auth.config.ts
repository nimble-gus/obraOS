import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role as string | undefined;
      const isAdmin = role === "ADMIN";
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isPlatformRoute = nextUrl.pathname.startsWith("/platform");
      const isAuthRoute = nextUrl.pathname.startsWith("/auth");

      // Admin: solo ADMIN
      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        if (!isAdmin) return Response.redirect(new URL("/platform", nextUrl));
        return true;
      }

      // Platform: requiere login
      if (isPlatformRoute && !isLoggedIn) return false;

      // Auth (login): si ya está logueado, ir a platform
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/platform", nextUrl));
      }



      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.nombre = user.nombre;
        token.email = user.email;
        token.modulosAcceso = (user as { modulosAcceso?: string[] }).modulosAcceso ?? [];
        token.creadoPorId = (user as { creadoPorId?: string | null }).creadoPorId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as import("@/lib/rbac").RolEnum;
        session.user.nombre = token.nombre as string;
        session.user.email = token.email as string;
        session.user.modulosAcceso = (token.modulosAcceso as string[]) ?? [];
        // @ts-expect-error - Custom property para multi-tenant (Workspace)
        session.user.creadoPorId = (token.creadoPorId as string | null | undefined);
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
