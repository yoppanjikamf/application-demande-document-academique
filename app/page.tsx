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
import { NavBar } from "@/components/ui/nav-bar";
import { Reveal } from "@/components/ui/reveal";

const documentTypes = [
  "BEPC",
  "Probatoire",
  "Baccalauréat",
  "Relevé de notes",
  "Diplôme original",
  "Duplicata",
];

const portalLinks = [
  {
    title: "Élève",
    text: "Consulter ses documents scolaires, suivre les disponibilités et planifier un retrait.",
    href: "/auth/login",
    icon: GraduationCap,
  },
  {
    title: "Administration OBC",
    text: "Traiter les documents, rechercher un élève et suivre les rendez-vous rattachés à l'OBC.",
    href: "/auth/login/obc",
    icon: ShieldCheck,
  },
  {
    title: "Administration DECC",
    text: "Gérer les dossiers relevant de la DECC et consulter les demandes des élèves.",
    href: "/auth/login/decc",
    icon: Building2,
  },
  {
    title: "Agent centre d'examen",
    text: "Consulter les rendez-vous du centre et confirmer les retraits physiques des documents.",
    href: "/auth/login/centre-examen",
    icon: ClipboardCheck,
  },
];

const processSteps = [
  {
    title: "Activation du compte",
    text: "L'élève accède au portail avec son matricule et les informations prévues par le système.",
  },
  {
    title: "Suivi du document",
    text: "Le statut du diplôme, du relevé ou du duplicata est consultable depuis l'espace élève.",
  },
  {
    title: "Retrait sur rendez-vous",
    text: "Quand le document est disponible, le retrait est planifié selon les créneaux autorisés.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#172033]">
      <NavBar />

      <main>
        <section className="border-b border-[#E5E7EB] bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-14">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-[#B7E4C7] bg-[#D8F3DC] px-3 py-2 text-xs font-semibold uppercase text-[#1B4332]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#52B788]" />
                  Portail institutionnel OBC / DECC
                </div>

                <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-[#111827] sm:text-5xl">
                  OBC/DECC
                </h1>
                <p className="mt-4 max-w-3xl text-xl font-medium text-[#111827]">
                  Gestion des demandes, du suivi et du retrait des documents académiques.
                </p>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#6B7280]">
                  Le portail centralise les espaces élèves, administrations OBC/DECC et centres
                  d&apos;examen autour des fonctionnalités déjà prévues par l&apos;application.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/auth/register">
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                      Activer mon compte
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/auth/login">
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      Se connecter
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] shadow-sm">
                <div className="border-b border-[#E5E7EB] bg-[#1B4332] px-5 py-4 text-white">
                  <p className="text-sm font-semibold">Accès au portail</p>
                  <p className="mt-1 text-xs text-white/70">
                    Sélectionnez votre espace de travail.
                  </p>
                </div>
                <div className="divide-y divide-[#E5E7EB]">
                  {portalLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group grid gap-4 bg-white px-5 py-5 transition-colors hover:bg-[#F8F9FA] sm:grid-cols-[auto_1fr_auto] sm:items-center"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#B7E4C7] bg-[#D8F3DC] text-[#1B4332]">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block font-semibold text-[#111827]">{item.title}</span>
                          <span className="mt-1 block text-sm leading-6 text-[#6B7280]">
                            {item.text}
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-[#1B4332] group-hover:text-[#111827]">
                          Ouvrir
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <Reveal>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#1B4332]" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-[#111827]">Documents gérés</h2>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {documentTypes.map((documentType) => (
                  <div
                    key={documentType}
                    className="border border-[#E5E7EB] bg-[#F8F9FA] px-3 py-2 text-sm font-medium text-[#111827]"
                  >
                    {documentType}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <CalendarCheck className="h-5 w-5 text-[#1B4332]" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-[#111827]">Parcours utilisateur</h2>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {processSteps.map((step, index) => (
                  <div key={step.title} className="border-l-2 border-[#1B4332] pl-4">
                    <p className="text-xs font-semibold uppercase text-[#9CA3AF]">
                      Étape {index + 1}
                    </p>
                    <h3 className="mt-2 font-semibold text-[#111827]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-[#6B7280] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="font-semibold text-[#111827]">OBC/DECC</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth/login" className="hover:text-[#1B4332]">
              Connexion élève
            </Link>
            <Link href="/auth/login/obc" className="hover:text-[#1B4332]">
              Connexion OBC
            </Link>
            <Link href="/auth/login/decc" className="hover:text-[#1B4332]">
              Connexion DECC
            </Link>
            <Link href="/auth/login/centre-examen" className="hover:text-[#1B4332]">
              Connexion centre d&apos;examen
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
