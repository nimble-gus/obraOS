"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { puedeVerModulo } from "@/lib/permissions";

const pathToModulo: Record<string, string> = {
  "/platform": "proyectos",
  "/platform/proyectos": "proyectos",
  "/platform/visor": "visor",
  "/platform/materiales": "materiales",
  "/platform/equipo": "equipo",
};

export function PlatformGuard({
  rol,
  modulosAcceso,
}: {
  rol: string;
  modulosAcceso: string[] | undefined;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (rol === "ADMIN") return;

    const mod = pathToModulo[pathname] ?? pathname.split("/")[2];
    if (mod && pathname.startsWith("/platform")) {
      const modulo = (pathToModulo[pathname] || pathname.split("/")[2] || "proyectos") as "proyectos" | "visor" | "materiales" | "equipo";
      if (!puedeVerModulo(rol, modulo, modulosAcceso)) {
        router.replace("/platform");
      }
    }
  }, [pathname, rol, modulosAcceso, router]);

  return null;
}
