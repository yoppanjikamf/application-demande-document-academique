"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivationSteps, type ActivationStep } from "@/components/landing/activation-steps";
import { ConsultationAccessSection } from "@/components/landing/consultation-access";
import { DocScolLogo } from "@/components/ui/DocScolLogo";
import { MarqueeCarousel } from "@/components/ui/marquee-carousel";
import { Reveal } from "@/components/ui/reveal";
import { landingTestimonials } from "@/content/landing-testimonials";
import { cn } from "@/lib/utils";

type PortalAccent = "eleve" | "admin" | "agent";

const portalAccentClasses: Record<PortalAccent, { icon: string; ring: string }> = {
  eleve: { icon: "bg-edu-600 text-white", ring: "hover:border-edu-300" },
  admin: { icon: "bg-obc-800 text-white", ring: "hover:border-obc-300" },
  agent: { icon: "bg-gold-500 text-white", ring: "hover:border-gold-300" },
};

const features: Array<{ image: string; title: string; description: string }> = [
  {
    image: "/images/photos/documents.jpg",
    title: "Le statut de vos documents en temps réel",
    description:
      "Suivez chaque demande — en attente, disponible ou retirée — sans relancer personne, depuis votre espace personnel.",
  },
  {
    image: "/images/photos/rendez-vous.jpg",
    title: "Le retrait sur rendez-vous",
    description:
      "Réservez votre créneau au centre d'examen ou à l'antenne régionale compétente, et présentez-vous sans faire la queue.",
  },
  {
    image: "/images/photos/notifications.png",
    title: "Des notifications au bon moment",
    description:
      "Soyez prévenu dès qu'un document est prêt, qu'un rendez-vous approche ou qu'une action vous attend.",
  },
  {
    image: "/images/photos/securite.png",
    title: "Un accès strictement sécurisé",
    description:
      "Activation par matricule, accès personnel et traçabilité complète : chaque démarche reste protégée et vérifiable.",
  },
  {
    image: "/images/photos/graduation.jpg",
    title: "L'OBC et la DECC réunis",
    description:
      "Un seul portail pour l'Office du Baccalauréat du Cameroun et la Direction des Examens, des Concours et de la Certification : dossiers, disponibilités et retraits gérés dans les règles.",
  },
  {
    image: "/images/photos/retrait.png",
    title: "Un retrait confirmé sur place",
    description:
      "L'agent du centre valide chaque retrait physique ; l'administration garde la visibilité sur tous les dossiers.",
  },
];

const whyChoose = [
  "Plus aucune incertitude : le statut de votre demande reste visible à tout moment.",
  "Moins d'attente au guichet et moins de longues files d'attente : des créneaux de retrait organisés au bon lieu.",
  "Un parcours conforme aux règles officielles du BEPC, du Probatoire, du Baccalauréat et de l'ESG.",
];

const steps: ActivationStep[] = [
  {
    title: "Activez votre compte",
    text: "Avec votre matricule et l'adresse e-mail déjà connus de l'administration — en quelques minutes.",
    image: "/images/landing/step-activation.png",
  },
  {
    title: "Soumettez votre demande",
    text: "Relevé, diplôme original ou duplicata : choisissez le document adapté à votre situation, selon les règles de votre organisme.",
    image: "/images/landing/step-demande.png",
  },
  {
    title: "Suivez et payez si besoin",
    text: "Suivez l'avancement à chaque étape et réglez en ligne, en toute sécurité, les duplicatas concernés.",
    image: "/images/landing/step-suivi-paiement.png",
  },
  {
    title: "Retirez sur rendez-vous",
    text: "Réservez un créneau au centre d'examen ou à l'antenne régionale, et repartez avec votre document.",
    image: "/images/landing/step-retrait.png",
  },
];

