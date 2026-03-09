"use client";

type Servicio = {
  id: string;
  nombre: string;
  unidad: string;
  costoUnitario: number;
  tipoServicio?: { id: string; nombre: string } | null;
};

export function ServiciosList({
  servicios,
  puedeAgregar,
}: {
  servicios: Servicio[];
  puedeAgregar: boolean;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
    >
      <div className="border-b px-4 py-4" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-bold">Catálogo de servicios</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: "var(--bg3)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>
                Tipo
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>
                Servicio
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>
                Unidad
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>
                Costo unitario
              </th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((s) => (
              <tr
                key={s.id}
                className="transition hover:bg-black/5"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <td className="px-4 py-3" style={{ color: "var(--text3)" }}>
                  {s.tipoServicio?.nombre ?? "—"}
                </td>
                <td className="px-4 py-3 font-semibold">{s.nombre}</td>
                <td className="px-4 py-3" style={{ color: "var(--text3)" }}>
                  {s.unidad}
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: "var(--accent)" }}>
                  Q{s.costoUnitario.toFixed(2)} / {s.unidad}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {servicios.length === 0 && (
        <div className="py-12 text-center" style={{ color: "var(--text3)" }}>
          No hay servicios en el catálogo
        </div>
      )}
    </div>
  );
}
