import Link from "next/link";
import { Bell, CalendarDays, CreditCard, FileText, GraduationCap, RotateCcw } from "lucide-react";

import { getDocumentTitle, getStatusLabel } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TypeDocument } from "@/lib/generated/prisma/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge, appointmentTone, documentTone } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";

const documentCards: Array<{
  type: TypeDocument;
  title: string;
  icon: typeof GraduationCap;
}> = [
  { type: "ORIGINAL", title: "Diplôme", icon: GraduationCap },
  { type: "RELEVE_NOTES", title: "Relevé", icon: FileText },
  { type: "DUPLICATA", title: "Duplicata", icon: RotateCcw },
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
      where: { userId: user.id },
      take: 3,
      orderBy: { dateEnvoi: "desc" },
    }),
    prisma.paiement.count({
      where: {
        OR: [{ duplicata: { eleveId: user.id } }, { documentAcademique: { eleveId: user.id } }],
      },
    }),
  ]);

  const availableCount = documents.filter((document) => document.statut === "DISPONIBLE").length;
  const pendingCount = documents.filter((document) => document.statut === "PAS_DISPONIBLE").length;
  const retiredCount = documents.filter((document) => document.statut === "RETIRE").length;
  const globalStatus =
    availableCount > 0
      ? "Document disponible"
      : pendingCount > 0
        ? "Dossier en traitement"
        : retiredCount > 0
          ? "Documents retirés"
          : "Aucun document actif";

  return (
    <DashboardShell
      role="ELEVE"
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      activePath="/dashboard"
      title="Tableau de bord élève"
      subtitle={`Matricule ${user.matricule}`}
    >
      <section className="rounded-lg border border-[var(--border-token)] bg-obc-800 p-6 text-white shadow-card">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-medium text-white/70">Bienvenue</p>
            <h2 className="mt-2 text-2xl font-bold">
              {user.prenom} {user.nom}
            </h2>
            <p className="mt-2 text-sm text-white/75">Matricule : {user.matricule}</p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Statut global</p>
            <p className="mt-2 text-lg font-semibold">{globalStatus}</p>
          </div>
        </div>
      </section>

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
                <StatusBadge tone={document ? documentTone(document.statut) : "slate"}>
                  {document ? getStatusLabel(document.statut) : "Non disponible"}
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
                      : "Document académique"}
                  </p>
                  <p className="mt-2 text-sm text-text-3">
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
              Aucun rendez-vous actif.
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
                <p key={notification.id} className="py-3 text-sm leading-6 text-text-2">
                  {notification.message}
                </p>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
        <h2 className="font-semibold text-text-1">Actions rapides</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/documents">Demander un relevé</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/documents">Demander un duplicata</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/payments">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Voir mes paiements ({paymentCount})
            </Link>
          </Button>
        </div>
      </section>
    </DashboardShell>
  );
}
