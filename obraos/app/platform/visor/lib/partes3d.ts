/**
 * Partes del modelo 3D según especificación Trazo.
 * Cada fase define qué partes son visibles al activarla.
 */
export const PARTES_3D = [
  "foundation",
  "columns",
  "slab",
  "walls",
  "pipes",
  "facade",
  "windows",
  "roof",
  "door",
  "details",
] as const;

export type ParteId = (typeof PARTES_3D)[number];

export const PARTE_LABELS: Record<ParteId, string> = {
  foundation: "Cimentación",
  columns: "Columnas",
  slab: "Losa",
  walls: "Muros",
  pipes: "Tuberías",
  facade: "Fachada",
  windows: "Ventanas",
  roof: "Techo",
  door: "Puerta",
  details: "Detalles",
};

export function parsePartes3D(val: unknown): ParteId[] {
  if (!Array.isArray(val)) return [];
  return val.filter((v): v is ParteId => typeof v === "string" && PARTES_3D.includes(v as ParteId));
}
