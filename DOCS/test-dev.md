# Page de développement — `/test-dev`

Accessible uniquement en local (`NODE_ENV === "development"`).
En production, toute visite redirige automatiquement vers `/`.

---

## Accès

- URL : `http://localhost:3000/test-dev`
- Lien dans le Header (badge jaune **Test Dev**), visible uniquement en dev
- Requiert d'être connecté avec Clerk

---

## Fonctionnalités

### Réinitialiser mes données de test

Bouton **"Réinitialiser et aller aux offres →"**

Ce que ça fait, dans l'ordre :

1. Vérifie que `NODE_ENV === "development"` (guard `assertDev()`)
2. Récupère l'utilisateur connecté via Clerk (`auth()`)
3. Crée l'utilisateur en BD s'il n'existe pas encore (role `CLIENT`)
4. **Supprime** toutes les données de cet utilisateur uniquement :
   - Paiements → Bookings → CartItems → Offres → RequestCategories → ServiceRequests → Cart
5. **Recrée** des prestataires fictifs si absents (via `upsert` sur `clerkId`) :
   - `clerk_provider_001` — Alex Guitariste
   - `clerk_provider_003` — Marco Déménagement
   - `clerk_provider_004` — Léa Transport
6. **Recrée** 2 demandes de service :
   - _Cours de guitare_ (catégorie musique)
   - _Déménagement appartement_ (catégorie déménagement)
7. **Recrée** 3 offres `PENDING` sur ces demandes (une par prestataire)
8. Redirige vers `/list-offers` pour tester le flux panier

> ⚠️ Seules **vos propres données** sont supprimées/recréées.  
> Les autres utilisateurs et leurs données ne sont pas affectés.

---

## Liens rapides

La page contient aussi des liens directs vers :

- `/list-offers` — liste des offres PENDING pour le client connecté
- `/cart` — panier en cours
- `/service-requests` — liste des demandes de service

---

## Fichiers concernés

| Fichier                       | Rôle                                     |
| ----------------------------- | ---------------------------------------- |
| `src/app/test-dev/page.tsx`   | UI de la page, guard de production       |
| `src/app/test-dev/actions.ts` | Server action `resetMyTestData()`        |
| `src/components/Header.tsx`   | Lien "Test Dev" (visible dev uniquement) |

---

## Différence avec `prisma/seed.ts`

|               | `seed.ts`                        | `resetMyTestData()`               |
| ------------- | -------------------------------- | --------------------------------- |
| Scope         | Toute la base                    | Utilisateur connecté uniquement   |
| Utilisation   | `npm run seed` (CLI)             | Bouton dans le navigateur         |
| Environnement | Dev uniquement                   | Dev uniquement                    |
| Effet         | Recrée **tous** les utilisateurs | Recrée uniquement **vos** données |
