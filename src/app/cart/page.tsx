import {
  getCart,
  // updateCartItemQuantity, // désactivé — 1 offre = 1 réservation
  removeFromCart,
  clearCart,
  confirmCart,
} from "../../action/cart";

export default async function CartPage() {
  const cart = await getCart();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Panier</h1>

      {cart.items.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-lg font-medium">Votre panier est vide.</p>
          <p className="mt-2 text-sm text-gray-500">
            Ajoutez une offre pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <div key={item.id} className="rounded-xl border p-4">
                <h2 className="text-lg font-semibold">{item.offer.request.title}</h2>
                <p className="text-sm text-gray-500">
                  Prestataire : {item.offer.provider.name ?? item.offer.provider.email}
                </p>
                <p className="mt-2 text-sm">{item.offer.message}</p>
                <p className="mt-2 font-medium">
                  Prix : {(item.offer.price / 100).toFixed(2)} $
                </p>

                {/* NOTE: boutons +/- quantité désactivés — 1 offre = 1 réservation, pas de multi-exemplaire */}
                {/* <div className="mt-4 flex items-center gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1));
                    }}
                  >
                    <button type="submit" className="rounded border px-3 py-1">
                      -
                    </button>
                  </form>

                  <span>{item.quantity}</span>

                  <form
                    action={async () => {
                      "use server";
                      await updateCartItemQuantity(item.id, item.quantity + 1);
                    }}
                  >
                    <button type="submit" className="rounded border px-3 py-1">
                      +
                    </button>
                  </form>

                  <form
                    action={async () => {
                      "use server";
                      await removeFromCart(item.id);
                    }}
                    className="ml-auto"
                  >
                    <button
                      type="submit"
                      className="rounded bg-red-600 px-3 py-1 text-white"
                    >
                      Supprimer
                    </button>
                  </form>
                </div> */}
                <div className="mt-4 flex items-center gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await removeFromCart(item.id);
                    }}
                    className="ml-auto"
                  >
                    <button
                      type="submit"
                      className="rounded bg-red-600 px-3 py-1 text-white"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-xl border p-4">
            <h2 className="mb-4 text-lg font-semibold">Résumé</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{(cart.subtotal / 100).toFixed(2)} $</span>
              </div>
              <div className="flex justify-between">
                <span>Frais plateforme</span>
                <span>{(cart.platformFee / 100).toFixed(2)} $</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>{(cart.total / 100).toFixed(2)} $</span>
              </div>
            </div>

            <form
              action={async () => {
                "use server";
                await confirmCart();
              }}
              className="mt-4"
            >
              <button
                type="submit"
                className="w-full rounded bg-black px-4 py-2 text-white"
              >
                Confirmer et procéder au paiement
              </button>
            </form>

            <form
              action={async () => {
                "use server";
                await clearCart();
              }}
              className="mt-2"
            >
              <button
                type="submit"
                className="w-full rounded border px-4 py-2"
              >
                Vider le panier
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