const portals: Array<{
  title: string;
  text: string;
  href: string;
  cta: string;
  icon: typeof GraduationCap;
  accent: PortalAccent;
  image: string;
}> = [
  {
    title: "Espace élève",
    text: "Vos documents, rendez-vous, notifications et reçus, réunis en un seul espace.",
    href: "/auth/register",
    cta: "Activer mon compte",
    icon: GraduationCap,
    accent: "eleve",
    image: "/images/photos/portal-eleve.png",
  },
  {
    title: "Administration OBC",
    text: "Office du Baccalauréat du Cameroun — Baccalauréat, Probatoire et relevés, gérés selon votre antenne régionale.",
    href: "/auth/login/obc",
    cta: "Connexion OBC",
    icon: ShieldCheck,
    accent: "admin",
    image: "/images/photos/portal-obc.png",
  },
  {
    title: "Administration DECC",
    text: "Direction des Examens, des Concours et de la Certification — BEPC et dossiers d'État, gérés selon votre antenne régionale.",
    href: "/auth/login/decc",
    cta: "Connexion DECC",
    icon: Building2,
    accent: "admin",
    image: "/images/photos/portal-decc.png",
  },
  {
    title: "Centre d'examen",
    text: "Confirmez en un geste les retraits effectués sur place.",
    href: "/auth/login/centre-examen",
    cta: "Accès agent",
    icon: MapPin,
    accent: "agent",
    image: "/images/photos/portal-centre.png",
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
    a: "Utilisez « Connexion OBC » pour l'Office du Baccalauréat du Cameroun et « Connexion DECC » pour la Direction des Examens, des Concours et de la Certification (BEPC). La page de connexion élève ne donne pas accès à l'espace administrateur.",
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
      <div className="from-obc-200/80 via-gold-100/60 to-obc-100/40 absolute -inset-4 rounded-[28px] bg-gradient-to-br blur-2xl" />
      <Card className="border-obc-200/80 relative overflow-hidden shadow-hover">
        <div className="border-b border-[var(--border-token)] bg-obc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <DocScolLogo variant="mark" theme="gold" className="scale-90" />
            <span className="rounded-full bg-obc-700 px-3 py-1 text-xs font-medium text-white/90">
              Espace élève
            </span>
          </div>
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-edu-800 via-edu-700 to-edu-600 p-3 text-white">
            <div className="bg-edu-400/25 pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                  Bienvenue
                </p>
                <p className="text-sm font-bold leading-tight">Awa Njoya</p>
                <p className="text-[11px] text-white/75">Matricule : OBC-2024-0157</p>
              </div>
            </div>
          </div>
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
          <div className="bg-gold-100/70 flex items-start gap-2 rounded-lg p-3">
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

export function LandingPage({ consultationUrl }: { consultationUrl: string }) {
  return (
    <>
      <section id="accueil" className="relative overflow-hidden bg-obc-900 text-white">
        {/* Couche 1 — élèves en tenue, le parcours au quotidien */}
        <Image
          src="/images/photos/eleves.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
          aria-hidden="true"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, black 0%, black 42%, rgba(0,0,0,0.55) 58%, transparent 72%)",
            maskImage:
              "linear-gradient(to right, black 0%, black 42%, rgba(0,0,0,0.55) 58%, transparent 72%)",
          }}
        />
        {/* Couche 2 — diplômés, l'aboutissement */}
        <Image
          src="/images/landing/hero-graduation.png"
          alt="Élèves camerounais en classe consultant le portail et diplômés célébrant l'obtention de leurs documents scolaires"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-right"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, transparent 34%, rgba(0,0,0,0.45) 52%, black 68%, black 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, transparent 34%, rgba(0,0,0,0.45) 52%, black 68%, black 100%)",
          }}
        />
        {/* Zone de fusion entre les deux scènes */}
        <div
          className="pointer-events-none absolute inset-y-0 left-[38%] w-[28%] bg-gradient-to-r from-transparent via-gold-400/10 to-transparent"
          aria-hidden="true"
        />
        <div
          className="via-obc-900/88 to-obc-900/25 absolute inset-0 bg-gradient-to-r from-obc-900"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.16),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.18),_transparent_55%)]"
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
        <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-4 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="max-w-2xl">
            <Reveal>
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
                  <Sparkles className="h-4 w-4 text-gold-400" aria-hidden="true" />
                  Portail officiel des documents scolaires
                </p>
                <h1 className="mt-6 font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
                  Vos documents scolaires,{" "}
                  <span className="text-gold-400">enfin simples à retirer</span>
                </h1>
                <p className="text-white/82 mt-6 max-w-xl text-lg leading-8">
                  DR-DOCSCOL réunit les élèves, les équipes OBC/DECC et les centres d&apos;examen
                  sur un même portail : demande en ligne, suivi en temps réel, rendez-vous de
                  retrait et notifications — sans paperasse ni allers-retours inutiles.
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
                    BEPC, Probatoire, Baccalauréat, ESG
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
          </div>
          <a
            href="#probleme"
            className="mt-14 inline-flex w-fit items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            Découvrir la solution
            <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section
        id="probleme"
        className="border-b border-[var(--border-token)] bg-surface-0 py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Problème & solution"
              title="Fini les longues files d'attente et les aller-retours inutiles"
              description="Hier, impossible d'obtenir des informations claires sur la disponibilité de son diplôme. DR-DOCSCOL réunit toutes les informations nécessaires sur la disponibilité, la prise de rendez-vous et le retrait de vos documents scolaires."
            />
          </Reveal>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <Reveal delay={80}>
              <Card className="overflow-hidden border-red-200/60 bg-red-50/40">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src="/images/landing/probleme-file.png"
                    alt="Longue file d'attente d'usagers patientant sous le soleil devant une administration"
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-red-950/40 to-transparent"
                    aria-hidden="true"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-red-900">Sans portail structuré</CardTitle>
                  <CardDescription className="text-red-800/80">
                    Ce que vivent encore trop d&apos;élèves et d&apos;équipes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-red-900/90">
                  <p>• Longues files d&apos;attente et nombreux aller-retours pour les élèves et les équipes administratives</p>
                  <p>• Absence de visibilité sur l&apos;état d&apos;avancement et la disponibilité réelle des documents</p>
                  <p>• Charge de travail accrue côté administration : gestion manuelle, erreurs de saisie, traçabilité difficile</p>
                  <p>• Frais de transport, délais de traitement et difficulté à obtenir les instructions exactes de retrait</p>
                  <p>• Duplicatas et paiements sans suivi clair pour l&apos;usager</p>
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={160}>
              <Card className="bg-obc-50/50 overflow-hidden border-obc-200">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src="/images/landing/solution-portail.png"
                    alt="Élève consultant sereinement le statut de ses documents en ligne depuis chez lui"
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                  />
                  <div
                    className="from-obc-900/40 absolute inset-0 bg-gradient-to-t to-transparent"
                    aria-hidden="true"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-obc-900">Avec DR-DOCSCOL</CardTitle>
                  <CardDescription className="text-obc-700">
                    Une trajectoire lisible, de la demande au retrait
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-obc-900/90 space-y-3 text-sm leading-6">
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
        </div>
        <div className="mt-14">
          <MarqueeCarousel
            ariaLabel="Fonctionnalités principales"
            durationSeconds={46}
            itemClassName="w-[300px] sm:w-[340px]"
            items={features.map((feature) => (
              <Card
                key={feature.title}
                className="group h-full overflow-hidden transition-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-hover"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-edu-50">
                  <Image
                    src={feature.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 300px, 340px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="leading-6">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          />
        </div>
      </section>

      <section id="pourquoi" className="bg-surface-0 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="Pourquoi DR-DOCSCOL ?"
                title="Solution pensée pour résoudre le problème du retrait des documents scolaires (BEPC, Probatoire, Baccalauréat, ESG) au Cameroun"
                description="Moins de déplacements inutiles, moins d'attente au guichet et moins de longues files d'attente : disponibilité en ligne, rendez-vous au bon lieu et retrait encadré selon les règles de l'OBC et de la DECC."
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
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border-token)] shadow-card">
                <Image
                  src="/images/photos/eleves.jpg"
                  alt="Élèves camerounais en uniforme scolaire consultant le portail sur leur téléphone en salle de classe"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="from-obc-900/92 via-obc-900/55 to-obc-900/20 absolute inset-0 bg-gradient-to-t"
                  aria-hidden="true"
                />
                <div className="relative flex h-full flex-col justify-end p-8 sm:p-10">
                  <p className="font-display text-2xl text-white sm:text-3xl">
                    Clarté, confiance et gain de temps
                  </p>
                  <p className="mt-4 max-w-md text-sm leading-7 text-white/85 sm:text-base">
                    Que vous soyez élève, administrateur ou agent de centre, vous travaillez sur les
                    mêmes données à jour — sans double saisie ni confusion.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-white/20 bg-white/15 p-4 backdrop-blur-sm">
                      <p className="font-display text-3xl text-white">3</p>
                      <p className="mt-1 text-xs font-medium text-white/80">profils utilisateurs</p>
                    </div>
                    <div className="rounded-lg border border-white/20 bg-white/15 p-4 backdrop-blur-sm">
                      <p className="font-display text-3xl text-white">24/7</p>
                      <p className="mt-1 text-xs font-medium text-white/80">suivi en ligne</p>
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

      <ConsultationAccessSection consultationUrl={consultationUrl} />

      <section id="etapes" className="bg-surface-0 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Comment ça marche"
              title="Quatre étapes, de l'activation au retrait"
              description="Un parcours guidé pour les élèves — les équipes admin et centre interviennent aux bons moments."
            />
          </Reveal>
          <div className="mt-14">
            <Reveal>
              <ActivationSteps steps={steps} />
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="acces"
        className="bg-obc-50/60 border-y border-[var(--border-token)] py-20 lg:py-24"
      >
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
              const accent = portalAccentClasses[portal.accent];
              return (
                <Reveal key={portal.title} delay={index * 80}>
                  <Card
                    className={cn(
                      "group flex h-full flex-col overflow-hidden border-2 border-transparent transition-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-hover",
                      accent.ring,
                    )}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-edu-50">
                      <Image
                        src={portal.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 320px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span
                        className={cn(
                          "absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg shadow-card",
                          accent.icon,
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <CardHeader>
                      <CardTitle>{portal.title}</CardTitle>
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

      <section id="temoignages" className="relative overflow-hidden py-20 lg:py-24">
        <Image
          src="/images/landing/testimonials-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="bg-obc-900/90 absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.16),_transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-400">
                Retours utilisateurs
              </p>
              <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">
                Ce que les équipes apprécient
              </h2>
              <p className="mt-4 text-base leading-7 text-white/80 sm:text-lg">
                Élèves, administrations et centres d&apos;examen partagent les bénéfices d&apos;un
                parcours plus simple, plus rapide et plus transparent.
              </p>
            </div>
          </Reveal>
        </div>
        <div className="relative mt-14">
          <MarqueeCarousel
            ariaLabel="Retours utilisateurs"
            durationSeconds={52}
            itemClassName="w-[300px] sm:w-[360px]"
            items={landingTestimonials.map((item, index) => (
              <Card
                key={`${item.role}-${index}`}
                className={cn(
                  "h-full bg-surface-0",
                  item.isPlaceholder
                    ? "border-obc-200/80 border-dashed"
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
            ))}
          />
        </div>
      </section>

      <section id="faq" className="bg-surface-0 py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="FAQ"
              title="Questions fréquentes"
              description="Les réponses essentielles pour démarrer votre démarche en toute confiance."
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

      <section className="relative overflow-hidden bg-obc-900 py-16 text-white lg:py-20">
        <Image
          src="/images/landing/cta-documents.png"
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="bg-obc-900/88 absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl">
              Prêt à obtenir vos documents sans détour ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/80">
              Activez votre compte élève ou connectez-vous à votre espace professionnel en quelques
              clics — et suivez chaque démarche jusqu&apos;au retrait.
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
                DR-DOCSCOL — gestion des demandes et retraits de documents scolaires pour l&apos;OBC
                et la DECC.
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
                  <li>OBC — Office du Baccalauréat du Cameroun</li>
                  <li>DECC — Direction des Examens, des Concours et de la Certification</li>
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
