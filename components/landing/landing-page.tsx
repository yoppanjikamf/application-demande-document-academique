"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DocScolLogo } from "@/components/ui/DocScolLogo";
import { Reveal } from "@/components/ui/reveal";
import { landingTestimonials } from "@/content/landing-testimonials";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: FileCheck2,
    title: "Suivi clair de vos documents",
    description:
      "Consultez l'état de chaque demande — en attente, disponible ou retiré — depuis un seul espace personnel.",
  },
  {
    icon: CalendarCheck,
    title: "Rendez-vous en ligne",
    description:
      "Réservez votre créneau de retrait au centre d'examen ou à l'antenne régionale, selon votre document.",
  },
  {
    icon: Bell,
    title: "Notifications utiles",
    description:
      "Soyez informé dès qu'un document est disponible, qu'un rendez-vous approche ou qu'une action est attendue.",
  },
  {
    icon: ShieldCheck,
    title: "Parcours sécurisé",
    description:
      "Activation du compte par matricule, accès personnalisé et traçabilité des démarches pour chaque élève.",
  },
  {
    icon: Building2,
    title: "OBC & DECC réunis",
    description:
      "Un portail unique pour les organismes officiels : gestion des dossiers, disponibilités et retraits encadrés.",
  },
  {
    icon: ClipboardCheck,
    title: "Retrait confirmé sur place",
    description:
      "Les agents de centre valident le retrait physique ; les administrations gardent la visibilité sur les dossiers.",
  },
];

const whyChoose = [
  "Moins de déplacements inutiles : vous savez quand et où retirer votre document.",
  "Moins d'incertitude : le statut de votre demande est visible à tout moment.",
  "Moins de files d'attente mal organisées : les créneaux structurent l'accueil.",
  "Une expérience adaptée aux règles officielles BEPC, Probatoire et Baccalauréat.",
];

const steps = [
  {
    title: "Activez votre compte",
    text: "Avec votre matricule et votre adresse e-mail déjà enregistrés par l'administration.",
  },
  {
    title: "Soumettez votre demande",
    text: "Relevé, diplôme original ou duplicata selon votre situation et les règles de votre organisme.",
  },
  {
    title: "Suivez et payez si besoin",
    text: "Notifications à chaque étape ; paiement en ligne pour les duplicatas concernés.",
  },
  {
    title: "Retirez sur rendez-vous",
    text: "Choisissez un créneau au centre d'examen ou à l'antenne régionale compétente.",
  },
];

const portals = [
  {
    title: "Espace élève",
    text: "Documents, rendez-vous, notifications et reçus de paiement.",
    href: "/auth/register",
    cta: "Activer mon compte",
    icon: GraduationCap,
  },
  {
    title: "Administration OBC",
    text: "Baccalauréat, Probatoire et relevés selon votre antenne régionale.",
    href: "/auth/login/obc",
    cta: "Connexion OBC",
    icon: ShieldCheck,
  },
  {
    title: "Administration DECC",
    text: "BEPC et dossiers DECC selon votre antenne régionale.",
    href: "/auth/login/decc",
    cta: "Connexion DECC",
    icon: Building2,
  },
  {
    title: "Centre d'examen",
    text: "Confirmation des retraits effectués sur place.",
    href: "/auth/login/centre-examen",
    cta: "Accès agent",
    icon: MapPin,
  },
];

