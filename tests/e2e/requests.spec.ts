import { test, expect } from '@playwright/test';

/**
 * Tests E2E — Routes des demandes de service
 *
 * Objectif : valider que le middleware Clerk protège correctement les routes
 * sensibles et que la page de connexion publique est accessible sans session.
 * Ces tests ne nécessitent aucune authentification ni donnée en BD : ils
 * vérifient le comportement déterministe du routeur Next.js et du middleware.
 */
test.describe('Demandes de service — Routes et protection middleware', () => {

  test('la route /service-requests est protégée et redirige vers /sign-in', async ({ page }) => {
    // La liste des demandes contient des informations qui exigent une session
    // authentifiée. Sans userId, le middleware doit refuser l'accès.
    await page.goto('/service-requests');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('la redirection préserve la destination originale dans redirect_url', async ({ page }) => {
    // UX critique : après connexion, l'utilisateur doit retomber sur la page
    // qu'il essayait d'atteindre. Clerk ajoute redirect_url=<encoded-url>.
    await page.goto('/service-requests');
    await expect(page).toHaveURL(/redirect_url=.*service-requests/);
  });

  test('la page /sign-in est publique et répond avec un statut 200', async ({ page }) => {
    // /sign-in fait partie des isPublicRoute du middleware ;
    // un visiteur doit pouvoir y accéder sans redirection.
    const response = await page.goto('/sign-in');
    expect(response?.status()).toBe(200);
  });

});