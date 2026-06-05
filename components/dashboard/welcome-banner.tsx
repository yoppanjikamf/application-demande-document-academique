import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type WelcomeAccent = "eleve" | "admin" | "agent";

const accentGradient: Record<WelcomeAccent, string> = {
  eleve: "from-edu-800 via-edu-700 to-edu-600",
  admin: "from-obc-900 via-obc-800 to-obc-700",
  agent: "from-[#78350f] via-[#92400e] to-[#b45309]",
};

const accentGlow: Record<WelcomeAccent, string> = {
  eleve: "bg-edu-400/25",
  admin: "bg-gold-400/20",
  agent: "bg-gold-300/25",
};

export function WelcomeBanner({
  accent,
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  trailing,
}: {
  accent: WelcomeAccent;
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  icon: ComponentType<{ className?: string }>;
  trailing?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br p-6 text-white shadow-card",
        accentGradient[accent],
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl",
          accentGlow[accent],
        )}
        aria-hidden="true"
      />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10">
            <Icon className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-2xl font-bold leading-tight">{title}</h2>
            {subtitle ? (
              <p className="mt-2 text-sm leading-6 text-white/80">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {trailing ? <div className="lg:justify-self-end">{trailing}</div> : null}
      </div>
    </section>
  );
}
