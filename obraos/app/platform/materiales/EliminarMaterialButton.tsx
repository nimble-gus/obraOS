"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EliminarMaterialButton({
  materialId,
  nombre,
}: {
  materialId: string;
  nombre: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar "${nombre}" del inventario? Ya no aparecerá en el catálogo.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/materiales/${materialId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al eliminar");
      }
    } catch {
      alert("Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleEliminar}
      disabled={loading}
      className="rounded border px-2 py-1 text-xs font-medium transition hover:opacity-80 disabled:opacity-50"
      style={{ borderColor: "var(--red)", color: "var(--red)" }}
      title="Eliminar del inventario"
    >
      {loading ? "…" : "Eliminar"}
    </button>
  );
}
