import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Fingerprint, ShieldCheck } from "lucide-react";

import { DocScolLogo } from "@/components/ui/DocScolLogo";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-surface-1 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-obc-800 px-10 py-8 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <DocScolLogo variant="full" theme="dark" />
        </Link>

        <div>
          <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-md border border-white/15 bg-white/10">
            <Fingerprint className="h-12 w-12 text-gold-300" aria-hidden="true" />
          </div>
          <h1 className="max-w-xl font-display text-5xl leading-tight">
            Service numérique de gestion des documents scolaires.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
            Un espace sécurisé pour les élèves, les administrations OBC/DECC et les agents des
            centres d&apos;examen au Cameroun.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/15 pt-5 text-sm text-white/80">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gold-300" aria-hidden="true" />
            Accès réservé aux utilisateurs autorisés.
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
              Portail sécurisé
            </p>
            <h1 className="mt-2 font-display text-3xl text-text-1">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-text-3">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
