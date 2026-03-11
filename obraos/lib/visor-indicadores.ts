/**
 * Cálculos para indicadores por unidad en el Visor.
 * - Presupuesto por unidad
 * - Costo ejecutado por unidad (materiales, servicios, planilla prorrateados)
 * - % del inventario que representa la unidad
 * - Semáforo (presupuesto, avance)
 * - Predicción de fecha entrega
 */

export type Semaforo = "verde" | "amarillo" | "rojo";

export function semaforoPresupuesto(pctUsado: number): Semaforo {
  if (pctUsado < 90) return "verde";
  if (pctUsado <= 100) return "amarillo";
  return "rojo";
}

export function semaforoAvance(pctAvance: number, pctEsperado: number): Semaforo {
  const diff = pctAvance - pctEsperado;
  if (diff >= 0) return "verde";
  if (diff >= -15) return "amarillo";
  return "rojo";
}

export function semaforoGlobal(presupuesto: Semaforo, avance: Semaforo): Semaforo {
  if (presupuesto === "rojo" || avance === "rojo") return "rojo";
  if (presupuesto === "amarillo" || avance === "amarillo") return "amarillo";
  return "verde";
}

/**
 * Obtiene el % de cantidad asignada a una unidad para un MaterialFase.
 * Si hay distribucionesUnidad, usa el porcentaje configurado.
 * Si no hay distribución, 100% para la primera unidad (Unidad 1) y 0% para el resto.
 * El reparto equitativo solo ocurre si el usuario lo configura explícitamente.
 */
export function pctMaterialPorUnidad(
  unidadId: string,
  unidadesIds: string[],
  distribuciones?: { unidadId: string; porcentaje: number }[]
): number {
  if (!distribuciones?.length) {
    if (unidadesIds.length === 0) return 0;
    return unidadesIds[0] === unidadId ? 100 : 0;
  }
  const d = distribuciones.find((x) => x.unidadId === unidadId);
  return d ? d.porcentaje : 0;
}

/**
 * Cantidad de material asignada a una unidad (para un MaterialFase).
 */
export function cantidadMaterialPorUnidad(
  cantidadRequerida: number,
  pctUnidad: number
): number {
  return Math.round((cantidadRequerida * pctUnidad) / 100);
}

/**
 * % del inventario que representa esta unidad para un material.
 * = (cantidad asignada a la unidad) / stockTotal * 100
 */
export function pctInventarioPorUnidad(
  cantidadAsignada: number,
  stockTotal: number
): number {
  if (stockTotal <= 0) return 0;
  return Math.min(100, (cantidadAsignada / stockTotal) * 100);
}

/**
 * Costo ejecutado de materiales para una unidad.
 * Suma: (cantidadRequerida * pctEjecutado/100 * pctUnidad/100) * costoUnitario
 */
export function costoMaterialesPorUnidad(
  materiales: {
    id?: string;
    cantidadRequerida: number;
    pctEjecutado: number;
    material: { costoUnitario: number };
  }[],
  unidadId: string,
  unidadesIds: string[],
  distribucionesByMf?: Record<string, { unidadId: string; porcentaje: number }[]>
): number {
  let total = 0;
  for (const mf of materiales) {
    const dist = mf.id != null ? distribucionesByMf?.[mf.id] : undefined;
    const pct = pctMaterialPorUnidad(unidadId, unidadesIds, dist);
    const cantUsada = (mf.cantidadRequerida * mf.pctEjecutado) / 100;
    const cantUnidad = (cantUsada * pct) / 100;
    total += cantUnidad * mf.material.costoUnitario;
  }
  return total;
}

/**
 * Costo de servicios prorrateado por unidad.
 * Por defecto 100% para la primera unidad, 0% para el resto.
 * El reparto equitativo solo si se configura explícitamente (pendiente de UI).
 */
export function costoServiciosPorUnidad(
  servicios: { cantidadRequerida: number; servicio: { costoUnitario: number } }[],
  unidadId: string,
  unidadesIds: string[]
): number {
  if (unidadesIds.length === 0) return 0;
  const totalServicios = servicios.reduce(
    (s, sf) => s + sf.cantidadRequerida * sf.servicio.costoUnitario,
    0
  );
  return unidadesIds[0] === unidadId ? totalServicios : 0;
}

/**
 * Costo planilla prorrateado por unidad.
 * Por defecto 100% para la primera unidad, 0% para el resto.
 * El reparto equitativo solo si se configura explícitamente (pendiente de UI).
 */
export function costoPlanillaPorUnidad(
  planillasAsignadas: { monto: number }[],
  unidadId: string,
  unidadesIds: string[]
): number {
  if (unidadesIds.length === 0) return 0;
  const total = planillasAsignadas.reduce((s, pa) => s + pa.monto, 0);
  return unidadesIds[0] === unidadId ? total : 0;
}

/**
 * Presupuesto por unidad = presupuestoObraDirecta / numUnidades
 */
export function presupuestoPorUnidad(
  presupuestoObraDirecta: number | null,
  numUnidades: number
): number | null {
  if (presupuestoObraDirecta == null || numUnidades <= 0) return null;
  return presupuestoObraDirecta / numUnidades;
}

/**
 * Predicción de fecha entrega basada en avance y días transcurridos.
 * Si hay fechaEntregaEstimada del proyecto, la usamos como base.
 * Fórmula: díasRestantes = (100 - pctAvance) / velocidad; fechaEstimada = hoy + díasRestantes
 */
export function prediccionFechaEntrega(
  pctAvance: number,
  fechaInicioProyecto: Date | null,
  fechaEntregaEstimada: Date | null
): { fechaEstimada: Date | null; diasRestantes: number | null } {
  if (pctAvance >= 100) {
    return {
      fechaEstimada: new Date(),
      diasRestantes: 0,
    };
  }

  const hoy = new Date();
  const fechaInicio = fechaInicioProyecto ?? fechaEntregaEstimada;

  if (!fechaInicio) {
    return { fechaEstimada: null, diasRestantes: null };
  }

  const msPorDia = 24 * 60 * 60 * 1000;
  const diasTranscurridos = Math.max(
    1,
    Math.floor((hoy.getTime() - new Date(fechaInicio).getTime()) / msPorDia)
  );

  if (pctAvance <= 0) {
    return {
      fechaEstimada: fechaEntregaEstimada,
      diasRestantes: fechaEntregaEstimada
        ? Math.floor((new Date(fechaEntregaEstimada).getTime() - hoy.getTime()) / msPorDia)
        : null,
    };
  }

  const velocidad = pctAvance / diasTranscurridos; // % por día
  const diasRestantes = Math.ceil((100 - pctAvance) / velocidad);
  const fechaEstimada = new Date(hoy.getTime() + diasRestantes * msPorDia);

  return { fechaEstimada, diasRestantes };
}
