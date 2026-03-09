"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

type Desglose = {
  materiales: number;
  planilla: number;
  costosVarios: { tipoNombre: string; monto: number }[];
};

type PresupuestoRubro = { id: string; rubro: string; pctPresupuesto: number };

type ProyectoData = {
  id: string;
  nombre: string;
  presupuestoTotal: number;
  costoComprometido: number;
  restante: number;
  costoIndirectos: number;
  contingencia: number;
  margenObjetivo: number;
  pctCostosIndirectos: number;
  pctContingencia: number;
  precioVenta: number;
  fechaEntregaEstimada: Date | null;
  pctAvance: number;
};

function montoPorRubro(desglose: Desglose): Record<string, number> {
  const m: Record<string, number> = {};
  if (desglose.materiales > 0) m["Materiales"] = desglose.materiales;
  if (desglose.planilla > 0) m["Planilla"] = desglose.planilla;
  for (const { tipoNombre, monto } of desglose.costosVarios) {
    if (monto > 0) m[tipoNombre] = (m[tipoNombre] ?? 0) + monto;
  }
  return m;
}

function semaforo(ratio: number): "verde" | "amarillo" | "rojo" {
  if (ratio < 0.8) return "verde";
  if (ratio <= 1) return "amarillo";
  return "rojo";
}

