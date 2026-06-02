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
  default: "bg-obc-50 text-obc-700 ring-obc-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-obc-50 text-[var(--status-available)] ring-obc-200",
  orange: "bg-gold-100 text-[var(--status-pending)] ring-gold-300",
  amber: "bg-gold-100 text-[var(--status-pending)] ring-gold-300",
  red: "bg-red-50 text-[var(--status-cancelled)] ring-red-200",
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
        "rounded-lg border border-[var(--border-token)] bg-surface-0 p-6 shadow-card transition-[var(--transition-base)] hover:-translate-y-0.5 hover:border-obc-200 hover:shadow-hover",
        className,
      )}
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
            toneClasses[tone],
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-display text-3xl leading-none text-text-1">
            {value}
          </p>
          <p className="mt-2 text-sm font-semibold text-text-2">{label}</p>
          {description ? (
            <p className="mt-2 text-xs leading-5 text-text-3">{description}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
