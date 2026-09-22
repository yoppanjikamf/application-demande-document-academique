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
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { DocScolLogo } from "@/components/ui/DocScolLogo";
import { MarqueeCarousel } from "@/components/ui/marquee-carousel";
import { Reveal } from "@/components/ui/reveal";
import { useI18n } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

type PortalAccent = "eleve" | "admin" | "agent";

const portalAccentClasses: Record<PortalAccent, { icon: string; ring: string }> = {
  eleve: { icon: "bg-edu-600 text-white", ring: "hover:border-edu-300" },
  admin: { icon: "bg-obc-800 text-white", ring: "hover:border-obc-300" },
  agent: { icon: "bg-gold-500 text-white", ring: "hover:border-gold-300" },
};

const STEP_IMAGES = [
  "/images/landing/step-activation.png",
  "/images/landing/step-demande.png",
  "/images/landing/step-suivi-paiement.png",
  "/images/landing/step-retrait.png",
];

const portalMeta: Array<{
  href: string;
  icon: typeof GraduationCap;
  accent: PortalAccent;
  image: string;
}> = [
  {
    href: "/auth/register",
    icon: GraduationCap,
    accent: "eleve",
    image: "/images/photos/portal-eleve.png",
  },
  {
    href: "/auth/login/obc",
    icon: ShieldCheck,
    accent: "admin",
    image: "/images/photos/portal-obc.png",
  },
  {
    href: "/auth/login/decc",
    icon: Building2,
    accent: "admin",
    image: "/images/photos/portal-decc.png",
  },
  {
    href: "/auth/login/centre-examen",
    icon: MapPin,
    accent: "agent",
    image: "/images/photos/portal-centre.png",
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
  const { t } = useI18n();
  return (
    <div className="relative mx-auto max-w-lg overflow-hidden">
      <div className="from-obc-200/80 via-gold-100/60 to-obc-100/40 absolute inset-0 rounded-[28px] bg-gradient-to-br blur-2xl" />
      <Card className="border-obc-200/80 relative overflow-hidden shadow-hover">
        <div className="border-b border-[var(--border-token)] bg-obc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <DocScolLogo variant="mark" theme="gold" className="scale-90" />
            <span className="rounded-full bg-obc-700 px-3 py-1 text-xs font-medium text-white/90">
              {t("dashboard.areas.student")}
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
                  {t("landing.mockup.welcome")}
                </p>
                <p className="text-sm font-bold leading-tight">Awa Njoya</p>
                <p className="text-[11px] text-white/75">{t("landing.mockup.studentId")}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border-token)] bg-surface-1 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text-1">{t("landing.mockup.transcript")}</p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                {t("documentStatus.DISPONIBLE")}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-3">{t("landing.mockup.pickup")}</p>
            <Button size="sm" className="mt-3 w-full" variant="outline" disabled>
              {t("landing.mockup.bookAppointment")}
            </Button>
          </div>
          <div className="rounded-lg border border-[var(--border-token)] bg-surface-1 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text-1">{t("landing.mockup.duplicate")}</p>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {t("landing.mockup.pending")}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-3">{t("landing.mockup.paymentRequired")}</p>
          </div>
          <div className="bg-gold-100/70 flex items-start gap-2 rounded-lg p-3">
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-obc-800" aria-hidden="true" />
            <p className="text-xs leading-5 text-obc-900">{t("landing.mockup.notification")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LandingPage({ consultationUrl }: { consultationUrl: string }) {
  const { t, dictionary } = useI18n();
  const featureCards = dictionary.landing.featureCards;
  const whyChoose = dictionary.landing.whySection.bullets;
  const faqItems = dictionary.landing.faqItems;
  const steps: ActivationStep[] = dictionary.landing.activationSteps.map((step, index) => ({
    title: step.title,
    text: step.text,
    image: STEP_IMAGES[index] ?? step.image,
  }));
  const portals = portalMeta.map((meta, index) => ({
    ...meta,
    ...dictionary.landing.portals[index],
  }));
  const testimonials = dictionary.landing.testimonials;

  return (
    <>
      <section id="accueil" className="relative overflow-x-clip overflow-hidden bg-obc-900 text-white">
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
          alt={t("landing.heroImageAlt")}
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
                  {t("landing.heroBadge")}
                </p>
                <h1 className="mt-6 font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
                  {t("landing.heroTitlePrefix")}{" "}
                  <span className="text-gold-400">{t("landing.heroTitleHighlight")}</span>
                </h1>
                <p className="text-white/82 mt-6 max-w-xl text-lg leading-8">
                  {t("landing.heroSubtitle")}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/auth/register">
                      {t("landing.heroActivate")}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/5 text-white hover:bg-white/15"
                  >
                    <Link href="/auth/login">{t("common.alreadyHaveAccount")}</Link>
                  </Button>
                </div>
                <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold-400" aria-hidden="true" />
                    {t("landing.heroBulletExams")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold-400" aria-hidden="true" />
                    {t("landing.heroBulletAppointments")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold-400" aria-hidden="true" />
                    {t("landing.heroBulletNotifications")}
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
          <a
            href="#probleme"
            className="mt-14 inline-flex w-fit items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            {t("landing.discoverSolution")}
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
              eyebrow={t("landing.problem.eyebrow")}
              title={t("landing.problem.title")}
              description={t("landing.problem.description")}
            />
          </Reveal>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <Reveal delay={80}>
              <Card className="overflow-hidden border-red-200/60 bg-red-50/40">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src="/images/landing/probleme-file.png"
                    alt={t("landing.problem.problemImageAlt")}
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
                  <CardTitle className="text-red-900">{t("landing.problem.withoutTitle")}</CardTitle>
                  <CardDescription className="text-red-800/80">
                    {t("landing.problem.withoutSubtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-red-900/90">
                  {dictionary.landing.problem.withoutBullets.map((bullet) => (
                    <p key={bullet}>• {bullet}</p>
                  ))}
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={160}>
              <Card className="bg-obc-50/50 overflow-hidden border-obc-200">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src="/images/landing/solution-portail.png"
                    alt={t("landing.problem.solutionImageAlt")}
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
                  <CardTitle className="text-obc-900">{t("landing.problem.withTitle")}</CardTitle>
                  <CardDescription className="text-obc-700">
                    {t("landing.problem.withSubtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-obc-900/90 space-y-3 text-sm leading-6">
                  {dictionary.landing.problem.withBullets.map((bullet) => (
                    <p key={bullet}>• {bullet}</p>
                  ))}
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
              eyebrow={t("landing.featuresSection.eyebrow")}
              title={t("landing.featuresSection.title")}
              description={t("landing.featuresSection.description")}
            />
          </Reveal>
        </div>
        <div className="mt-14 overflow-x-clip">
          <MarqueeCarousel
            ariaLabel={t("landing.featuresSection.ariaLabel")}
            durationSeconds={46}
            itemClassName="w-[300px] sm:w-[340px]"
            items={featureCards.map((feature) => (
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
                eyebrow={t("landing.whySection.eyebrow")}
                title={t("landing.whySection.title")}
                description={t("landing.whySection.description")}
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
                  alt={t("landing.whySection.imageAlt")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="absolute inset-0 h-full w-full object-cover brightness-[0.65] saturate-[0.8]"
                />
                <div
                  className="from-obc-950/98 via-obc-900/90 to-obc-900/75 absolute inset-0 bg-gradient-to-t"
                  aria-hidden="true"
                />
                <div className="relative flex h-full flex-col justify-end p-8 sm:p-10">
                  <p className="font-display text-2xl text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] sm:text-3xl">
                    {t("landing.whySection.overlayTitle")}
                  </p>
                  <p className="mt-4 max-w-md text-sm leading-7 text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] sm:text-base">
                    {t("landing.whySection.overlayText")}
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-white/25 bg-obc-950/50 p-4 backdrop-blur-md">
                      <p className="font-display text-3xl text-white">3</p>
                      <p className="mt-1 text-xs font-medium text-white/90">
                        {t("landing.whySection.statProfiles")}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/25 bg-obc-950/50 p-4 backdrop-blur-md">
                      <p className="font-display text-3xl text-white">24/7</p>
                      <p className="mt-1 text-xs font-medium text-white/90">
                        {t("landing.whySection.statOnline")}
                      </p>
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
              eyebrow={t("landing.previewSection.eyebrow")}
              title={t("landing.previewSection.title")}
              description={t("landing.previewSection.description")}
            />
          </Reveal>
          <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <ProductMockup />
            </Reveal>
            <Reveal delay={100}>
              <ul className="space-y-5">
                {dictionary.landing.previewSection.bullets.map((line) => (
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
                  {t("landing.previewSection.cta")}
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
              eyebrow={t("landing.stepsSection.eyebrow")}
              title={t("landing.stepsSection.title")}
              description={t("landing.stepsSection.description")}
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
              eyebrow={t("landing.accessSection.eyebrow")}
              title={t("landing.accessSection.title")}
              description={t("landing.accessSection.description")}
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
                {t("landing.testimonialsSection.eyebrow")}
              </p>
              <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">
                {t("landing.testimonialsSection.title")}
              </h2>
              <p className="mt-4 text-base leading-7 text-white/80 sm:text-lg">
                {t("landing.testimonialsSection.description")}
              </p>
            </div>
          </Reveal>
        </div>
        <div className="relative mt-14 overflow-x-clip">
          <MarqueeCarousel
            ariaLabel={t("landing.testimonialsSection.ariaLabel")}
            durationSeconds={52}
            itemClassName="w-[300px] sm:w-[360px]"
            items={testimonials.map((item, index) => (
              <Card
                key={`${item.role}-${index}`}
                className="border-obc-200/80 h-full border-dashed bg-surface-0"
              >
                <CardContent className="p-6">
                  <span className="mb-3 inline-block rounded-full bg-gold-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-obc-900">
                    {t("landing.testimonialsSection.placeholder")}
                  </span>
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
              eyebrow={t("landing.faqSection.eyebrow")}
              title={t("landing.faqSection.title")}
              description={t("landing.faqSection.description")}
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-10">
              <FaqAccordion items={faqItems} initialVisibleCount={4} />
            </div>
          </Reveal>
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
            <h2 className="font-display text-3xl sm:text-4xl">{t("landing.ctaTitle")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/80">
              {t("landing.ctaSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/auth/register">{t("common.startNow")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/auth/login">{t("common.signIn")}</Link>
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
                {t("landing.footerTagline")}
              </p>
            </div>
            <nav
              className="grid grid-cols-2 gap-8 sm:grid-cols-3"
              aria-label={t("landing.footer.navLabel")}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {t("landing.footer.journey")}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-text-3">
                  <li>
                    <a href="#fonctionnalites" className="hover:text-obc-700">
                      {t("nav.features")}
                    </a>
                  </li>
                  <li>
                    <a href="#etapes" className="hover:text-obc-700">
                      {t("nav.steps")}
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-obc-700">
                      {t("nav.faq")}
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {t("landing.footer.access")}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-text-3">
                  <li>
                    <Link href="/auth/register" className="hover:text-obc-700">
                      {t("landing.footer.studentActivation")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/login" className="hover:text-obc-700">
                      {t("landing.footer.signIn")}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {t("landing.footer.orgs")}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-text-3">
                  {dictionary.landing.footer.orgLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
          <p className="mt-10 border-t border-[var(--border-token)] pt-6 text-center text-xs text-text-muted">
            © {new Date().getFullYear()} DR-DOCSCOL. {t("landing.footer.copyright")}
          </p>
        </div>
      </footer>
    </>
  );
}
