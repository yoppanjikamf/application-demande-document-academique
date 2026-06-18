"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Fingerprint,
  GraduationCap,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { useI18n } from "@/components/i18n/locale-provider";
import { DocScolLogo } from "@/components/ui/DocScolLogo";
import { getLoginPortals } from "@/lib/i18n/login-portals";
import { cn } from "@/lib/utils";

export type AuthPortal = "eleve" | "obc" | "decc" | "agent" | "register";

type PortalMeta = {
  eyebrow: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  badge: string;
  promo: string;
  sub: string;
  current: string | null;
};

const portalStyles: Record<
  AuthPortal,
  Pick<PortalMeta, "icon" | "accent" | "badge" | "current">
> = {
  eleve: {
    icon: GraduationCap,
    accent: "text-edu-300",
    badge: "border-edu-300/30 bg-edu-500/15",
    current: "/auth/login",
  },
  obc: {
    icon: ShieldCheck,
    accent: "text-gold-300",
    badge: "border-gold-300/30 bg-gold-400/15",
    current: "/auth/login/obc",
  },
  decc: {
    icon: Building2,
    accent: "text-gold-300",
    badge: "border-gold-300/30 bg-gold-400/15",
    current: "/auth/login/decc",
  },
  agent: {
    icon: MapPin,
    accent: "text-gold-300",
    badge: "border-gold-300/30 bg-gold-400/15",
    current: "/auth/login/centre-examen",
  },
  register: {
    icon: Fingerprint,
    accent: "text-edu-300",
    badge: "border-edu-300/30 bg-edu-500/15",
    current: null,
  },
};

export function AuthShell({
  title,
  description,
  children,
  portal = "eleve",
}: {
  title: string;
  description: string;
  children: ReactNode;
  portal?: AuthPortal;
}) {
  const { t } = useI18n();
  const loginPortals = getLoginPortals(t);
  const styles = portalStyles[portal];
  const Icon = styles.icon;
  const otherPortals = loginPortals.filter((p) => p.href !== styles.current);

  const meta: PortalMeta = {
    ...styles,
    eyebrow:
      portal === "eleve"
        ? t("auth.studentEyebrow")
        : portal === "obc"
          ? t("auth.obcEyebrow")
          : portal === "decc"
            ? t("auth.deccEyebrow")
            : portal === "agent"
              ? t("auth.agentEyebrow")
              : t("auth.registerEyebrow"),
    promo:
      portal === "eleve"
        ? t("auth.studentPromo")
        : portal === "obc"
          ? t("auth.obcPromo")
          : portal === "decc"
            ? t("auth.deccPromo")
            : portal === "agent"
              ? t("auth.agentPromo")
              : t("auth.registerPromo"),
    sub:
      portal === "eleve"
        ? t("auth.studentSub")
        : portal === "obc"
          ? t("auth.obcSub")
          : portal === "decc"
            ? t("auth.deccSub")
            : portal === "agent"
              ? t("auth.agentSub")
              : t("auth.registerSub"),
  };

  return (
    <main className="grid min-h-screen bg-surface-1 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-obc-800 px-10 py-8 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <DocScolLogo variant="full" theme="dark" />
        </Link>

        <div>
          <p className={cn("text-sm font-semibold uppercase tracking-[0.18em]", meta.accent)}>
            {meta.eyebrow}
          </p>
          <div
            className={cn(
              "mb-8 mt-5 inline-flex h-24 w-24 items-center justify-center rounded-md border",
              meta.badge,
            )}
          >
            <Icon className={cn("h-12 w-12", meta.accent)} />
          </div>
          <h1 className="max-w-xl font-display text-4xl leading-tight xl:text-5xl">{meta.promo}</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/75">{meta.sub}</p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/15 pt-5 text-sm text-white/80">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gold-300" aria-hidden="true" />
            {t("common.authorizedAccess")}
          </span>
          <ArrowRight className="h-4 w-4 text-white/50" aria-hidden="true" />
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md border border-[var(--border-token)] bg-surface-0 p-6 shadow-card">
          <Link href="/" className="mb-8 flex items-center gap-3 text-obc-800 lg:hidden">
            <DocScolLogo variant="full" theme="light" />
          </Link>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-500">
              {t("common.securePortal")}
            </p>
            <h1 className="mt-2 font-display text-3xl text-text-1">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-text-3">{description}</p>
          </div>
          {children}

          <div className="mt-6 border-t border-[var(--border-token)] pt-4">
            <p className="text-xs text-text-3">
              {portal === "register" ? t("common.alreadyRegistered") : t("common.notConcerned")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {otherPortals.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="rounded-full border border-[var(--border-token)] px-3 py-1 text-xs font-medium text-text-2 transition-[var(--transition-base)] hover:border-obc-300 hover:bg-obc-50"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
