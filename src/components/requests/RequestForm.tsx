"use client";

import { useActionState } from "react";
import { createRequestAction, updateRequestAction } from "../../action/requestActions";
import { ActionState } from "../../shemas/request";

interface RequestFormProps {
  request?: any; // Les données existantes en cas de modification
  categories: { id: string; name: string }[]; // Liste pour le menu déroulant
}

export default function RequestForm({ request, categories }: RequestFormProps) {
  const isEdit = !!request;
  
  // 1. Sélection de l'action appropriée
  const formAction = isEdit ? updateRequestAction : createRequestAction;

  // 2. État initial du formulaire
  const initialState: ActionState<any> = {
    success: false,
    message: "",
  };

  // 3. Hook pour lier le formulaire à la Server Action
  const [state, action, isPending] = useActionState(formAction, initialState);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? "Modifier ma demande" : "Publier un nouveau besoin"}
      </h2>

      <form action={action} className="space-y-4">
        {/* Champs cachés pour l'ID et le Verrou Optimiste (Édition uniquement) */}
        {isEdit && (
          <>
            <input type="hidden" name="id" value={request.id} />
            <input type="hidden" name="version" value={request.version} />
          </>
        )}

        {/* TITRE */}
        <div>
          <label className="block text-sm font-semibold mb-1">Titre</label>
          <input
            name="title"
            defaultValue={request?.title}
            placeholder="Ex: Besoin d'aide pour mon déménagement"
            className={`w-full p-2 border rounded ${state.errors?.title ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.title && (
            <p className="text-red-500 text-xs mt-1">{state.errors.title[0]}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={request?.description}
            rows={4}
            placeholder="Détaillez votre besoin ici..."
            className={`w-full p-2 border rounded ${state.errors?.description ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.description && (
            <p className="text-red-500 text-xs mt-1">{state.errors.description[0]}</p>
          )}
        </div>

        {/* DATE DU BESOIN (Coercion Zod) */}
        <div>
          <label className="block text-sm font-semibold mb-1">Date souhaitée</label>
          <input
            name="neededAt"
            type="datetime-local"
            aria-label="neededAt"
            defaultValue={request?.neededAt ? new Date(request.neededAt).toISOString().slice(0, 16) : ""}
            className={`w-full p-2 border rounded ${state.errors?.neededAt ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.neededAt && (
            <p className="text-red-500 text-xs mt-1">{state.errors.neededAt[0]}</p>
          )}
        </div>

        {/* LOCALISATION (Optionnel selon ton Zod) */}
        <div>
          <label className="block text-sm font-semibold mb-1">Lieu (Ville ou Quartier)</label>
          <input
            name="location"
            aria-label="location"
            defaultValue={request?.location}
            className="w-full p-2 border rounded border-gray-300"
          />
          {state.errors?.location && (
            <p className="text-red-500 text-xs mt-1">{state.errors.location[0]}</p>
          )}
        </div>

        {/* CATÉGORIE (N-N relation) */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-semibold mb-1">Catégorie de service</label>
            <select
              name="categoryId"
              aria-label="categoryId"
              className={`w-full p-2 border rounded ${state.errors?.categoryId ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">-- Choisir une catégorie --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {state.errors?.categoryId && (
              <p className="text-red-500 text-xs mt-1">{state.errors.categoryId[0]}</p>
            )}
          </div>
        )}

        {/* ALERTES DE STATUT (Succès / Erreur globale / Conflit) */}
        {state.message && (
          <div className={`p-4 rounded-md text-sm ${state.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {state.message}
          </div>
        )}

        {/* BOUTON DE SOUMISSION */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition disabled:bg-gray-400"
        >
          {isPending ? (
            <span className="flex items-center justify-center">
              Traitement en cours...
            </span>
          ) : (
            isEdit ? "Enregistrer les modifications" : "Publier ma demande"
          )}
        </button>
      </form>
    </div>
  );
}