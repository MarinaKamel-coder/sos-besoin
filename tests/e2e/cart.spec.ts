import { test, expect } from '@playwright/test';

test.describe('Panier', () => {

  // Le panier est une route protégée : un utilisateur non authentifié doit être
  // redirigé vers la page de connexion Clerk.
  test('redirige vers la connexion si non authentifié', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL(/sign-in/);
  });

  // Les deux tests suivants nécessitent une session Clerk authentifiée.
  // Configurer un storageState dans playwright.config.ts pour les activer.

  test('panier vide affiche un message', async ({ page }) => {
    test.skip();
    await page.goto('/cart');
    await expect(page.getByText('Votre panier est vide.')).toBeVisible();
  });

  test('bouton Payer avec Stripe est visible si panier non vide', async ({ page }) => {
    test.skip();
    await page.goto('/cart');
    const payButton = page.getByRole('button', { name: 'Payer avec Stripe' });
    await expect(payButton).toBeVisible();
  });
});