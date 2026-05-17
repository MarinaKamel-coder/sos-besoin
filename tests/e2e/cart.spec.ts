import { test, expect } from '@playwright/test';

/**
 * Tests E2E — Sécurité et protection du panier
 *
 * Le panier contient des offres acceptées prêtes au paiement. Aucune
 * information ne doit être accessible à un utilisateur non authentifié,
 * et la redirection doit préserver l'intention de l'utilisateur.
 */
test.describe('Panier — Sécurité et redirection', () => {

  test('un visiteur non-authentifié ne peut pas accéder au panier', async ({ page }) => {
    // Tentative d'accès direct par un visiteur anonyme : le middleware
    // doit intercepter et rediriger vers la page de connexion.
    await page.goto('/cart');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('la redirection vers /sign-in contient redirect_url=/cart', async ({ page }) => {
    // Continuité d'UX : après connexion, l'utilisateur doit retrouver
    // exactement le panier qu'il essayait d'ouvrir.
    await page.goto('/cart');
    await expect(page).toHaveURL(/redirect_url=.*cart/);
  });

  test('aucune donnée sensible du panier ne fuit dans la réponse HTML', async ({ page }) => {
    // Vérification de sécurité : la page renvoyée à un visiteur anonyme
    // (la page de connexion suite à redirect) ne doit pas exposer de
    // contenu interne (montants, identifiants Prisma, références d'offre).
    const response = await page.goto('/cart');
    const html = (await response?.text()) ?? '';
    expect(html).not.toMatch(/amountTotal/);
    expect(html).not.toMatch(/offerId.*cmp[a-z0-9]+/i); // pas d'IDs CUID Prisma
  });

});