export function ProyectoDashboardClient({
  proyecto,
  desglose,
  presupuestoRubros,
  puedeConfigurar,
}: {
  proyecto: ProyectoData;
  desglose: Desglose;
  presupuestoRubros: PresupuestoRubro[];
  puedeConfigurar: boolean;
}) {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingRubros, setLoadingRubros] = useState(false);
  const [addRubroValue, setAddRubroValue] = useState("");
  const [rubrosForm, setRubrosForm] = useState<{ rubro: string; pctPresupuesto: number }[]>(
    () =>
      presupuestoRubros.map((r) => ({
        rubro: r.rubro,
        pctPresupuesto: Number.isFinite(r.pctPresupuesto) ? r.pctPresupuesto * 100 : 20,
      }))
  );
  useEffect(() => {
    setRubrosForm(
      presupuestoRubros.map((r) => ({
        rubro: r.rubro,
        pctPresupuesto: Number.isFinite(r.pctPresupuesto) ? r.pctPresupuesto * 100 : 20,
      }))
    );
  }, [presupuestoRubros]);
  const montosPorRubro = montoPorRubro(desglose);
  const presupuestoTotal = proyecto.presupuestoTotal || 0;
  const pctInd = proyecto.pctCostosIndirectos ?? 0;
  const pctCont = proyecto.pctContingencia ?? 0;
  const pctMargen = proyecto.margenObjetivo ?? 0;
  const presupuestoObraDirecta = presupuestoTotal * Math.max(0, 1 - pctInd - pctCont - pctMargen);
  const restanteObra = Math.max(0, presupuestoObraDirecta - proyecto.costoComprometido);

  const [form, setForm] = useState({
    presupuestoTotal: proyecto.presupuestoTotal ?? 0,
    margenObjetivo: ((proyecto.margenObjetivo ?? 0.25) * 100) || 25,
    pctCostosIndirectos: ((proyecto.pctCostosIndirectos ?? 0.12) * 100) || 12,
    pctContingencia: ((proyecto.pctContingencia ?? 0.05) * 100) || 5,
  });

  const presupuestoData = [
    { name: "Avance de presupuesto", value: proyecto.costoComprometido, color: theme.palette.primary.main },
    { name: "Restante", value: restanteObra, color: theme.palette.success.main },
  ].filter((d) => d.value > 0);

  const avanceData = [
    { name: "Avance", value: proyecto.pctAvance, fill: theme.palette.primary.main },
    { name: "Pendiente", value: 100 - proyecto.pctAvance, fill: theme.palette.action.hover },
  ];

  const todosRubros = [
    "Materiales",
    "Planilla",
    ...desglose.costosVarios.map((c) => c.tipoNombre),
  ];
  const rubrosDisponibles = todosRubros.filter(
    (r) => !rubrosForm.some((f) => f.rubro === r)
  );
  const rubrosUnicos = [...new Set(rubrosDisponibles)];

  const handleGuardarRubros = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeConfigurar) return;
    setLoadingRubros(true);
    try {
      const res = await fetch(`/api/proyectos/${proyecto.id}/presupuesto-rubros`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rubros: rubrosForm.map((r) => ({
            rubro: r.rubro,
            pctPresupuesto: (r.pctPresupuesto || 0) / 100,
          })),
        }),
      });
      if (res.ok) router.refresh();
      else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al guardar");
      }
    } finally {
      setLoadingRubros(false);
    }
  };

  const handleGuardarModelo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeConfigurar) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/proyectos/${proyecto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presupuestoTotal: form.presupuestoTotal || null,
          margenObjetivo: (form.margenObjetivo ?? 25) / 100,
          pctCostosIndirectos: (form.pctCostosIndirectos ?? 12) / 100,
          pctContingencia: (form.pctContingencia ?? 5) / 100,
        }),
      });
      if (res.ok) router.refresh();
      else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al guardar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" } }}>
      {/* Indicadores presupuesto */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Presupuesto</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={500}>Obra directa</Typography>
            <Typography variant="h6" fontWeight={700} fontFamily="monospace" sx={{ mt: 0.5 }}>Q{Math.round(presupuestoObraDirecta).toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace" display="block">Total − indirectos − contingencia − margen</Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={500}>Avance de presupuesto</Typography>
            <Typography variant="h6" fontWeight={700} fontFamily="monospace" color="primary.main" sx={{ mt: 0.5 }}>Q{Math.round(proyecto.costoComprometido).toLocaleString()}</Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={500}>Restante</Typography>
            <Typography variant="h6" fontWeight={700} fontFamily="monospace" sx={{ mt: 0.5 }} color={restanteObra < 0 ? "error.main" : "success.main"}>
              Q{Math.round(restanteObra).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {presupuestoData.length > 0 && (
          <Box sx={{ height: 192, fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={presupuestoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  cornerRadius={8}
                  dataKey="value"
                  nameKey="name"
                >
                  {presupuestoData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `Q${Math.round(Number(v ?? 0)).toLocaleString()}`}
                  contentStyle={{ fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif", borderRadius: 8, border: `1px solid ${theme.palette.divider}` }}
                />
                <Legend wrapperStyle={{ fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif" }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
        </CardContent>
      </Card>

      {/* Desglose por rubros */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Desglose por rubros</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {desglose.materiales > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1.5, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
              <Typography color="text.secondary">Materiales</Typography>
              <Typography fontFamily="monospace" fontWeight={600}>Q{Math.round(desglose.materiales).toLocaleString()}</Typography>
            </Box>
          )}
          {desglose.planilla > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1.5, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
              <Typography color="text.secondary">Planilla</Typography>
              <Typography fontFamily="monospace" fontWeight={600}>Q{Math.round(desglose.planilla).toLocaleString()}</Typography>
            </Box>
          )}
          {desglose.costosVarios.map(({ tipoNombre, monto }) => (
            <Box key={tipoNombre} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1.5, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
              <Typography color="text.secondary">{tipoNombre}</Typography>
              <Typography fontFamily="monospace" fontWeight={600}>Q{Math.round(monto).toLocaleString()}</Typography>
            </Box>
          ))}
        </Box>
        {desglose.materiales === 0 && desglose.planilla === 0 && desglose.costosVarios.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            Sin avance de presupuesto aún. Agrega materiales, servicios o planilla en el Visor 3D.
          </Typography>
        )}
        </CardContent>
      </Card>

      {/* Semáforo financiero */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Semáforo financiero</Typography>
        {presupuestoRubros.length === 0 || presupuestoObraDirecta <= 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            Configura límites por rubro en el modelo financiero para ver el semáforo.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {presupuestoRubros.map((r) => {
              const monto = montosPorRubro[r.rubro] ?? 0;
              const limite = presupuestoObraDirecta * r.pctPresupuesto;
              const ratio = limite > 0 ? monto / limite : 0;
              const s = semaforo(ratio);
              const color =
                s === "verde"
                  ? "var(--green)"
                  : s === "amarillo"
                    ? "var(--accent)"
                    : "var(--red)";
              return (
                <Box
                  key={r.id}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, px: 2, py: 1.5, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}
                >
                  <Typography color="text.secondary">{r.rubro}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography variant="body2" fontFamily="monospace">
                      Q{Math.round(monto).toLocaleString()} / Q{Math.round(limite).toLocaleString()}
                    </Typography>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        bgcolor: `${color}33`,
                        color,
                        border: `2px solid ${color}`,
                      }}
                    >
                      {s === "verde" ? <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> : s === "amarillo" ? "!" : "X"}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
        </CardContent>
      </Card>

      {/* Avance OPEX */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Avance OPEX</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 96,
              height: 96,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              fontSize: "1.5rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, rgba(92,149,255,0.2), rgba(92,149,255,0.05))",
              color: "primary.main",
            }}
          >
            {proyecto.pctAvance}%
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">Progreso total del proyecto</Typography>
            <LinearProgress
              variant="determinate"
              value={proyecto.pctAvance}
              sx={{ mt: 1, maxWidth: 320, height: 8, borderRadius: 1 }}
            />
          </Box>
        </Box>

        <Box sx={{ height: 176, fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Pie
                data={avanceData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                cornerRadius={10}
                dataKey="value"
                nameKey="name"
              >
                {avanceData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => `${Number(v ?? 0)}%`}
                contentStyle={{ fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif", borderRadius: 8, border: `1px solid ${theme.palette.divider}` }}
              />
              <Legend wrapperStyle={{ fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif" }} />
            </PieChart>
            </ResponsiveContainer>
        </Box>
        </CardContent>
      </Card>

      {/* Modelo financiero */}
      <Card sx={{ gridColumn: { xs: "1", lg: "1 / -1" } }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Modelo financiero</Typography>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, mb: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={500}>Costos indirectos</Typography>
            <Typography variant="body2" fontFamily="monospace" fontWeight={600} sx={{ mt: 0.5 }}>
              Q{Math.round(proyecto.costoIndirectos).toLocaleString()}{" "}
              <Typography component="span" variant="caption" color="text.secondary" fontWeight={400}>
                ({(proyecto.pctCostosIndirectos * 100).toFixed(0)}%)
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={500}>Contingencia</Typography>
            <Typography variant="body2" fontFamily="monospace" fontWeight={600} sx={{ mt: 0.5 }}>
              Q{Math.round(proyecto.contingencia).toLocaleString()}{" "}
              <Typography component="span" variant="caption" color="text.secondary" fontWeight={400}>
                ({(proyecto.pctContingencia * 100).toFixed(0)}%)
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={500}>Margen objetivo</Typography>
            <Typography variant="body2" fontFamily="monospace" fontWeight={600} sx={{ mt: 0.5 }}>{((proyecto.margenObjetivo ?? 0) * 100).toFixed(0)}%</Typography>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={500}>Precio venta</Typography>
            <Typography variant="body2" fontFamily="monospace" fontWeight={600} sx={{ mt: 0.5 }}>Q{Math.round(proyecto.precioVenta).toLocaleString()}</Typography>
          </Box>
        </Box>

        {puedeConfigurar ? (
          <Box
            component="form"
            onSubmit={handleGuardarModelo}
            sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 2, p: 2, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}
          >
            <TextField
              label="Presupuesto total (Q)"
              type="number"
              size="small"
              InputProps={{ inputProps: { min: 0, step: 1000 } }}
              value={form.presupuestoTotal || ""}
              onChange={(e) => setForm((f) => ({ ...f, presupuestoTotal: parseFloat(e.target.value) || 0 }))}
              sx={{ width: 140 }}
            />
            <TextField
              label="Margen objetivo (%)"
              type="number"
              size="small"
              InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
              value={Number.isFinite(form.margenObjetivo) ? form.margenObjetivo : ""}
              onChange={(e) => setForm((f) => ({ ...f, margenObjetivo: parseFloat(e.target.value) ?? 25 }))}
              sx={{ width: 100 }}
            />
            <TextField
              label="Costos indirectos (%)"
              type="number"
              size="small"
              InputProps={{ inputProps: { min: 0, max: 100, step: 0.5 } }}
              value={Number.isFinite(form.pctCostosIndirectos) ? form.pctCostosIndirectos : ""}
              onChange={(e) => setForm((f) => ({ ...f, pctCostosIndirectos: parseFloat(e.target.value) ?? 12 }))}
              sx={{ width: 100 }}
            />
            <TextField
              label="Contingencia (%)"
              type="number"
              size="small"
              InputProps={{ inputProps: { min: 0, max: 100, step: 0.5 } }}
              value={Number.isFinite(form.pctContingencia) ? form.pctContingencia : ""}
              onChange={(e) => setForm((f) => ({ ...f, pctContingencia: parseFloat(e.target.value) ?? 5 }))}
              sx={{ width: 100 }}
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Guardando…" : "Guardar"}
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Solo el administrador puede configurar el modelo financiero. Contacta a un admin para realizar cambios.
          </Typography>
        )}

        {puedeConfigurar && (
          <>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1.5 }}>Límites por rubro (semáforo)</Typography>
            <Box
              component="form"
              onSubmit={handleGuardarRubros}
              sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {rubrosForm.map((r, i) => (
                  <Box key={r.rubro} sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" fontWeight={500} sx={{ minWidth: 120 }}>{r.rubro}</Typography>
                    <TextField
                      type="number"
                      size="small"
                      InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
                      value={Number.isFinite(r.pctPresupuesto) ? r.pctPresupuesto : ""}
                      onChange={(e) =>
                        setRubrosForm((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, pctPresupuesto: parseFloat(e.target.value) || 0 } : x
                          )
                        )
                      }
                      sx={{ width: 64 }}
                    />
                    <Typography variant="body2" color="text.secondary">%</Typography>
                    <Button
                      type="button"
                      size="small"
                      onClick={() => setRubrosForm((prev) => prev.filter((_, j) => j !== i))}
                      sx={{ color: "error.main", minWidth: "auto", px: 1 }}
                    >
                      Quitar
                    </Button>
                  </Box>
                ))}
              </Box>
              {rubrosDisponibles.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, pt: 2, borderTop: 1, borderColor: "divider" }}>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>+ Agregar rubro</InputLabel>
                    <Select
                      value={addRubroValue}
                      label="+ Agregar rubro"
                      onChange={(e) => {
                        const v = e.target.value as string;
                        if (v) {
                          setRubrosForm((prev) => [...prev, { rubro: v, pctPresupuesto: 20 }]);
                          setAddRubroValue("");
                        }
                      }}
                    >
                      {rubrosUnicos.map((rub) => (
                        <MenuItem key={rub} value={rub}>{rub}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              <Button type="submit" variant="contained" disabled={loadingRubros}>
                {loadingRubros ? "Guardando…" : "Guardar límites"}
              </Button>
            </Box>
          </>
        )}
        </CardContent>
      </Card>
    </Box>
  );
}
