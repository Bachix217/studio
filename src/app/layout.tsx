import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { FirebaseProvider } from "@/firebase/provider";
import BottomNavBar from "@/components/layout/BottomNavBar";

export const metadata: Metadata = {
  title: "Tacoto.ch - Achetez et vendez des voitures en Suisse",
  description: "La plateforme de confiance pour l'achat et la vente de voitures d'occasion en Suisse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚗</text></svg>" />
      </head>
      <body className={cn("font-body antialiased min-h-screen flex flex-col", "bg-background")}>
        <FirebaseProvider>
          <div className="flex-grow pb-16 md:pb-0">{children}</div>
          <BottomNavBar />
        </FirebaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
