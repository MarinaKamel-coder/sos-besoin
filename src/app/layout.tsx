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

// Métadonnées professionnelles pour SOSBesoin
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
    <html lang="fr" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-purple-500/30 selection:text-purple-200`}
      >
        <ClerkProvider>
          {/* Synchronisation du rôle Clerk/Prisma */}
          <SyncUserRole />
          
          {/* Barre de navigation globale */}
          <Header />
          
          {/* Conteneur principal flexible avec support pour le flou et les halos de fond */}
          <div className="flex-1 flex flex-col relative isolating z-0 overflow-x-hidden">
            {/* Effet optionnel : Si tu veux un très léger halo néon ambiant persistant en arrière-plan */}
            <div className="absolute top-[-10%] left-[-10%] -z-10 w-[50vw] h-[50vw] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] -z-10 w-[50vw] h-[50vw] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}