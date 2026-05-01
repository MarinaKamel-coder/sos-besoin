import { Role } from "../src/generated/prisma/client";
import prisma from "../src/lib/prisma";

// Commission plateforme (10%)
const PLATFORM_FEE_BPS = 1000; // basis points: 1000 = 10%

function fee(subtotal: number) {
  return Math.round((subtotal * PLATFORM_FEE_BPS) / 10000);
}

async function main() {
  console.log("🌱 Seeding SOS-BESOIN...");

  // 1) Nettoyage (ordre inverse des dépendances)
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.requestCategory.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.category.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.user.deleteMany();

  // 2) Utilisateurs
  const admin = await prisma.user.create({
    data: {
      clerkId: "clerk_admin_001",
      email: "admin@sos-besoin.test",
      name: "Admin SOS",
      role: Role.ADMIN,
      profile: {
        create: {
          bio: "Gestionnaire de la plateforme SOS-BESOIN.",
          city: "Montréal",
          phone: "514-000-0000",
        },
      },
    },
  });

  // Compte réel de test — clerkId correspond à l'utilisateur connecté en dev
  const realTestUser = await prisma.user.upsert({
    where: { clerkId: "user_3D43kOjvSSHuy2f2IkSxTkB5woA" },
    update: { role: Role.CLIENT },
    create: {
      clerkId: "user_3D43kOjvSSHuy2f2IkSxTkB5woA",
      email: "test@sos-besoin.dev",
      name: "Sonia (test)",
      role: Role.CLIENT,
    },
  });

  const client = await prisma.user.create({
    data: {
      clerkId: "clerk_client_001",
      email: "client@sos-besoin.test",
      name: "Camille Client",
      role: Role.CLIENT,
      profile: {
        create: {
          bio: "Organisateur(trice) d'événements et client régulier.",
          city: "Montréal",
        },
      },
    },
  });

  const provider1 = await prisma.user.create({
    data: {
      clerkId: "clerk_provider_001",
      email: "pro.guitar@sos-besoin.test",
      name: "Alex Guitariste",
      role: Role.PROVIDER,
      profile: {
        create: {
          bio: "Guitariste remplaçant, lecture à vue, styles rock/jazz.",
          city: "Montréal",
          phone: "514-111-1111",
        },
      },
    },
  });

  const provider2 = await prisma.user.create({
    data: {
      clerkId: "clerk_provider_002",
      email: "pro.writer@sos-besoin.test",
      name: "Sam Correctrice",
      role: Role.PROVIDER,
      profile: {
        create: {
          bio: "Correction/révision FR-EN, CV, lettres, documents scolaires.",
          city: "Laval",
          phone: "450-222-2222",
        },
      },
    },
  });

  // 3) Catégories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Musique", slug: "musique" } }),
    prisma.category.create({ data: { name: "Maison", slug: "maison" } }),
    prisma.category.create({ data: { name: "Rédaction", slug: "redaction" } }),
    prisma.category.create({ data: { name: "Tech", slug: "tech" } }),
    prisma.category.create({
      data: { name: "Événementiel", slug: "evenementiel" },
    }),
  ]);

  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  // 4) Demandes (ServiceRequest) + catégories (N-N)
  const now = new Date();
  const inDays = (d: number) =>
    new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const provider3 = await prisma.user.create({
    data: {
      clerkId: "clerk_provider_003",
      email: "pro.demenagement@sos-besoin.test",
      name: "Marco Déménagement",
      role: Role.PROVIDER,
      profile: {
        create: {
          bio: "Aide au déménagement depuis 8 ans. Spécialiste meubles lourds, escaliers étroits, emballage fragile. Camionnette disponible.",
          city: "Montréal",
          phone: "514-333-3333",
        },
      },
    },
  });

  const provider4 = await prisma.user.create({
    data: {
      clerkId: "clerk_provider_004",
      email: "pro.transport@sos-besoin.test",
      name: "Léa Transport & Déménagement",
      role: Role.PROVIDER,
      profile: {
        create: {
          bio: "Équipe de 2 personnes disponible le weekend. Expérience appartements montréalais, démontage/remontage de meubles IKEA inclus.",
          city: "Laval",
          phone: "450-444-4444",
        },
      },
    },
  });

  // Demande appartenant au compte réel de test (pour tester le panier)
  const reqReal = await prisma.serviceRequest.create({
    data: {
      clientId: realTestUser.id,
      title: "SOS: aide déménagement urgent ce weekend",
      description:
        "Besoin d'aide pour déménager quelques meubles lourds. Camion fourni, besoin de 2-3 bras.",
      neededAt: inDays(3),
      location: "Montréal (Villeray)",
      categories: {
        create: [{ categoryId: catBySlug["maison"].id }],
      },
    },
  });

  await prisma.offer.create({
    data: {
      requestId: reqReal.id,
      providerId: provider3.id,
      price: 9500, // 95.00$
      message: "Disponible samedi dès 8h. Habitué aux déménagements Villeray/Rosemont, je connais bien les ruelles. Meubles lourds aucun problème.",
    },
  });

  await prisma.offer.create({
    data: {
      requestId: reqReal.id,
      providerId: provider4.id,
      price: 11000, // 110.00$
      message: "On peut venir à 2 ce weekend. Démontage/remontage inclus si nécessaire, on apporte le matériel d'emballage.",
    },
  });

  const req1 = await prisma.serviceRequest.create({
    data: {
      clientId: client.id,
      title: "SOS: guitariste remplaçant pour show",
      description:
        "Notre guitariste est malade. Set de 90 minutes, style rock/pop. Matériel sur place.",
      neededAt: inDays(2),
      location: "Montréal (Plateau)",
      categories: {
        create: [
          { categoryId: catBySlug["musique"].id },
          { categoryId: catBySlug["evenementiel"].id },
        ],
      },
    },
  });

  const req2 = await prisma.serviceRequest.create({
    data: {
      clientId: client.id,
      title: "SOS: correction urgente (10 pages)",
      description:
        "Besoin d'une correction orthographe/grammaire et mise en forme légère. Livraison demain soir.",
      neededAt: inDays(1),
      location: "En ligne",
      categories: {
        create: [{ categoryId: catBySlug["redaction"].id }],
      },
    },
  });

  const req3 = await prisma.serviceRequest.create({
    data: {
      clientId: client.id,
      title: "SOS: dépannage Wi-Fi (routeur + mesh)",
      description:
        "Instabilité Wi-Fi depuis une mise à jour. Besoin diagnostic et configuration stable.",
      neededAt: inDays(3),
      location: "Montréal (Rosemont)",
      categories: {
        create: [
          { categoryId: catBySlug["tech"].id },
          { categoryId: catBySlug["maison"].id },
        ],
      },
    },
  });

  // 5) Offres (5 offres)
  const offer1 = await prisma.offer.create({
    data: {
      requestId: req1.id,
      providerId: provider1.id,
      price: 25000, // 250.00
      message:
        "Disponible. Je peux arriver 1h avant pour soundcheck. Répertoire rock/pop OK.",
    },
  });

  const offer2 = await prisma.offer.create({
    data: {
      requestId: req1.id,
      providerId: provider2.id,
      price: 18000,
      message:
        "Je ne suis pas guitariste, mais je peux aider à l'organisation backstage si besoin.",
    },
  });

  const offer3 = await prisma.offer.create({
    data: {
      requestId: req2.id,
      providerId: provider2.id,
      price: 9000,
      message:
        "Je peux corriger 10 pages d'ici demain 18h, avec annotations et version finale.",
    },
  });

  const offer4 = await prisma.offer.create({
    data: {
      requestId: req3.id,
      providerId: provider1.id,
      price: 12000,
      message:
        "Je peux passer pour diagnostiquer le réseau (canaux, DNS, mesh) et stabiliser.",
    },
  });

  const offer5 = await prisma.offer.create({
    data: {
      requestId: req3.id,
      providerId: provider2.id,
      price: 11000,
      message:
        "Je peux faire un diagnostic à distance (si accès routeur) + recommandations.",
    },
  });

  // 6) Créer 1 booking + 1 payment (démo)
  // On "accepte" offer1 pour req1
  const subtotal = offer1.price;
  const platformFee = fee(subtotal);
  const total = subtotal + platformFee;

  const booking = await prisma.booking.create({
    data: {
      requestId: req1.id,
      offerId: offer1.id,
      amountSubtotal: subtotal,
      platformFee,
      amountTotal: total,
      status: "CONFIRMED",
      payment: {
        create: {
          status: "SUCCEEDED",
          stripePaymentIntentId: "pi_test_seed_001",
        },
      },
    },
  });

  // Mettre des statuts cohérents côté demande/offres (optionnel mais plus réaliste)
  await prisma.serviceRequest.update({
    where: { id: req1.id },
    data: { status: "FILLED" },
  });

  await prisma.offer.update({
    where: { id: offer1.id },
    data: { status: "ACCEPTED", booking: { connect: { id: booking.id } } },
  });

  await prisma.offer.update({
    where: { id: offer2.id },
    data: { status: "REJECTED" },
  });

  await prisma.adminAction.create({
    data: {
      adminId: admin.id,
      action: "Initial seed executed",
    },
  });

  console.log("✅ Seed terminé avec succès.");
  console.log({
    users: { admin: admin.email, client: client.email },
    providers: [provider1.email, provider2.email, provider3.email, provider4.email],
    requests: [req1.title, req2.title, req3.title, reqReal.title],
    offers: [offer1.id, offer2.id, offer3.id, offer4.id, offer5.id].length + 2,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
