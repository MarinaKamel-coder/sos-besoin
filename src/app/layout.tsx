import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import SyncUserRole from "../components/SyncUserRole";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Des métadonnées professionnelles pour SOSBesoin
export const metadata: Metadata = {
  title: "SOSBesoin | Plateforme de services de proximité",
  description: "Publiez vos demandes de service et recevez des offres de prestataires qualifiés.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-950 text-slate-100`}
      >
        <ClerkProvider>
          {/* Synchronisation du rôle Clerk/Prisma */}
          <SyncUserRole />
          
          {/* Barre de navigation globale */}
          <Header />
          
          {/* Conteneur principal flexible pour vos pages */}
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}