const faqItems = [
  {
    q: "Qui peut utiliser DR-DOCSCOL ?",
    a: "Les élèves dont le profil est déjà enregistré, les administrateurs OBC/DECC et les agents des centres d'examen habilités.",
  },
  {
    q: "Comment activer mon compte élève ?",
    a: "Rendez-vous sur « Activer mon compte », saisissez votre matricule, votre e-mail et choisissez un mot de passe. Vos informations doivent correspondre aux données déjà connues de l'organisme.",
  },
  {
    q: "Je suis administrateur : quelle page de connexion utiliser ?",
    a: "Utilisez « Connexion OBC » pour l'Office du Baccalauréat et « Connexion DECC » pour les diplômes d'État (BEPC). La page de connexion élève ne donne pas accès à l'espace administrateur.",
  },
  {
    q: "Quels documents puis-je demander ?",
    a: "Selon votre parcours : relevés de notes, diplômes originaux ou duplicatas (BEPC, Probatoire, Baccalauréat), dans le respect des règles de chaque organisme.",
  },
  {
    q: "Où se passe le retrait ?",
    a: "Au centre d'examen pour la plupart des relevés et du BEPC, ou à l'antenne régionale OBC/DECC lorsque la règle métier l'exige (par exemple certains originaux ou duplicatas).",
  },
  {
    q: "Dois-je payer en ligne ?",
    a: "Le paiement concerne principalement les demandes de duplicata. Les montants et modalités vous sont indiqués dans votre espace au moment de la démarche.",
  },
  {
    q: "Comment suis-je informé de l'avancement ?",
    a: "Par les notifications dans votre espace et, le cas échéant, par e-mail lors des changements importants (document disponible, rendez-vous, etc.).",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-obc-600">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl text-text-1 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-text-3 sm:text-lg">{description}</p>
    </div>
  );
}

