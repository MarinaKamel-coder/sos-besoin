import { test, expect } from '@playwright/test';

test.describe('CRUD — Demandes de service', () => {

  // /service-requests est une route protégée : redirection vers Clerk sign-in
  // sans authentification.
  test('redirige vers la connexion si non authentifié', async ({ page }) => {
    await page.goto('/service-requests');
    await expect(page).toHaveURL(/sign-in/);
  });

  // Les tests suivants nécessitent une session Clerk authentifiée.
  // Configurer un storageState dans playwright.config.ts pour les activer.

  test('affiche la liste des demandes', async ({ page }) => {
    test.skip();
    await page.goto('/service-requests');
    await expect(page.getByRole('heading', { level: 1, name: 'Demandes urgentes' })).toBeVisible();
  });

  test('navigue vers le détail d\'une demande', async ({ page }) => {
    test.skip();
    await page.goto('/service-requests');
    const firstRequestLink = page.getByRole('listitem').first().getByRole('link');
    await firstRequestLink.click();
    await expect(page).toHaveURL(/service-requests\/.+/);
  });

  test('page de création de demande est accessible', async ({ page }) => {
    test.skip();
    await page.goto('/service-requests/new');
    await expect(page).toHaveURL(/service-requests\/new/);
  });
});