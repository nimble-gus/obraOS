"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "./Link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { signOut } from "next-auth/react";
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon as MenuItemIcon,
} from "@mui/material";
import {
  Home as HomeIcon,
  ViewInAr as VisorIcon,
  Inventory as MaterialesIcon,
  Assignment as PlanillaIcon,
  AttachMoney as ServiciosIcon,
  People as EquipoIcon,
  DarkMode as MoonIcon,
  LightMode as SunIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminPortalIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { MODULOS, puedeVerModulo } from "@/lib/permissions";

const DRAWER_WIDTH = 240;

const icons: Record<string, React.ReactNode> = {
  proyectos: <HomeIcon fontSize="small" />,
  visor: <VisorIcon fontSize="small" />,
  materiales: <MaterialesIcon fontSize="small" />,
  planilla: <PlanillaIcon fontSize="small" />,
  servicios: <ServiciosIcon fontSize="small" />,
  equipo: <EquipoIcon fontSize="small" />,
};

const navByModulo: Record<string, { href: string; label: string; iconKey: string }> = {
  proyectos: { href: "/platform/proyectos", label: "Proyectos", iconKey: "proyectos" },
  visor: { href: "/platform/visor", label: "Visor 3D", iconKey: "visor" },
  materiales: { href: "/platform/materiales", label: "Materiales", iconKey: "materiales" },
  planilla: { href: "/platform/planilla", label: "Planilla", iconKey: "planilla" },
  servicios: { href: "/platform/servicios", label: "Costos varios", iconKey: "servicios" },
  equipo: { href: "/platform/equipo", label: "Equipo PM", iconKey: "equipo" },
};

function NavItem({
  href,
  label,
  iconKey,
  pathname,
}: {
  href: string;
  label: string;
  iconKey: string;
  pathname: string;
}) {
  const active =
    pathname === href || (href !== "/platform" && pathname.startsWith(href));

  return (
    <ListItemButton
      component={Link}
      href={href}
      selected={active}
      sx={{
        color: active ? "primary.main" : "text.secondary",
        "& .MuiListItemIcon-root": {
          color: active ? "primary.main" : "text.secondary",
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{icons[iconKey]}</ListItemIcon>
      <ListItemText primary={label} primaryTypographyProps={{ fontWeight: active ? 600 : 400 }} />
    </ListItemButton>
  );
}

export function PlatformShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: { user?: { nombre?: string; role?: string; modulosAcceso?: string[] } } | null;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const rol = session?.user?.role ?? "";
  const modulosAcceso = session?.user?.modulosAcceso;
  const navPrincipal = MODULOS.slice(0, 2).filter((m) =>
    puedeVerModulo(rol, m, modulosAcceso)
  );
  const navGestion = MODULOS.slice(2).filter((m) =>
    puedeVerModulo(rol, m, modulosAcceso)
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar - MUI Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#111c44",
            color: "white",
          },
        }}
      >
        <Box sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Image
            src="/obri.png"
            alt="obraOS"
            width={160}
            height={40}
            priority
            style={{ objectFit: "contain" }}
          />
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <Box sx={{ flex: 1, overflow: "auto", py: 2, px: 1 }}>
          {navPrincipal.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ px: 2, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5, display: "block", mb: 1 }}>
                Principal
              </Typography>
              <List dense disablePadding>
                {navPrincipal.map((mod) => {
                  const item = navByModulo[mod];
                  return item ? (
                    <NavItem key={mod} {...item} pathname={pathname} />
                  ) : null;
                })}
              </List>
            </Box>
          )}
          {navGestion.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ px: 2, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5, display: "block", mb: 1 }}>
                Gestión
              </Typography>
              <List dense disablePadding>
                {navGestion.map((mod) => {
                  const item = navByModulo[mod];
                  return item ? (
                    <NavItem key={mod} {...item} pathname={pathname} />
                  ) : null;
                })}
              </List>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, bgcolor: "background.default" }}>
        <Box sx={{ flexShrink: 0, p: 2, pt: 2.5 }}>
          <Box
            component="header"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "98%",
              mx: "auto",
              px: 3,
              py: 1.5,
              borderRadius: "16px",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <Box sx={{ flex: 1 }} />
            <IconButton
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={theme === "light" ? "Cambiar a oscuro" : "Cambiar a claro"}
              size="small"
              sx={{
                bgcolor: "action.hover",
                mr: 1,
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </IconButton>
            <IconButton
              onClick={handleAvatarClick}
              aria-controls={menuOpen ? "user-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? "true" : undefined}
              sx={{ p: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "primary.main",
                  color: "white",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {session?.user?.nombre?.slice(0, 2).toUpperCase() ?? "?"}
              </Avatar>
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  elevation: 8,
                  sx: { mt: 1.5, minWidth: 200, borderRadius: 2 },
                },
              }}
            >
              <MenuItem component={Link} href="/platform" onClick={handleMenuClose}>
                <MenuItemIcon>
                  <PersonIcon fontSize="small" />
                </MenuItemIcon>
                Mi perfil
              </MenuItem>
              {session?.user?.role === "ADMIN" && (
                <MenuItem component={Link} href="/admin" onClick={handleMenuClose}>
                  <MenuItemIcon>
                    <AdminPortalIcon fontSize="small" />
                  </MenuItemIcon>
                  Admin portal
                </MenuItem>
              )}
              <Divider />
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  signOut({ callbackUrl: "/auth/login" });
                }}
                sx={{ color: "error.main" }}
              >
                <MenuItemIcon sx={{ color: "error.main" }}>
                  <LogoutIcon fontSize="small" />
                </MenuItemIcon>
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        <Box component="main" sx={{ flex: 1, overflow: "auto", px: 3, pb: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
