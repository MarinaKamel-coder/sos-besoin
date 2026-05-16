import { redirect } from "next/navigation";

/** Redirection : la liste paginée des offres reçues est sur /offres-recues */
export default function ListOffersRedirectPage() {
  redirect("/offres-recues?offerStatus=PENDING");
}
