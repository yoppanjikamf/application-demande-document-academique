import { Building2, GraduationCap, MapPin, ShieldCheck } from "lucide-react";

export const loginPortals = [
  {
    href: "/auth/login",
    label: "Espace élève",
    hint: "Matricule, e-mail et mot de passe",
    icon: GraduationCap,
  },
  {
    href: "/auth/login/obc",
    label: "Administration OBC",
    hint: "Baccalauréat, Probatoire et relevés",
    icon: ShieldCheck,
  },
  {
    href: "/auth/login/decc",
    label: "Administration DECC",
    hint: "BEPC et dossiers DECC",
    icon: Building2,
  },
  {
    href: "/auth/login/centre-examen",
    label: "Centre d'examen",
    hint: "Confirmation des retraits",
    icon: MapPin,
  },
] as const;
