import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PostIA Brasil",
  description: "SaaS para geracao de posts, legendas e calendario editorial com IA."
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
