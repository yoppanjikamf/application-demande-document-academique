// Carte statistique réutilisable pour les tableaux de bord.
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type StatCardTone = "default" | "blue" | "green" | "orange" | "amber" | "red";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
  tone?: StatCardTone;
  className?: string;
}

const toneClasses: Record<StatCardTone, string> = {
  default: "bg-[#D8F3DC] text-[#1B4332] ring-[#B7E4C7]",
  blue: "bg-[#E3F2FD] text-[#1565C0] ring-[#BBDEFB]",
  green: "bg-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]",
  orange: "bg-[#FEF3C7] text-[#B45309] ring-[#FDE68A]",
  amber: "bg-[#FEF3C7] text-[#B45309] ring-[#FDE68A]",
  red: "bg-[#FEE2E2] text-[#DC2626] ring-[#FECACA]",
};

export function StatCard({
  label,
  value,
  icon,
  description,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-colors hover:border-[#B7E4C7]",
        className,
      )}
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
            toneClasses[tone],
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-mono text-2xl font-semibold leading-none tracking-normal text-[#1B4332]">
            {value}
          </p>
          <p className="mt-2 text-sm font-medium text-[#4B5563]">{label}</p>
          {description ? (
            <p className="mt-2 text-xs leading-5 text-[#6B7280]">{description}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
