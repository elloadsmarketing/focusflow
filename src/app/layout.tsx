import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FocusFlow – Produtividade com Foco",
  description: "App de produtividade com timer, alarmes e rotina diária",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
