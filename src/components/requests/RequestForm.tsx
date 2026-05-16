"use client";

import { useActionState, useState } from "react";
import { createRequestAction, updateRequestAction } from "../../action/requestActions";
import { RequestUpdateInput, RequestCreateInput, ActionState } from "../../schemas/request";

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
  const [selectedCategory, setSelectedCategory] = useState(initialData?.categoryId ?? "");
  const [newCategoryName, setNewCategoryName] = useState("");

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

  const [state, formAction, isPending] = useActionState(actionWrapper, {
    success: false,
    message: "",
  });

  return (
    <form
      action={formAction}
      className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-slate-900/40 border border-slate-900/80 rounded-2xl backdrop-blur-md shadow-xl space-y-6 text-slate-100"
    >
      {/* En-tête du formulaire */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-black text-white sm:text-2xl">
          {isEdit ? "Modifier la demande" : "Décrire votre besoin"}
        </h2>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
          {isEdit
            ? "Mettez à jour les spécifications et contraintes de votre demande de service."
            : "Remplissez les détails ci-dessous afin de recevoir des propositions ciblées."}
        </p>
      </div>

      {isEdit && (
        <>
          <input type="hidden" name="id" value={initialData.id} />
          <input type="hidden" name="version" value={initialData.version} />
        </>
      )}

      {/* Titre */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Titre de la demande
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={initialData?.title}
          placeholder="Ex: Réparation plomberie sous évier cuisine"
          className={`w-full px-4 py-3 bg-slate-950/40 border text-sm text-slate-100 rounded-xl outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 ${
            state.errors?.title ? "border-rose-500/50 bg-rose-500/5" : "border-slate-800"
          }`}
        />
        {state.errors?.title && (
          <p className="text-rose-400 text-xs font-medium pl-1">{state.errors.title[0]}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Description détaillée
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={initialData?.description}
          placeholder="Détaillez au maximum votre besoin (matériel disponible, accès, contraintes)..."
          className={`w-full px-4 py-3 bg-slate-950/40 border text-sm text-slate-100 rounded-xl outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 resize-none ${
            state.errors?.description ? "border-rose-500/50 bg-rose-500/5" : "border-slate-800"
          }`}
        ></textarea>
        {state.errors?.description && (
          <p className="text-rose-400 text-xs font-medium pl-1">{state.errors.description[0]}</p>
        )}
      </div>

      {/* Grille Date & Lieu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-2">
          <label htmlFor="neededAt" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Date d&apos;exécution souhaitée
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
            className={`w-full px-4 py-3 bg-slate-950/40 border text-sm text-slate-100 rounded-xl outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 ${
              state.errors?.neededAt ? "border-rose-500/50 bg-rose-500/5" : "border-slate-800"
            }`}
          />
          {state.errors?.neededAt && (
            <p className="text-rose-400 text-xs font-medium pl-1">{state.errors.neededAt[0]}</p>
          )}
        </div>

        {/* Lieu */}
        <div className="space-y-2">
          <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Lieu / Ville
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={initialData?.location || ""}
            placeholder="Ex: Longueuil"
            className={`w-full px-4 py-3 bg-slate-950/40 border text-sm text-slate-100 rounded-xl outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 ${
              state.errors?.location ? "border-rose-500/50 bg-rose-500/5" : "border-slate-800"
            }`}
          />
          {state.errors?.location && (
            <p className="text-rose-400 text-xs font-medium pl-1">{state.errors.location[0]}</p>
          )}
        </div>
      </div>

      {/* Catégorie */}
      <div className="space-y-2">
        <label htmlFor="categoryId" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Secteur d&apos;activité / Catégorie
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`w-full px-4 py-3 bg-slate-950/40 border text-sm text-slate-100 rounded-xl outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 appearance-none ${
            state.errors?.categoryId ? "border-rose-500/50 bg-rose-500/5" : "border-slate-800"
          }`}
          style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3e%3cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3e%3c/svg%3e")', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem', backgroundRepeat: 'no-repeat' }}
        >
          <option value="" disabled className="bg-slate-900 text-slate-400">
            Sélectionner une catégorie
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100">
              {cat.name}
            </option>
          ))}
          <option value="autre" className="bg-slate-900 text-blue-400 font-bold">+ Autre (Créer une nouvelle catégorie)</option>
        </select>

        {selectedCategory === "autre" && (
          <div className="mt-3 p-4 bg-slate-950/30 border border-slate-900 rounded-xl space-y-2">
            <input
              type="text"
              name="newCategoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nom de la nouvelle catégorie"
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-blue-500/30 rounded-lg text-sm text-white focus:border-blue-500 outline-none transition-all"
            />
            <p className="text-[11px] text-slate-500 leading-normal pl-0.5">
              💡 Note : Cette catégorie sera ajoutée à la base globale et deviendra accessible instantanément pour l&apos;ensemble de la communauté.
            </p>
          </div>
        )}

        {state.errors?.categoryId && (
          <p className="text-rose-400 text-xs font-medium pl-1">{state.errors.categoryId[0]}</p>
        )}
      </div>

      {/* Bouton de soumission */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide shadow-md transition-all active:scale-[0.99] ${
            isPending
              ? "bg-slate-800 text-slate-500 cursor-wait border border-slate-800"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/5"
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Traitement sécurisé...
            </span>
          ) : isEdit ? (
            "Enregistrer les modifications"
          ) : (
            "Soumettre l&apos;appel d&apos;offre"
          )}
        </button>
      </div>

      {/* Retours d'état d'action */}
      {state.message && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-opacity ${
            state.success
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/5 border-rose-500/20 text-rose-400"
          }`}
        >
          <span className="text-base leading-none mt-0.5">{state.success ? "✓" : "⚠️"}</span>
          <p className="text-xs font-semibold tracking-wide leading-normal">{state.message}</p>
        </div>
      )}
    </form>
  );
}