import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gender Reveal - Fille ou Garçon ?",
  description: "Application de gender reveal avec pronostics des invités",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