function ProductMockup() {
  return (
    <div className="relative mx-auto max-w-lg">
      <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-obc-200/80 via-gold-100/60 to-obc-100/40 blur-2xl" />
      <Card className="relative overflow-hidden border-obc-200/80 shadow-hover">
        <div className="border-b border-[var(--border-token)] bg-obc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <DocScolLogo variant="mark" theme="gold" className="scale-90" />
            <span className="rounded-full bg-obc-700 px-3 py-1 text-xs font-medium text-white/90">
              Espace élève
            </span>
          </div>
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="rounded-lg border border-[var(--border-token)] bg-surface-1 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text-1">Relevé — Baccalauréat</p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                Disponible
              </span>
            </div>
            <p className="mt-1 text-xs text-text-3">Retrait au centre d&apos;examen</p>
            <Button size="sm" className="mt-3 w-full" variant="outline" disabled>
              Prendre rendez-vous
            </Button>
          </div>
          <div className="rounded-lg border border-[var(--border-token)] bg-surface-1 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text-1">Duplicata — BEPC</p>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                En attente
              </span>
            </div>
            <p className="mt-1 text-xs text-text-3">Paiement requis avant traitement</p>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-gold-100/70 p-3">
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-obc-800" aria-hidden="true" />
            <p className="text-xs leading-5 text-obc-900">
              Votre document est disponible. Réservez un créneau pour le retirer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LandingPage() {
  return (
    <>
      <section
        id="accueil"
        className="relative overflow-hidden bg-obc-900 text-white"
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(240,192,64,0.18),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(82,183,136,0.2),_transparent_55%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <Reveal>
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
                  <Sparkles className="h-4 w-4 text-gold-400" aria-hidden="true" />
                  Portail officiel documents scolaires
                </p>
                <h1 className="mt-6 font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
                  Vos documents scolaires,{" "}
                  <span className="text-gold-400">simples à obtenir</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-white/82">
                  DR-DOCSCOL accompagne les élèves, les équipes OBC/DECC et les centres
                  d&apos;examen : demandes en ligne, suivi en temps réel, rendez-vous de retrait
                  et notifications — sans paperasse inutile.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/auth/register">
                      Activer mon compte élève
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/5 text-white hover:bg-white/15"
                  >
                    <Link href="/auth/login">J&apos;ai déjà un compte</Link>
                  </Button>
                </div>
                <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold-400" aria-hidden="true" />
                    BEPC, Probatoire, Baccalauréat
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold-400" aria-hidden="true" />
                    Rendez-vous en ligne
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold-400" aria-hidden="true" />
                    Notifications à chaque étape
                  </li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <ProductMockup />
            </Reveal>
          </div>
          <a
            href="#probleme"
            className="mt-14 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            Découvrir la solution
            <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="probleme" className="border-b border-[var(--border-token)] bg-surface-0 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Problème & solution"
              title="Fini les démarches floues et les allers-retours"
              description="Avant, difficile de savoir si un document était prêt, où le retirer ou quand se présenter. DR-DOCSCOL centralise l'information pour tout le monde."
            />
          </Reveal>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <Reveal delay={80}>
              <Card className="border-red-200/60 bg-red-50/40">
                <CardHeader>
                  <CardTitle className="text-red-900">Sans portail structuré</CardTitle>
                  <CardDescription className="text-red-800/80">
                    Ce que vivent encore trop d&apos;élèves et d&apos;équipes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-red-900/90">
                  <p>• Statut du dossier inconnu ou dispersé</p>
                  <p>• Rendez-vous non coordonnés aux centres</p>
                  <p>• Duplicatas sans suivi de paiement clair</p>
                  <p>• Administrations submergées de questions répétitives</p>
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={160}>
              <Card className="border-obc-200 bg-obc-50/50">
                <CardHeader>
                  <CardTitle className="text-obc-900">Avec DR-DOCSCOL</CardTitle>
                  <CardDescription className="text-obc-700">
                    Une trajectoire lisible, de la demande au retrait
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-obc-900/90">
                  <p>• Chaque demande a un statut visible par l&apos;élève</p>
                  <p>• Créneaux de retrait au bon lieu (centre ou antenne)</p>
                  <p>• Paiement et reçu pour les duplicatas concernés</p>
                  <p>• Agents et admins alignés sur les mêmes informations</p>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="bg-surface-1 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Fonctionnalités"
              title="Tout ce dont vous avez besoin, en langage clair"
              description="Chaque fonctionnalité répond à un besoin réel du terrain — pas à une contrainte technique."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.title} delay={index * 60}>
                  <Card className="h-full transition-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-hover">
                    <CardHeader>
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-obc-100 text-obc-700">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
                      <CardDescription className="leading-6">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pourquoi" className="bg-surface-0 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="Pourquoi DR-DOCSCOL ?"
                title="Une expérience pensée pour le terrain camerounais"
                description="Le portail respecte les règles OBC et DECC tout en offrant une interface moderne aux élèves et aux équipes."
              />
              <ul className="mt-8 space-y-4">
                {whyChoose.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-7 text-text-2">
                    <CheckCircle2
                      className="mt-1 h-5 w-5 shrink-0 text-obc-600"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border-token)] bg-gradient-to-br from-obc-100 via-surface-0 to-gold-100 shadow-card">
                <Image
                  src="/images/logo/logo.svg"
                  alt=""
                  width={120}
                  height={120}
                  className="absolute right-8 top-8 opacity-20"
                  aria-hidden="true"
                />
                <div className="flex h-full flex-col justify-center p-8 sm:p-10">
                  <p className="font-display text-2xl text-obc-900 sm:text-3xl">
                    Clarté, confiance et gain de temps
                  </p>
                  <p className="mt-4 max-w-md text-sm leading-7 text-text-3 sm:text-base">
                    Que vous soyez élève, administrateur ou agent de centre, vous travaillez
                    sur les mêmes données à jour — sans double saisie ni confusion.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-white/80 p-4 shadow-card">
                      <p className="font-display text-3xl text-obc-800">3</p>
                      <p className="mt-1 text-xs font-medium text-text-3">profils utilisateurs</p>
                    </div>
                    <div className="rounded-lg bg-white/80 p-4 shadow-card">
                      <p className="font-display text-3xl text-obc-800">24/7</p>
                      <p className="mt-1 text-xs font-medium text-text-3">suivi en ligne</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="apercu" className="bg-surface-1 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Aperçu"
              title="Votre tableau de bord, en un coup d'œil"
              description="L'espace élève regroupe documents, rendez-vous, paiements et notifications — le tout dans une interface sobre et lisible."
            />
          </Reveal>
          <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <ProductMockup />
            </Reveal>
            <Reveal delay={100}>
              <ul className="space-y-5">
                {[
                  "Liste de vos documents avec statut et lieu de retrait indiqué",
                  "Prise de rendez-vous sur les créneaux encore disponibles",
                  "Historique des notifications et des reçus de paiement",
                  "Accès sécurisé depuis n'importe quel navigateur récent",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex gap-3 rounded-lg border border-[var(--border-token)] bg-surface-0 p-4 text-sm leading-6 text-text-2 shadow-card"
                  >
                    <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="mt-8">
                <Link href="/auth/register">
                  Créer mon accès élève
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="etapes" className="bg-surface-0 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Comment ça marche"
              title="Quatre étapes, de l'activation au retrait"
              description="Un parcours guidé pour les élèves — les équipes admin et centre interviennent aux bonnes moments."
            />
          </Reveal>
          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 70}>
                <li className="relative rounded-xl border border-[var(--border-token)] bg-surface-1 p-6 shadow-card">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-obc-800 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-display text-xl text-text-1">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-3">{step.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="acces" className="border-y border-[var(--border-token)] bg-obc-50/60 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Accès par profil"
              title="Chacun son espace, selon son rôle"
              description="Choisissez l'entrée qui correspond à votre situation."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {portals.map((portal, index) => {
              const Icon = portal.icon;
              return (
                <Reveal key={portal.title} delay={index * 80}>
                  <Card className="flex h-full flex-col transition-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-hover">
                    <CardHeader>
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-obc-800 text-white">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <CardTitle className="mt-4">{portal.title}</CardTitle>
                      <CardDescription className="leading-6">{portal.text}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={portal.href}>{portal.cta}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="temoignages" className="bg-surface-1 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Retours utilisateurs"
              title="Ce que les équipes apprécient"
              description="Modifiez les citations dans content/landing-testimonials.ts dès que vous disposez de retours authentifiés."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {landingTestimonials.map((item, index) => (
              <Reveal key={`${item.role}-${index}`} delay={index * 80}>
                <Card
                  className={cn(
                    "h-full bg-surface-0",
                    item.isPlaceholder
                      ? "border-dashed border-obc-200/80"
                      : "border-obc-200 shadow-card",
                  )}
                >
                  <CardContent className="p-6">
                    {item.isPlaceholder ? (
                      <span className="mb-3 inline-block rounded-full bg-gold-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-obc-900">
                        Exemple indicatif
                      </span>
                    ) : null}
                    <p className="text-sm leading-7 text-text-2">&ldquo;{item.quote}&rdquo;</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      {item.role}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-surface-0 py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="FAQ"
              title="Questions fréquentes"
              description="Les réponses essentielles avant de démarrer votre démarche."
            />
          </Reveal>
          <div className="mt-12 space-y-3">
            {faqItems.map((item, index) => (
              <Reveal key={item.q} delay={index * 40}>
                <details className="group rounded-xl border border-[var(--border-token)] bg-surface-1 shadow-card">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-text-1 marker:content-none">
                    {item.q}
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-text-3 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="border-t border-[var(--border-token)] px-5 pb-4 pt-3 text-sm leading-7 text-text-3">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-obc-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl">
              Prêt à simplifier vos démarches documentaires ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/80">
              Activez votre compte élève ou connectez-vous à votre espace professionnel en
              quelques clics.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/auth/register">Commencer maintenant</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/auth/login">Se connecter</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-[var(--border-token)] bg-surface-0 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <DocScolLogo variant="full" theme="light" />
              <p className="mt-4 max-w-sm text-sm leading-6 text-text-3">
                DR-DOCSCOL — gestion des demandes et retraits de documents scolaires pour
                l&apos;OBC et la DECC.
              </p>
            </div>
            <nav
              className="grid grid-cols-2 gap-8 sm:grid-cols-3"
              aria-label="Liens du pied de page"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Parcours
                </p>
                <ul className="mt-3 space-y-2 text-sm text-text-3">
                  <li>
                    <a href="#fonctionnalites" className="hover:text-obc-700">
                      Fonctionnalités
                    </a>
                  </li>
                  <li>
                    <a href="#etapes" className="hover:text-obc-700">
                      Étapes
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-obc-700">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Accès
                </p>
                <ul className="mt-3 space-y-2 text-sm text-text-3">
                  <li>
                    <Link href="/auth/register" className="hover:text-obc-700">
                      Activation élève
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/login" className="hover:text-obc-700">
                      Connexion
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Organismes
                </p>
                <ul className="mt-3 space-y-2 text-sm text-text-3">
                  <li>OBC — Office du Baccalauréat</li>
                  <li>DECC — Diplômes d&apos;État</li>
                </ul>
              </div>
            </nav>
          </div>
          <p className="mt-10 border-t border-[var(--border-token)] pt-6 text-center text-xs text-text-muted">
            © {new Date().getFullYear()} DR-DOCSCOL. Tous droits réservés.
          </p>
        </div>
      </footer>
    </>
  );
}
