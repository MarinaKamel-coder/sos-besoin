import { test, expect } from '@playwright/test';

/**
 * Tests E2E — Sécurité Stripe et accès aux pages de paiement
 *
 * Couvre :
 *  - la protection des pages /success et /cancel (post-paiement) ;
 *  - la sécurité du webhook Stripe contre les requêtes forgées
 *    (validation obligatoire de l'en-tête stripe-signature).
 */
test.describe('Paiement Stripe — Routes protégées et sécurité du webhook', () => {

  test('la page /success requiert une authentification', async ({ page }) => {
    // Après paiement, Stripe redirige vers /success?session_id=... Cette
    // page affiche un récapitulatif de la réservation et ne doit pas être
    // accessible sans session valide.
    await page.goto('/success');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('la page /cancel requiert une authentification', async ({ page }) => {
    // Symétriquement, la page d'annulation doit aussi exiger une session
    // pour éviter qu'un visiteur anonyme puisse forger des paramètres.
    await page.goto('/cancel');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('le webhook Stripe rejette une requête sans en-tête stripe-signature (HTTP 400)', async ({ request }) => {
    // Sécurité critique : tout événement entrant sur /api/webhooks/stripe
    // doit être signé par Stripe. Une requête forgée sans signature doit
    // être rejetée avant toute écriture en base de données.
    const response = await request.post('/api/webhooks/stripe', {
      data: { type: 'checkout.session.completed', data: { object: {} } },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toMatch(/signature/i);
  });

});