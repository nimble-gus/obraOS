"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "@/app/components/Link";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera as PhotoCameraIcon, Add as AddIcon } from "@mui/icons-material";
import { UnidadesAvanceExpandible } from "./UnidadesAvanceExpandible";

const TIPO_LABEL: Record<string, string> = {
  RESIDENCIAL: "Residencial",
  APARTAMENTOS: "Apartamentos",
  VILLAS: "Villas",
  CONDOMINIO: "Condominio",
  COMERCIAL: "Comercial",
};

type ProyectoCard = {
  id: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  imagenUrl?: string | null;
  numUnidades: number;
  presupuestoObra: number;
  pmAsignado: { nombre: string };
  pctTotal: number;
  pctPorUnidad: { etiqueta: string; numero: number; pct: number }[];
};

export function ProyectosGrid({
  proyectos,
  esAdmin = false,
  puedeCrear = false,
}: {
  proyectos: ProyectoCard[];
  esAdmin?: boolean;
  puedeCrear?: boolean;
}) {
  const router = useRouter();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleAddImage = async (proyectoId: string, file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploadingId(proyectoId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/proyectos/${proyectoId}/imagen`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir imagen");

      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
      }}
    >
      {proyectos.map((p) => {
        const pct = p.pctTotal;
        const status = pct >= 80 ? "done" : pct >= 20 ? "active" : "planning";
        const colorTheme =
          status === "done"
            ? "success.main"
            : status === "active"
              ? "primary.main"
              : "info.main";
        const colorCss =
          status === "done"
            ? "var(--green)"
            : status === "active"
              ? "var(--accent)"
              : "var(--blue)";

        return (
          <Card
            key={p.id}
            sx={{
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
              overflow: "hidden",
            }}
          >
              <Box
              sx={{
                position: "relative",
                height: 144,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: p.imagenUrl
                  ? "transparent"
                  : `linear-gradient(135deg, ${status === "done" ? "rgba(34,197,94,0.15)" : status === "active" ? "rgba(92,149,255,0.15)" : "rgba(59,130,246,0.15)"}, ${status === "done" ? "rgba(34,197,94,0.05)" : status === "active" ? "rgba(92,149,255,0.05)" : "rgba(59,130,246,0.05)"})`,
              }}
            >
              {p.imagenUrl ? (
                <Image
                  src={`/api/proyectos/${p.id}/imagen`}
                  alt={p.nombre}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              ) : (
                <Typography variant="overline" fontWeight={600} color={colorTheme}>
                  {TIPO_LABEL[p.tipo] ?? "Proyecto"}
                </Typography>
              )}
              <Chip
                label={status === "done" ? `${pct}% LISTO` : status === "active" ? "ACTIVO" : "INICIO"}
                size="small"
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  bgcolor: "rgba(15,23,42,0.9)", // fondo oscuro para máximo contraste
                  color: "#f9fafb",
                  zIndex: 1,
                  backdropFilter: "blur(6px)",
                  boxShadow: `0 0 0 1px ${colorTheme}`,
                }}
              />
              {esAdmin && (
                <IconButton
                  size="small"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const input = fileInputRefs.current[p.id];
                    if (input) input.click();
                  }}
                  disabled={uploadingId === p.id}
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "white",
                    zIndex: 1,
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                    "&:disabled": { bgcolor: "rgba(0,0,0,0.3)" },
                  }}
                >
                  {uploadingId === p.id ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PhotoCameraIcon fontSize="small" />
                  )}
                </IconButton>
              )}
              <input
                ref={(el) => {
                  fileInputRefs.current[p.id] = el;
                }}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAddImage(p.id, file);
                  e.target.value = "";
                }}
              />
            </Box>
            <CardContent
              component={Link}
              href={`/platform/proyectos/${p.id}`}
              sx={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                {p.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                {p.tipo} · {p.ubicacion}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  <Box component="span" fontWeight={600} color="text.primary">
                    {p.numUnidades}
                  </Box>
                  {" "}Unidades
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Box component="span" fontWeight={600} color="text.primary">
                    Q{p.presupuestoObra >= 1e6 ? `${(p.presupuestoObra / 1e6).toFixed(1)}M` : Math.round(p.presupuestoObra).toLocaleString()}
                  </Box>
                  {" "}Presupuesto
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  mb: 1.5,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    bgcolor: colorTheme,
                  },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  PM: <Box component="span" fontWeight={600} color="text.secondary">{p.pmAsignado.nombre}</Box>
                </Typography>
                <Typography variant="caption" fontWeight={600} color={colorTheme}>
                  {pct}% total
                </Typography>
              </Box>
              {p.pctPorUnidad.length > 0 && (
                <UnidadesAvanceExpandible
                  pctPorUnidad={p.pctPorUnidad}
                  pctTotal={pct}
                  color={colorCss}
                />
              )}
            </CardContent>
          </Card>
        );
      })}

      {puedeCrear && (
        <Card
          component={Link}
          href="/platform/proyectos/nuevo"
          sx={{
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed rgba(148,163,184,0.6)",
            background:
              "radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 60%)",
            textDecoration: "none",
            color: "inherit",
            transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s, background-color 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: 4,
              borderColor: "var(--accent)",
              backgroundColor: "rgba(15,23,42,0.9)",
            },
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1.5,
              bgcolor: "rgba(59,130,246,0.12)",
              color: "var(--accent)",
            }}
          >
            <AddIcon />
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Agregar proyecto
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, maxWidth: 200, textAlign: "center" }}
          >
            Crea un nuevo proyecto para empezar a dar seguimiento.
          </Typography>
        </Card>
      )}
    </Box>
  );
}
