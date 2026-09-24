"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CreditCard,
  FileClock,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge, appointmentTone, documentTone } from "@/components/dashboard/status-badge";
import { useI18n } from "@/components/i18n/locale-provider";
import { DocumentTitleText } from "@/components/i18n/ui";
import { Button } from "@/components/ui/button";

type RecentDocument = {
  id: string;
  statut: "PAS_DISPONIBLE" | "DISPONIBLE" | "RETIRE";
  diplomeType: string;
  typeDocument: "ORIGINAL" | "RELEVE_NOTES" | "DUPLICATA" | string;
  eleve: { prenom: string; nom: string; matricule: string };
  organismeNom: string | null;
};

type TodayAppointment = {
  id: string;
  heureRdv: string;
  statut: "PLANIFIE" | "CONFIRME" | "ANNULE" | "HONORE";
  matricule: string;
  diplomeType: string | null;
  typeDocument: string | null;
};

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

export function AdminHomeView({
  userName,
  scopeLabel,
  elevesCount,
  documentsEnAttente,
  rendezVousTodayCount,
  paiementsMoisCount,
  quota,
  quotaAlmostReached,
  withdrawalsCount,
  chartValues,
  recentDocuments,
  todayAppointments,
  canManageAppointments,
}: {
  userName: string;
  scopeLabel: string | null;
  elevesCount: number;
  documentsEnAttente: number;
  rendezVousTodayCount: number;
  paiementsMoisCount: number;
  quota: number;
  quotaAlmostReached: boolean;
  withdrawalsCount: number;
  chartValues: number[];
  recentDocuments: RecentDocument[];
  todayAppointments: TodayAppointment[];
  canManageAppointments: boolean;
}) {
  const { t } = useI18n();
  const resolvedScope = scopeLabel ?? t("dashboard.admin.defaultScope");

  return (
    <>
      <WelcomeBanner
        accent="admin"
        eyebrow={
          scopeLabel
            ? t("dashboard.admin.administrationScope", { scope: scopeLabel })
            : t("dashboard.admin.administration")
        }
        title={userName}
        subtitle={t("dashboard.admin.scopeLine", { scope: resolvedScope })}
        icon={ShieldCheck}
        trailing={
          <div className="rounded-lg border border-white/15 bg-white/10 px-5 py-4 text-center lg:min-w-56">
            <p className="text-xs uppercase tracking-wide text-white/70">
              {t("dashboard.admin.studentsFollowed")}
            </p>
            <p className="mt-2 text-3xl font-bold">{elevesCount}</p>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("dashboard.admin.totalStudents")}
          value={elevesCount}
          icon={<UsersRound className="h-5 w-5" />}
        />
        <StatCard
          label={t("dashboard.admin.pendingDocuments")}
          value={documentsEnAttente}
          icon={<FileClock className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label={t("dashboard.admin.todayAppointments")}
          value={rendezVousTodayCount}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="green"
        />
        <StatCard
          label={t("dashboard.admin.monthPayments")}
          value={paiementsMoisCount}
          icon={<CreditCard className="h-5 w-5" />}
          tone="blue"
        />
      </div>

      {quotaAlmostReached ? (
        <section className="flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4 text-sm text-[#92400E] shadow-card">
          <AlertTriangle className="mt-0.5 h-5 w-5" aria-hidden="true" />
          <p>
            {t("dashboard.admin.quotaWarning", {
              current: rendezVousTodayCount,
              quota,
            })}
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-text-1">{t("dashboard.admin.withdrawalsChart")}</h2>
            <p className="mt-1 text-sm text-text-3">{t("dashboard.admin.withdrawalsHint")}</p>
          </div>
          <StatusBadge tone="green">
            {t("dashboard.admin.withdrawalsCount", { count: withdrawalsCount })}
          </StatusBadge>
        </div>
        <div className="mt-6 h-44 rounded-lg bg-surface-1 p-4">
          <svg
            viewBox="0 0 100 36"
            className="h-full w-full"
            role="img"
            aria-label={t("dashboard.admin.chartLabel")}
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
            <h2 className="font-semibold text-text-1">{t("dashboard.admin.recentDocuments")}</h2>
          </div>
          <div className="hidden grid-cols-[1.4fr_1fr_auto_auto] gap-4 border-b border-[var(--border-token)] bg-surface-0 px-5 py-3 text-xs font-semibold uppercase text-text-3 md:grid">
            <span>{t("dashboard.admin.student")}</span>
            <span>{t("dashboard.admin.type")}</span>
            <span>{t("dashboard.admin.status")}</span>
            <span className="text-right">{t("dashboard.admin.action")}</span>
          </div>
          <div className="divide-y divide-[var(--border-token)]">
            {recentDocuments.length === 0 ? (
              <p className="px-5 py-6 text-sm text-text-3">{t("dashboard.admin.noRecent")}</p>
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
                    <p className="truncate">
                      <DocumentTitleText
                        diplomeType={document.diplomeType}
                        typeDocument={document.typeDocument}
                      />
                    </p>
                    <p className="truncate text-xs text-text-3">
                      {document.organismeNom ?? t("dashboard.admin.undefinedOrg")}
                    </p>
                  </div>
                  <StatusBadge tone={documentTone(document.statut)} status={document.statut} />
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="justify-self-start md:justify-self-end"
                  >
                    <Link href={`/admin/documents?q=${document.eleve.matricule}`}>
                      {t("dashboard.admin.open")}
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
          <h2 className="font-semibold text-text-1">{t("dashboard.admin.todayRdv")}</h2>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-text-3">{t("dashboard.admin.noTodayRdv")}</p>
            ) : (
              todayAppointments.map((rdv) => (
                <div
                  key={rdv.id}
                  className="min-w-56 rounded-lg border border-[var(--border-token)] bg-surface-1 p-4"
                >
                  <p className="font-semibold text-obc-800">{rdv.heureRdv}</p>
                  <p className="mt-2 text-sm font-medium text-text-1">{rdv.matricule}</p>
                  <p className="mt-1 truncate text-xs text-text-3">
                    {rdv.diplomeType && rdv.typeDocument ? (
                      <DocumentTitleText
                        diplomeType={rdv.diplomeType}
                        typeDocument={rdv.typeDocument}
                      />
                    ) : (
                      t("dashboard.schoolDocument")
                    )}
                  </p>
                  <div className="mt-3">
                    <StatusBadge tone={appointmentTone(rdv.statut)} status={rdv.statut} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
        <h2 className="font-semibold text-text-1">{t("dashboard.quickActions")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/documents">{t("dashboard.admin.quickDocuments")}</Link>
          </Button>
          {canManageAppointments ? (
            <Button asChild variant="outline">
              <Link href="/admin/rdv-disponibilites">{t("dashboard.admin.quickAvailability")}</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/admin/students">{t("dashboard.admin.quickStudents")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
