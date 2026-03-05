import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kiron Code",
  description: "Descubre tu carta natal y tu perfil astrológico con tus datos de nacimiento."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
