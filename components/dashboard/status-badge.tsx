// Badge de statut unifié pour documents, paiements et rendez-vous.
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone = "slate" | "blue" | "green" | "orange" | "amber" | "red";
export type StatusKind = "document" | "payment" | "appointment" | "notification";
export type StatusValue =
  | "PAS_DISPONIBLE"
  | "DISPONIBLE"
  | "RETIRE"
  | "EN_ATTENTE"
  | "EFFECTUE"
  | "ANNULE"
  | "PLANIFIE"
  | "CONFIRME"
  | "HONORE"
  | "ENVOYEE"
  | "RECUE"
  | "LUE";

const tones: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-50 text-blue-900 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  orange: "bg-amber-50 text-amber-800 ring-amber-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
};

const statusLabels: Partial<Record<StatusValue, string>> = {
  PAS_DISPONIBLE: "En attente",
  DISPONIBLE: "Disponible",
  RETIRE: "Retiré",
  EN_ATTENTE: "En attente",
  EFFECTUE: "Effectué",
  ANNULE: "Annulé",
  PLANIFIE: "Planifié",
  CONFIRME: "Confirmé",
  HONORE: "Honoré",
  ENVOYEE: "Envoyée",
  RECUE: "Reçue",
  LUE: "Lue",
};

function toneForStatus(status: StatusValue): BadgeTone {
  if (
    status === "DISPONIBLE" ||
    status === "EFFECTUE" ||
    status === "HONORE" ||
    status === "CONFIRME"
  ) {
    return "green";
  }

  if (
    status === "PAS_DISPONIBLE" ||
    status === "EN_ATTENTE" ||
    status === "PLANIFIE" ||
    status === "RECUE"
  ) {
    return "orange";
  }

  if (status === "ANNULE") {
    return "red";
  }

  return "slate";
}

export function StatusBadge(props: {
  children?: ReactNode;
  tone?: BadgeTone;
  status?: StatusValue;
  type?: StatusKind;
  className?: string;
}) {
  const { children, tone, status, className } = props;
  const resolvedTone = tone ?? (status ? toneForStatus(status) : "slate");
  const label = children ?? (status ? (statusLabels[status] ?? status) : null);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        tones[resolvedTone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function documentTone(status: "PAS_DISPONIBLE" | "DISPONIBLE" | "RETIRE") {
  return toneForStatus(status);
}

export function appointmentTone(status: "PLANIFIE" | "CONFIRME" | "ANNULE" | "HONORE") {
  return toneForStatus(status);
}

export function paymentTone(status: "EN_ATTENTE" | "EFFECTUE" | "ANNULE") {
  return toneForStatus(status);
}
