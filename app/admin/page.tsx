import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CreditCard,
  FileClock,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { getDocumentTitle, getStatusLabel } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope, getAdminScopeLabel, ORGANISME_IDS } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge, appointmentTone, documentTone } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildThirtyDaySeries() {
  const today = startOfDay();

  return Array.from({ length: 30 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - 29 + index);

    return {
      key: dateKey(day),
      label: day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      value: 0,
    };
  });
}

function buildSparklinePoints(values: number[]) {
  const maxValue = Math.max(1, ...values);

  return values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100;
      const y = 32 - (value / maxValue) * 28;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export default async function AdminPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin");
  const documentScope = getAdminDocumentScope(user);
  const scopeLabel = getAdminScopeLabel(user);
  const canManageAppointments =
    user.organismeId === ORGANISME_IDS.OBC || user.organismeId === ORGANISME_IDS.DECC;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(startOfDay());
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const series = buildThirtyDaySeries();
  const duplicataPaymentScope = {
    ...(user.organismeId ? { organismeId: user.organismeId } : {}),
    ...(user.antenneRegionaleId ? { antenneRegionaleId: user.antenneRegionaleId } : {}),
  };

  const [
    elevesCount,
    documentsEnAttente,
    rendezVousTodayCount,
    paiementsMoisCount,
    recentDocuments,
    todayAppointments,
    honoredAppointments,
    adminSettings,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "ELEVE", documentsAcademique: { some: documentScope } } }),
    prisma.documentAcademique.count({ where: { ...documentScope, statut: "PAS_DISPONIBLE" } }),
    prisma.rendezVous.count({
      where: {
        statut: { in: ["PLANIFIE", "CONFIRME"] },
        dateRdv: { gte: startOfDay(), lte: endOfDay() },
        document: { is: documentScope },
      },
    }),
    prisma.paiement.count({
      where: {
        statut: "EFFECTUE",
        createdAt: { gte: monthStart },
        OR: [
          { documentAcademique: { is: documentScope } },
          { duplicata: { is: duplicataPaymentScope } },
        ],
      },
    }),
    prisma.documentAcademique.findMany({
      where: documentScope,
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { eleve: true, organisme: true },
    }),
    prisma.rendezVous.findMany({
      where: {
        statut: { in: ["PLANIFIE", "CONFIRME"] },
        dateRdv: { gte: startOfDay(), lte: endOfDay() },
        document: { is: documentScope },
      },
      take: 8,
      orderBy: [{ heureRdv: "asc" }],
      include: { eleve: true, document: true },
    }),
    prisma.rendezVous.findMany({
      where: {
        statut: "HONORE",
        retraitConfirmeAt: { gte: thirtyDaysAgo },
        document: { is: documentScope },
      },
      select: { retraitConfirmeAt: true },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { maxRdvParJour: true },
    }),
  ]);

  const countsByDay = new Map(series.map((item) => [item.key, 0]));
  honoredAppointments.forEach((appointment) => {
    if (appointment.retraitConfirmeAt) {
      const key = dateKey(appointment.retraitConfirmeAt);
      countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
    }
  });
  const chartSeries = series.map((item) => ({
    ...item,
    value: countsByDay.get(item.key) ?? 0,
  }));
  const chartValues = chartSeries.map((item) => item.value);
  const quota = adminSettings?.maxRdvParJour ?? 10;
  const quotaRatio = quota > 0 ? rendezVousTodayCount / quota : 0;
  const quotaAlmostReached = quotaRatio >= 0.8;

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      organismeId={user.organismeId}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      scopeLabel={scopeLabel}
      activePath="/admin"
      title={`Administration ${user.nomService ?? ""}`.trim()}
      subtitle={`Périmètre ${scopeLabel ?? "administration"}`}
    >
      <WelcomeBanner
        accent="admin"
        eyebrow={scopeLabel ? `Administration · ${scopeLabel}` : "Administration"}
        title={`${user.prenom} ${user.nom}`}
        subtitle={`Périmètre ${scopeLabel ?? "administration"}`}
        icon={ShieldCheck}
        trailing={
          <div className="rounded-lg border border-white/15 bg-white/10 px-5 py-4 text-center lg:min-w-56">
            <p className="text-xs uppercase tracking-wide text-white/70">Élèves suivis</p>
            <p className="mt-2 text-3xl font-bold">{elevesCount}</p>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total élèves"
          value={elevesCount}
          icon={<UsersRound className="h-5 w-5" />}
        />
        <StatCard
          label="Documents en attente"
          value={documentsEnAttente}
          icon={<FileClock className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="RDV du jour"
          value={rendezVousTodayCount}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="green"
        />
        <StatCard
          label="Paiements du mois"
          value={paiementsMoisCount}
          icon={<CreditCard className="h-5 w-5" />}
          tone="blue"
        />
      </div>

      {quotaAlmostReached ? (
        <section className="flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4 text-sm text-[#92400E] shadow-card">
          <AlertTriangle className="mt-0.5 h-5 w-5" aria-hidden="true" />
          <p>
            Quota journalier presque atteint : {rendezVousTodayCount}/{quota} rendez-vous planifiés.
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-text-1">Évolution des retraits sur 30 jours</h2>
            <p className="mt-1 text-sm text-text-3">
              Retraits confirmés sur les 30 derniers jours.
            </p>
          </div>
          <StatusBadge tone="green">{honoredAppointments.length} retraits</StatusBadge>
        </div>
        <div className="mt-6 h-44 rounded-lg bg-surface-1 p-4">
          <svg
            viewBox="0 0 100 36"
            className="h-full w-full"
            role="img"
            aria-label="Courbe des retraits sur 30 jours"
          >
            <polyline
              points={buildSparklinePoints(chartValues)}
              fill="none"
              stroke="#52B788"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 shadow-card">
          <div className="border-b border-[var(--border-token)] bg-surface-1 px-5 py-4">
            <h2 className="font-semibold text-text-1">Documents récents</h2>
          </div>
          <div className="hidden grid-cols-[1.4fr_1fr_auto_auto] gap-4 border-b border-[var(--border-token)] bg-surface-0 px-5 py-3 text-xs font-semibold uppercase text-text-3 md:grid">
            <span>Élève</span>
            <span>Type</span>
            <span>Statut</span>
            <span className="text-right">Action</span>
          </div>
          <div className="divide-y divide-[var(--border-token)]">
            {recentDocuments.length === 0 ? (
              <p className="px-5 py-6 text-sm text-text-3">Aucun document récent.</p>
            ) : (
              recentDocuments.map((document) => (
                <div
                  key={document.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1.4fr_1fr_auto_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-text-1">
                      {document.eleve.prenom} {document.eleve.nom}
                    </p>
                    <p className="font-mono text-xs text-text-3">{document.eleve.matricule}</p>
                  </div>
                  <div className="min-w-0 text-sm text-text-2">
                    <p className="truncate">{getDocumentTitle(document)}</p>
                    <p className="truncate text-xs text-text-3">
                      {document.organisme?.nom ?? "Non défini"}
                    </p>
                  </div>
                  <StatusBadge tone={documentTone(document.statut)}>
                    {getStatusLabel(document.statut)}
                  </StatusBadge>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="justify-self-start md:justify-self-end"
                  >
                    <Link href={`/admin/documents?q=${document.eleve.matricule}`}>Ouvrir</Link>
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
          <h2 className="font-semibold text-text-1">Rendez-vous du jour</h2>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-text-3">Aucun rendez-vous programmé aujourd&apos;hui.</p>
            ) : (
              todayAppointments.map((rdv) => (
                <div
                  key={rdv.id}
                  className="min-w-56 rounded-lg border border-[var(--border-token)] bg-surface-1 p-4"
                >
                  <p className="font-semibold text-obc-800">{rdv.heureRdv}</p>
                  <p className="mt-2 text-sm font-medium text-text-1">{rdv.eleve.matricule}</p>
                  <p className="mt-1 truncate text-xs text-text-3">
                    {rdv.document ? getDocumentTitle(rdv.document) : "Document scolaire"}
                  </p>
                  <div className="mt-3">
                    <StatusBadge tone={appointmentTone(rdv.statut)}>{rdv.statut}</StatusBadge>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
        <h2 className="font-semibold text-text-1">Actions rapides</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/documents">Documents</Link>
          </Button>
          {canManageAppointments ? (
            <Button asChild variant="outline">
              <Link href="/admin/rdv-disponibilites">Disponibilités RDV</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/admin/students">Élèves</Link>
          </Button>
        </div>
      </section>
    </DashboardShell>
  );
}
