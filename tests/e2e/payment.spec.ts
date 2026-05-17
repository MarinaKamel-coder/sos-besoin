import { test, expect } from '@playwright/test';

test.describe('Paiement Stripe', () => {

  // Nécessite une session authentifiée avec un article dans le panier.
  // Configurer un storageState dans playwright.config.ts pour activer ce test.
  test('le bouton Payer avec Stripe redirige vers Stripe', async ({ page }) => {
    test.skip();
    await page.goto('/cart');
    const payButton = page.getByRole('button', { name: 'Payer avec Stripe' });
    await expect(payButton).toBeVisible();
    await payButton.click();
    await expect(page).toHaveURL(/stripe\.com|checkout/i);
  });

  // /success et /cancel sont des routes protégées : redirection vers sign-in
  // pour un utilisateur non authentifié.
  test('page succès redirige vers la connexion si non authentifié', async ({ page }) => {
    await page.goto('/success');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('page annulation redirige vers la connexion si non authentifié', async ({ page }) => {
    await page.goto('/cancel');
    await expect(page).toHaveURL(/sign-in/);
  });

});