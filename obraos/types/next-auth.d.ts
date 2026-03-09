import type { RolEnum } from "@/lib/rbac";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    nombre: string;
    role: RolEnum;
    modulosAcceso?: string[];
  }

  interface Session {
    user: {
      id: string;
      email: string;
      nombre: string;
      role: RolEnum;
      modulosAcceso?: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    nombre: string;
    role: RolEnum;
    modulosAcceso?: string[];
  }
}
