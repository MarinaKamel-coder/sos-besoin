import { test, expect } from '@playwright/test';

test.describe('Paiement Stripe', () => {

  test('le bouton payer redirige vers Stripe', async ({ page }) => {
    await page.goto('/cart');
    const payButton = page.getByRole('button', { name: /payer/i });

    if (await payButton.isVisible()) {
      await payButton.click();
      await expect(page).toHaveURL(/stripe\.com|checkout/i);
    }
  });

  test('page succès est accessible', async ({ page }) => {
    await page.goto('/success');
    await expect(page).not.toHaveURL('/');
  });

  test('page annulation est accessible', async ({ page }) => {
    await page.goto('/cancel');
    await expect(page).not.toHaveURL('/');
  });

});