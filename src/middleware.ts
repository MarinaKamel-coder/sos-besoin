import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Définition des routes publiques (accessibles sans connexion).
 * Cela inclut la page d'accueil, les listes de demandes et les formulaires d'authentification.
 * Protection des accès 
 */
const isPublicRoute = createRouteMatcher([
  '/', 
  '/requests(.*)', 
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/webhooks/stripe' // Toujours public pour recevoir les notifications de paiement 
]);

export default clerkMiddleware(async (auth, request) => {
  // Protection des routes privées (Dashboard, création d'offres, profil)
  if (!isPublicRoute(request)) {
    await auth.protect(); 
  }
});

export const config = {
  matcher: [
    /**
     * Exclusion des fichiers internes Next.js et des fichiers statiques.
     * Le middleware ne s'exécute que sur les routes dynamiques pour optimiser les performances.
     */
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    /**
     * Toujours exécuter pour les routes API et tRPC.
     * Crucial pour la validation CSRF automatique des Server Actions.
     */
    '/(api|trpc)(.*)',
  ],
};