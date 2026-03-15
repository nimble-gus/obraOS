/**
 * Módulos disponibles en la plataforma.
 * Admin: acceso total. Usuarios normales: según modulosAcceso.
 */
export const MODULOS = ["proyectos", "visor", "materiales", "planilla", "servicios", "equipo"] as const;
export type ModuloSlug = (typeof MODULOS)[number];

export const MODULO_LABELS: Record<ModuloSlug, string> = {
  proyectos: "Proyectos",
  visor: "Control de Obra",
  materiales: "Materiales",
  planilla: "Planilla",
  servicios: "Costos varios",
  equipo: "Equipo PM",
};

export function puedeVerModulo(
  rol: string,
  modulo: ModuloSlug,
  modulosAcceso: string[] | null | undefined
): boolean {
  if (rol === "ADMIN") return true;
  const accesos =
    modulosAcceso && Array.isArray(modulosAcceso) && modulosAcceso.length > 0
      ? modulosAcceso
      : ["proyectos", "visor", "materiales", "planilla", "servicios"];
  return accesos.includes(modulo);
}

export function puedeCrearProyectos(rol: string): boolean {
  return rol === "ADMIN";
}

export function puedeGestionarEquipo(rol: string): boolean {
  return rol === "ADMIN";
}

export function puedeAgregarMateriales(rol: string): boolean {
  return rol === "ADMIN";
}

export function puedeEliminarMateriales(rol: string): boolean {
  return rol === "ADMIN";
}

export function puedeBorrarUnidades(rol: string): boolean {
  return rol === "ADMIN";
}

export function puedeConfigurarModeloFinanciero(rol: string): boolean {
  return rol === "ADMIN";
}

export function puedeBorrarPlanillas(rol: string): boolean {
  return rol === "ADMIN";
}

export function puedeBorrarProyectos(rol: string): boolean {
  return rol === "ADMIN";
}
