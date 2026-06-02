import { Check, Clock, Download, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type StatusTone = "pending" | "ready" | "validated" | "rejected";

const toneStyles: Record<StatusTone, { className: string; icon: typeof Clock; label: string }> = {
  pending: {
    className: "bg-[#FBF2D1] text-[#7A5C12] ring-[#E6D39A]",
    icon: Clock,
    label: "En attente",
  },
  ready: {
    className: "bg-[#E7F3EC] text-[#1A7A4A] ring-[#B7D8C4]",
    icon: Download,
    label: "Pret a retirer",
  },
  validated: {
    className: "bg-[#E7F3EC] text-[#1A7A4A] ring-[#B7D8C4]",
    icon: Check,
    label: "Valide",
  },
  rejected: {
    className: "bg-[#F8E3E3] text-[#9B1C1C] ring-[#F0B4B4]",
    icon: X,
    label: "Rejete",
  },
};

export function StatusPill({
  tone,
  label,
  className,
}: {
  tone: StatusTone;
  label?: string;
  className?: string;
}) {
  const { className: toneClassName, icon: Icon, label: defaultLabel } = toneStyles[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        toneClassName,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label ?? defaultLabel}
    </span>
  );
}
