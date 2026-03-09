"use client";

import { createTheme } from "@mui/material/styles";

/** Tema Vision UI style: fondo oscuro indigo (#111c44), acentos azul y verde */
const theme = createTheme({
  typography: {
    fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
    allVariants: {
      fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#5c95ff",
      light: "#7eb3ff",
      dark: "#3a6ed6",
    },
    secondary: {
      main: "#22c55e",
    },
    background: {
      default: "#0f1218",
      paper: "#111c44",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          borderRight: "1px solid rgba(255,255,255,0.08)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: "0 8px",
          "&.Mui-selected": {
            backgroundColor: "rgba(92, 149, 255, 0.15)",
            "&:hover": {
              backgroundColor: "rgba(92, 149, 255, 0.2)",
            },
          },
        },
      },
    },
  },
});

export default theme;
