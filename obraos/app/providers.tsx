"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import theme from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <MuiThemeProvider theme={theme}>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}
