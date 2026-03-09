"use client";

import { useRouter } from "next/navigation";

export function ProyectoSelector({
  proyectos,
  value,
}: {
  proyectos: { id: string; nombre: string }[];
  value?: string | null;
}) {
  const router = useRouter();

  return (
    <select
      value={value ?? ""}
      className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
      style={{
        background: "var(--bg2)",
        borderColor: "var(--border2)",
        color: "var(--text)",
      }}
      onChange={(e) => {
        const id = e.target.value;
        if (id) router.push(`/platform/visor?proyecto=${id}`);
      }}
    >
      <option value="">— Proyecto —</option>
      {proyectos.map((p) => (
        <option key={p.id} value={p.id}>
          {p.nombre}
        </option>
      ))}
    </select>
  );
}
