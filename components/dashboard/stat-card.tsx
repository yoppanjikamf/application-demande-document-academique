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
  default: "bg-blue-50 text-blue-900 ring-blue-100",
  blue: "bg-blue-50 text-blue-900 ring-blue-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  orange: "bg-amber-50 text-amber-700 ring-amber-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  red: "bg-red-50 text-red-700 ring-red-100",
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
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300",
        className,
      )}
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
            toneClasses[tone],
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-mono text-2xl font-semibold leading-none tracking-normal text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-600">{label}</p>
          {description ? (
            <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
