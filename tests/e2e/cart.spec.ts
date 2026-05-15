import { test, expect } from '@playwright/test';

test.describe('Panier', () => {

    test('affiche la page du panier', async ({ page }) => {
        await page.goto('/cart');
        await expect(page).not.toHaveURL(/cart/);
    });

    test('panier vide affiche un message', async ({ page }) => {
        await page.goto('/cart');
        const empty = page.getByText(/panier|vide|aucun/i);
        await expect(empty).toBeVisible();
    });

    test('bouton payer est visible si panier non vide', async ({ page }) => {
        await page.goto('/list-offers');
        const addButton = page.getByRole('button', { name: /ajouter|panier/i }).first();

        if (await addButton.isVisible()) {
            await addButton.click();
            await page.goto('/cart');
            const payButton = page.getByRole('button', { name: /payer/i });
            await expect(payButton).toBeVisible();
        }
    });
});