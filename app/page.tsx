import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LogIn,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DocScolLogo } from "@/components/ui/DocScolLogo";
import { NavBar } from "@/components/ui/nav-bar";
import { Reveal } from "@/components/ui/reveal";

const documentTypes = ["BEPC", "Probatoire", "Baccalauréat", "Relevé", "Original", "Duplicata"];

const portalLinks = [
  {
    title: "Élève",
    text: "Documents, paiements, notifications et rendez-vous.",
    href: "/auth/login",
    icon: GraduationCap,
  },
  {
    title: "Administration OBC",
    text: "Traitement, disponibilité, planning et retraits.",
    href: "/auth/login/obc",
    icon: ShieldCheck,
  },
  {
    title: "Administration DECC",
    text: "Dossiers BEPC, élèves, paiements et audit.",
    href: "/auth/login/decc",
    icon: Building2,
  },
  {
    title: "Agent centre",
    text: "Créneaux du jour et confirmation des retraits.",
    href: "/auth/login/centre-examen",
    icon: ClipboardCheck,
  },
];

const processSteps = [
  "Activation du compte",
  "Suivi du document",
  "Paiement si requis",
  "Retrait sur rendez-vous",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-1 text-text-1">
      <NavBar />

      <main>
        <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-obc-900 text-white">
          <Image
            src="/images/docscol-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.48]"
          />
          <div className="absolute inset-0 bg-obc-900/68" />
          <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col justify-center px-4 py-14 lg:px-8">
            <Reveal>
              <div className="max-w-3xl">
                <DocScolLogo variant="mark" theme="gold" className="mb-6" />
                <h1 className="font-display text-5xl leading-[1.04] sm:text-6xl lg:text-7xl">
                  DR-DOCSCOL
                </h1>
                <p className="mt-5 max-w-2xl text-xl leading-8 text-white/82">
                  Portail OBC/DECC pour les demandes, le suivi, les paiements et les retraits de
                  documents académiques.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/auth/register">
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                      Activer mon compte
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Link href="/auth/login">
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      Se connecter
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-2 border-t border-white/15 pt-5 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 text-sm text-white/75">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-obc-900">
                    {index + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <Reveal>
            <div className="border border-[var(--border-token)] bg-surface-0 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-obc-700" aria-hidden="true" />
                <h2 className="font-display text-2xl text-text-1">Documents gérés</h2>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {documentTypes.map((documentType) => (
                  <div
                    key={documentType}
                    className="border-l-4 border-gold-400 bg-surface-1 px-3 py-2 text-sm font-semibold text-text-2"
                  >
                    {documentType}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-3 sm:grid-cols-2">
              {portalLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group border border-[var(--border-token)] bg-surface-0 p-5 shadow-card transition-[var(--transition-base)] hover:-translate-y-0.5 hover:border-obc-200 hover:shadow-hover"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-obc-50 text-obc-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="mt-5 block font-display text-2xl text-text-1">
                      {item.title}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-text-3">{item.text}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-obc-700">
                      Ouvrir
                      <CalendarCheck className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
