/**
 * Remplacez ces entrées par de vrais témoignages lorsque vous en disposez.
 * Gardez isPlaceholder: false uniquement pour les retours authentifiés et validés.
 */
export type LandingTestimonial = {
  quote: string;
  role: string;
  isPlaceholder: boolean;
};

export const landingTestimonials: LandingTestimonial[] = [
  {
    quote:
      "Les élèves voient enfin où en est leur dossier. Nous recevons beaucoup moins d'appels pour un simple statut.",
    role: "Administration régionale",
    isPlaceholder: true,
  },
  {
    quote:
      "La prise de rendez-vous a désengorgé le guichet : les retraits s'enchaînent sans bousculade.",
    role: "Centre d'examen",
    isPlaceholder: true,
  },
  {
    quote:
      "J'ai activé mon compte en quelques minutes et reçu une notification dès que mon relevé était disponible.",
    role: "Élève",
    isPlaceholder: true,
  },
];
