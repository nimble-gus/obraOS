/**
 * RBAC: Control de acceso basado en roles
 * Escalable: agregar nuevos permisos sin cambiar lógica de negocio
 */

export type RolEnum = "ADMIN" | "GERENCIA" | "PROJECT_MANAGER" | "SUPERVISOR";

export const PERMISOS = {
  // Admin
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_DELETE: "users.delete",
  PLATFORM_SETTINGS: "platform.settings",
  PLATFORM_CONTENT: "platform.content",
  PLATFORM_AUDIT: "platform.audit",
  ROLES_MANAGE: "roles.manage",

  // Plataforma
  PROJECTS_VIEW: "projects.view",
  PROJECTS_CREATE: "projects.create",
  PROJECTS_EDIT: "projects.edit",
  PROJECTS_DELETE: "projects.delete",
  CATALOG_VIEW: "catalog.view",
  CATALOG_EDIT: "catalog.edit",
  REPORTS_VIEW: "reports.view",
  REPORTS_GLOBAL: "reports.global",
  VISOR_3D: "visor.3d",
} as const;

const ROL_PERMISOS: Record<RolEnum, readonly string[]> = {
  ADMIN: [
    PERMISOS.USERS_VIEW,
    PERMISOS.USERS_CREATE,
    PERMISOS.USERS_EDIT,
    PERMISOS.USERS_DELETE,
    PERMISOS.PLATFORM_SETTINGS,
    PERMISOS.PLATFORM_CONTENT,
    PERMISOS.PLATFORM_AUDIT,
    PERMISOS.ROLES_MANAGE,
    PERMISOS.PROJECTS_VIEW,
    PERMISOS.PROJECTS_CREATE,
    PERMISOS.PROJECTS_EDIT,
    PERMISOS.PROJECTS_DELETE,
    PERMISOS.CATALOG_VIEW,
    PERMISOS.CATALOG_EDIT,
    PERMISOS.REPORTS_VIEW,
    PERMISOS.REPORTS_GLOBAL,
    PERMISOS.VISOR_3D,
  ],
  GERENCIA: [
    PERMISOS.PROJECTS_VIEW,
    PERMISOS.REPORTS_VIEW,
    PERMISOS.REPORTS_GLOBAL,
    PERMISOS.VISOR_3D,
    PERMISOS.CATALOG_VIEW,
  ],
  PROJECT_MANAGER: [
    PERMISOS.PROJECTS_VIEW,
    PERMISOS.PROJECTS_CREATE,
    PERMISOS.PROJECTS_EDIT,
    PERMISOS.CATALOG_VIEW,
    PERMISOS.REPORTS_VIEW,
    PERMISOS.VISOR_3D,
  ],
  SUPERVISOR: [
    PERMISOS.PROJECTS_VIEW,
    PERMISOS.CATALOG_VIEW,
    PERMISOS.VISOR_3D,
  ],
};

export function tienePermiso(rol: RolEnum | string, permiso: string): boolean {
  const permisos = ROL_PERMISOS[rol as RolEnum];
  if (!permisos) return false;
  return permisos.includes(permiso);
}

export function esAdmin(rol: RolEnum | string): boolean {
  return rol === "ADMIN";
}

export function puedeAccederAdmin(rol: RolEnum | string): boolean {
  return rol === "ADMIN";
}
