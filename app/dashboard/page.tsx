import Image from "next/image";
import Link from "next/link";
import { Bell, CalendarDays, FileText, GraduationCap, RotateCcw } from "lucide-react";

import { getDocumentTitle, getStudentDocumentStatusLabel } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TypeDocument } from "@/lib/generated/prisma/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { StatusBadge, appointmentTone, documentTone } from "@/components/dashboard/status-badge";

const documentCards: Array<{
  type: TypeDocument;
  title: string;
  icon: typeof GraduationCap;
}> = [
  { type: "ORIGINAL", title: "Diplôme", icon: GraduationCap },
  { type: "RELEVE_NOTES", title: "Relevé", icon: FileText },
  { type: "DUPLICATA", title: "Duplicata", icon: RotateCcw },
];

const quickActions: Array<{
  title: string;
  text: string;
  href: string;
  image: string;
}> = [
  {
    title: "Demander un relevé",
    text: "Relevé de notes officiel",
    href: "/dashboard/documents",
    image: "/images/photos/documents.jpg",
  },
  {
    title: "Demander un diplôme",
    text: "Diplôme original",
    href: "/dashboard/documents",
    image: "/images/photos/diplome.jpg",
  },
  {
    title: "Demander un duplicata",
    text: "En cas de perte ou de réédition",
    href: "/dashboard/documents",
    image: "/images/photos/duplicata.png",
  },
  {
    title: "Prendre un rendez-vous",
    text: "Choisir un créneau de retrait",
    href: "/dashboard/rendez-vous",
    image: "/images/photos/rendez-vous.jpg",
  },
  {
    title: "Mes paiements",
    text: "Reçus et duplicatas",
    href: "/dashboard/payments",
    image: "/images/photos/paiement.png",
  },
  {
    title: "Suivre mes documents",
    text: "État de chaque demande",
    href: "/dashboard/documents",
    image: "/images/photos/suivi.png",
  },
];

function getCountdownLabel(date: Date) {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) {
    return "Aujourd'hui";
  }

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days <= 1 ? "Demain" : `Dans ${days} jours`;
}

export default async function DashboardPage() {
  const user = await requireRole("ELEVE", "/dashboard");
  const [documents, nextRendezVous, notifications, paymentCount] = await Promise.all([
    prisma.documentAcademique.findMany({
      where: { eleveId: user.id },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.rendezVous.findFirst({
      where: { eleveId: user.id, statut: { in: ["PLANIFIE", "CONFIRME"] } },
      orderBy: [{ dateRdv: "asc" }, { heureRdv: "asc" }],
      include: { document: true },
    }),
    prisma.notification.findMany({
      where: { userId: user.id, deletedAt: null },
      take: 3,
      orderBy: { dateEnvoi: "desc" },
    }),
    prisma.paiement.count({
      where: {
        OR: [{ duplicata: { eleveId: user.id } }, { documentAcademique: { eleveId: user.id } }],
      },
    }),
  ]);

  const submittedDocuments = documents.filter((document) => document.demandeSoumiseAt);
  const availableCount = submittedDocuments.filter(
    (document) => document.statut === "DISPONIBLE",
  ).length;
  const pendingCount = submittedDocuments.filter(
    (document) => document.statut === "PAS_DISPONIBLE",
  ).length;
  const retiredCount = submittedDocuments.filter((document) => document.statut === "RETIRE").length;
  const globalStatus =
    availableCount > 0
      ? "Document disponible"
      : pendingCount > 0
        ? "Dossier en traitement"
        : retiredCount > 0
          ? "Documents retirés"
          : submittedDocuments.length > 0
            ? "Suivi des demandes"
            : "Aucune demande enregistrée";

  return (
    <DashboardShell
      role="ELEVE"
      userId={user.id}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      activePath="/dashboard"
      title="Tableau de bord élève"
      subtitle={`Matricule ${user.matricule}`}
    >
      <WelcomeBanner
        accent="eleve"
        eyebrow="Bienvenue"
        title={`${user.prenom} ${user.nom}`}
        subtitle={`Matricule : ${user.matricule}`}
        icon={GraduationCap}
        trailing={
          <div className="rounded-lg border border-white/15 bg-white/10 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Statut global</p>
            <p className="mt-2 text-lg font-semibold">{globalStatus}</p>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {documentCards.map((item) => {
          const Icon = item.icon;
          const document = documents.find((doc) => doc.typeDocument === item.type);

          return (
            <article
              key={item.type}
              className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-obc-100 text-obc-800">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <StatusBadge
                  tone={document?.demandeSoumiseAt ? documentTone(document.statut) : "slate"}
                >
                  {getStudentDocumentStatusLabel(document)}
                </StatusBadge>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-text-1">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-3">
                {document ? getDocumentTitle(document) : "Aucun document rattaché pour le moment."}
              </p>
            </article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-obc-800" aria-hidden="true" />
            <h2 className="font-semibold text-text-1">Prochain rendez-vous</h2>
          </div>
          {nextRendezVous ? (
            <div className="mt-5 rounded-lg border border-[var(--border-token)] bg-surface-1 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-1">
                    {nextRendezVous.document
                      ? getDocumentTitle(nextRendezVous.document)
                      : "Document scolaire"}
                  </p>
                  <p className="mt-2 break-words text-sm text-text-3">
                    {nextRendezVous.dateRdv.toLocaleDateString("fr-FR")} à {nextRendezVous.heureRdv}{" "}
                    · {nextRendezVous.lieu}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge tone={appointmentTone(nextRendezVous.statut)}>
                    {nextRendezVous.statut}
                  </StatusBadge>
                  <p className="mt-2 text-sm font-semibold text-obc-800">
                    {getCountdownLabel(nextRendezVous.dateRdv)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-[var(--border-token)] bg-surface-1 p-4 text-sm text-text-3">
              Aucun rendez-vous actif pour le moment.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-obc-800" aria-hidden="true" />
            <h2 className="font-semibold text-text-1">Notifications récentes</h2>
          </div>
          <div className="mt-5 divide-y divide-[var(--border-token)]">
            {notifications.length === 0 ? (
              <p className="py-3 text-sm text-text-3">Aucune notification récente.</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="py-3">
                  {notification.title ? (
                    <p className="text-sm font-semibold text-text-1">{notification.title}</p>
                  ) : null}
                  <p className="mt-1 text-sm leading-6 text-text-2">{notification.message}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
        <h2 className="font-semibold text-text-1">Actions rapides</h2>
        <p className="mt-1 text-sm text-text-3">Ce que vous pouvez faire depuis votre espace.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const text =
              action.href === "/dashboard/payments" && paymentCount > 0
                ? `${paymentCount} paiement${paymentCount > 1 ? "s" : ""} enregistré${paymentCount > 1 ? "s" : ""}`
                : action.text;

            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center gap-4 rounded-lg border border-[var(--border-token)] bg-surface-1 p-3 transition-[var(--transition-base)] hover:-translate-y-0.5 hover:border-obc-200 hover:shadow-hover"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border-token)] bg-surface-0">
                  <Image src={action.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-text-1 group-hover:text-obc-800">
                    {action.title}
                  </span>
                  <span className="block text-sm text-text-3">{text}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </DashboardShell>
  );
}
