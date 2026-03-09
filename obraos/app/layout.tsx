import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "obraOS - Gestión de Proyectos",
  description: "Plataforma de gestión de proyectos de construcción",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("obraos-theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",t==="light"||t==="dark"?t:d?"dark":"light");})()`,
          }}
        />
      </head>
      <body
        className="font-sans antialiased"
        style={{ fontFamily: "var(--font-poppins), system-ui, sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
