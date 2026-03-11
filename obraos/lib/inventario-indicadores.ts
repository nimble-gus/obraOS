/**
 * Indicadores del módulo de inventario.
 * - Proyección de agotamiento
 * - Trazabilidad (historial de movimientos)
 */

export type ProyeccionAgotamiento = {
  diasHastaAgotamiento: number | null;
  consumoPromedioPorDia: number;
  diasAnalizados: number;
  mensaje: string;
};

/**
 * Calcula la proyección de agotamiento de un material.
 * Basado en las salidas de los últimos N días (default 30).
 * Si no hay salidas, no se puede proyectar.
 */
export function calcularProyeccionAgotamiento(
  stockActual: number,
  salidasRecientes: { cantidad: number; createdAt: Date | string }[],
  diasAnalisis = 30
): ProyeccionAgotamiento {
  if (stockActual <= 0) {
    return {
      diasHastaAgotamiento: 0,
      consumoPromedioPorDia: 0,
      diasAnalizados: 0,
      mensaje: "Stock agotado",
    };
  }

  const ahora = new Date();
  const cutoff = new Date(ahora);
  cutoff.setDate(cutoff.getDate() - diasAnalisis);

  const salidasFiltradas = salidasRecientes.filter((s) => new Date(s.createdAt) >= cutoff);
  const totalConsumido = salidasFiltradas.reduce((sum, s) => sum + s.cantidad, 0);

  if (totalConsumido <= 0) {
    return {
      diasHastaAgotamiento: null,
      consumoPromedioPorDia: 0,
      diasAnalizados: diasAnalisis,
      mensaje: `Sin consumo registrado en los últimos ${diasAnalisis} días. No se puede proyectar.`,
    };
  }

  const consumoPromedioPorDia = totalConsumido / diasAnalisis;
  const diasHastaAgotamiento = Math.floor(stockActual / consumoPromedioPorDia);

  return {
    diasHastaAgotamiento,
    consumoPromedioPorDia,
    diasAnalizados: diasAnalisis,
    mensaje: `Stock actual: ${stockActual}. Consumo promedio: ${consumoPromedioPorDia.toFixed(1)}/día. Se agotará en ~${diasHastaAgotamiento} días.`,
  };
}
