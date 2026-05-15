import { test, expect } from '@playwright/test';

test.describe( 'CRUD — Demandes de service', () => {

    test('affiche la liste des demandes', async ({ page }) => {
        await page.goto('/service-requests');
        await expect(page).toHaveTitle(/sos-besoin/i);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('navique vers le detail d\'une demande', async ({ page }) => {
        await page.goto('/service-requests');
        const firstLink = page.getByRole('link').first();
        await firstLink.click();
        await expect(page).toHaveURL(/service-requests\/.+/);
    });

    test('page de création de demande est accessible', async ({ page }) => {
        await page.goto('/service-requests/new');
        await expect(page).not.toHaveURL('/');
    });
});