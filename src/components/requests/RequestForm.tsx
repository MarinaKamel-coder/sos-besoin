"use client";

import { useActionState } from "react";
import {
  createRequestAction,
  updateRequestAction,
} from "../../action/requestActions";
import {
  RequestUpdateInput,
  RequestCreateInput,
  ActionState,
} from "../../schemas/request";

interface Category {
  id: string;
  name: string;
}

interface RequestFormProps {
  initialData?: Partial<RequestUpdateInput>;
  categories: Category[];
}

type FormState =
  | ActionState<RequestCreateInput>
  | ActionState<RequestUpdateInput>;

export default function RequestForm({
  initialData,
  categories,
}: RequestFormProps) {
  const isEdit = !!initialData?.id;

  // 2. Utilisez une fonction wrapper pour unifier les signatures
  const actionWrapper = async (
    prevState: unknown,
    formData: FormData,
  ): Promise<FormState> => {
    if (isEdit) {
      return updateRequestAction(
        prevState as ActionState<RequestUpdateInput>,
        formData,
      );
    }
    return createRequestAction(
      prevState as ActionState<RequestCreateInput>,
      formData,
    );
  };

  // 3. Passez le wrapper à useActionState
  const [state, formAction, isPending] = useActionState(actionWrapper, {
    success: false,
    message: "",
  });

  return (
    <form
      action={formAction}
      className="max-w-2xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6 text-white"
    >
      <div className="border-b border-slate-800 pb-4 mb-6">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          {isEdit ? "Modifier la demande" : "Nouveau besoin"}
        </h2>
        <p className="text-slate-400 mt-1">
          {isEdit
            ? "Mettez à jour les informations de votre demande de service."
            : "Décrivez votre besoin pour recevoir des offres de nos prestataires."}
        </p>
      </div>

      {/* Champs cachés cruciaux pour l'Update (Verrouillage Optimiste) */}
      {isEdit && (
        <>
          <input type="hidden" name="id" value={initialData.id} />
          <input type="hidden" name="version" value={initialData.version} />
        </>
      )}

      {/* Titre du service */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-slate-300"
        >
          Titre
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={initialData?.title}
          placeholder="Ex: Réparation plomberie cuisine"
          className={`w-full p-3 bg-slate-800 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
            state.errors?.title
              ? "border-red-500 shadow-sm shadow-red-500/20"
              : "border-slate-700"
          }`}
        />
        {state.errors?.title && (
          <p className="text-red-400 text-xs italic">{state.errors.title[0]}</p>
        )}
      </div>

      {/* Description détaillée */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-slate-300"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={initialData?.description}
          placeholder="Détaillez votre besoin ici..."
          className={`w-full p-3 bg-slate-800 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
            state.errors?.description
              ? "border-red-500 shadow-sm shadow-red-500/20"
              : "border-slate-700"
          }`}
        ></textarea>
        {state.errors?.description && (
          <p className="text-red-400 text-xs italic">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date du besoin */}
        <div className="space-y-2">
          <label
            htmlFor="neededAt"
            className="block text-sm font-semibold text-slate-300"
          >
            Date souhaitée
          </label>
          <input
            id="neededAt"
            name="neededAt"
            type="date"
            defaultValue={
              initialData?.neededAt
                ? new Date(initialData.neededAt).toISOString().split("T")[0]
                : ""
            }
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {state.errors?.neededAt && (
            <p className="text-red-400 text-xs italic">
              {state.errors.neededAt[0]}
            </p>
          )}
        </div>

        {/* Localisation */}
        <div className="space-y-2">
          <label
            htmlFor="location"
            className="block text-sm font-semibold text-slate-300"
          >
            Lieu (Ville)
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={initialData?.location || ""}
            placeholder="Ex: Longueuil"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {state.errors?.location && (
            <p className="text-red-400 text-xs italic">
              {state.errors.location[0]}
            </p>
          )}
        </div>
      </div>

      {/* Catégorie */}
      <div className="space-y-2">
        <label
          htmlFor="categoryId"
          className="block text-sm font-semibold text-slate-300"
        >
          Catégorie
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={initialData?.categoryId ?? ""}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="" disabled>
            Sélectionner une catégorie
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {state.errors?.categoryId && (
          <p className="text-red-400 text-xs italic">
            {state.errors.categoryId[0]}
          </p>
        )}
      </div>

      {/* Bouton de soumission */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 ${
            isPending
              ? "bg-slate-700 cursor-wait text-slate-400"
              : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-500/20"
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Enregistrement...
            </span>
          ) : isEdit ? (
            "Mettre à jour la demande"
          ) : (
            "Publier ma demande"
          )}
        </button>
      </div>

      {/* Retour d'information (Succès ou Erreur globale) */}
      {state.message && (
        <div
          className={`mt-4 p-4 rounded-xl border flex items-center gap-3 animate-pulse-once ${
            state.success
              ? "bg-green-500/10 border-green-500/50 text-green-400"
              : "bg-red-500/10 border-red-500/50 text-red-400"
          }`}
        >
          <span className="text-xl">{state.success ? "✓" : "⚠"}</span>
          <p className="text-sm font-medium">{state.message}</p>
        </div>
      )}
    </form>
  );
}
