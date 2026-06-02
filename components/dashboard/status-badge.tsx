// Badge de statut unifié pour documents, paiements et rendez-vous.
import type { ReactNode } from "react";
import { CheckCircle2, Clock3, Info, XCircle } from "lucide-react";

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
  slate: "bg-[#F8F9FA] text-[#4B5563] ring-[#E5E7EB]",
  blue: "bg-[#E3F2FD] text-[#1565C0] ring-[#BBDEFB]",
  green: "bg-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]",
  orange: "bg-[#FEF3C7] text-[#B45309] ring-[#FDE68A]",
  amber: "bg-[#FEF3C7] text-[#B45309] ring-[#FDE68A]",
  red: "bg-[#FEE2E2] text-[#DC2626] ring-[#FECACA]",
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
  const Icon =
    resolvedTone === "green"
      ? CheckCircle2
      : resolvedTone === "red"
        ? XCircle
        : resolvedTone === "blue"
          ? Info
          : Clock3;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        tones[resolvedTone],
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
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
