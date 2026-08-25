import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Gympass — Movimento que transforma",
  description: "Encontre academias, faça check-ins e acompanhe sua jornada.",
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
