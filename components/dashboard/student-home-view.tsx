"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, CalendarDays, FileText, GraduationCap, RotateCcw } from "lucide-react";

import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { StatusBadge, appointmentTone, documentTone } from "@/components/dashboard/status-badge";
import { useI18n } from "@/components/i18n/locale-provider";
import {
  AppointmentStatusText,
  DocumentStatusText,
  DocumentTitleText,
  LocaleDate,
} from "@/components/i18n/ui";
import type { TranslationKey } from "@/lib/i18n/translate";

type HomeDocument = {
  typeDocument: "ORIGINAL" | "RELEVE_NOTES" | "DUPLICATA";
  diplomeType: string;
  statut: string;
  requested: boolean;
};

type HomeAppointment = {
  diplomeType: string | null;
  typeDocument: string | null;
  dateRdv: string;
  heureRdv: string;
  lieu: string;
  statut: string;
};

type HomeNotification = {
  id: string;
  title: string | null;
  message: string;
};

const documentCards = [
  { type: "ORIGINAL" as const, titleKey: "dashboard.diploma.ORIGINAL", icon: GraduationCap },
  { type: "RELEVE_NOTES" as const, titleKey: "dashboard.diploma.RELEVE_NOTES", icon: FileText },
  { type: "DUPLICATA" as const, titleKey: "dashboard.diploma.DUPLICATA", icon: RotateCcw },
];

const quickActions = [
  {
    titleKey: "dashboard.actions.requestTranscript",
    textKey: "dashboard.actions.requestTranscriptHint",
    href: "/dashboard/documents",
    image: "/images/photos/documents.jpg",
  },
  {
    titleKey: "dashboard.actions.requestDiploma",
    textKey: "dashboard.actions.requestDiplomaHint",
    href: "/dashboard/documents",
    image: "/images/photos/diplome.jpg",
  },
  {
    titleKey: "dashboard.actions.requestDuplicate",
    textKey: "dashboard.actions.requestDuplicateHint",
    href: "/dashboard/documents",
    image: "/images/photos/duplicata.png",
  },
  {
    titleKey: "dashboard.actions.bookAppointment",
    textKey: "dashboard.actions.bookAppointmentHint",
    href: "/dashboard/rendez-vous",
    image: "/images/photos/rendez-vous.jpg",
  },
  {
    titleKey: "dashboard.actions.myPayments",
    textKey: "dashboard.actions.myPaymentsHint",
    href: "/dashboard/payments",
    image: "/images/photos/paiement.png",
  },
  {
    titleKey: "dashboard.actions.trackDocuments",
    textKey: "dashboard.actions.trackDocumentsHint",
    href: "/dashboard/documents",
    image: "/images/photos/suivi.png",
  },
] as const;

function getGlobalStatusKey(
  availableCount: number,
  pendingCount: number,
  retiredCount: number,
  submittedCount: number,
): TranslationKey {
  if (availableCount > 0) return "dashboard.status.available";
  if (pendingCount > 0) return "dashboard.status.processing";
  if (retiredCount > 0) return "dashboard.status.withdrawn";
  if (submittedCount > 0) return "dashboard.status.tracking";
  return "dashboard.status.none";
}

function getCountdownKey(date: string): { key: TranslationKey; days?: number } {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return { key: "dashboard.countdown.today" };
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days <= 1
    ? { key: "dashboard.countdown.tomorrow" }
    : { key: "dashboard.countdown.inDays", days };
}

export function StudentHomeView({
  userName,
  matricule,
  documents,
  nextAppointment,
  notifications,
  paymentCount,
}: {
  userName: string;
  matricule: string;
  documents: HomeDocument[];
  nextAppointment: HomeAppointment | null;
  notifications: HomeNotification[];
  paymentCount: number;
}) {
  const { t } = useI18n();
  const submitted = documents.filter((document) => document.requested);
  const globalStatusKey = getGlobalStatusKey(
    submitted.filter((document) => document.statut === "DISPONIBLE").length,
    submitted.filter((document) => document.statut === "PAS_DISPONIBLE").length,
    submitted.filter((document) => document.statut === "RETIRE").length,
    submitted.length,
  );

  return (
    <>
      <WelcomeBanner
        accent="eleve"
        eyebrow={t("dashboard.welcome")}
        title={userName}
        subtitle={t("dashboard.matriculeLabel", { matricule })}
        icon={GraduationCap}
        trailing={
          <div className="rounded-lg border border-white/15 bg-white/10 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-white/60">{t("dashboard.globalStatus")}</p>
            <p className="mt-2 text-lg font-semibold">{t(globalStatusKey)}</p>
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
                <StatusBadge tone={document?.requested ? documentTone(document.statut as never) : "slate"}>
                  <DocumentStatusText requested={Boolean(document?.requested)} statut={document?.statut} />
                </StatusBadge>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-text-1">
                {t(item.titleKey as TranslationKey)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-3">
                {document ? (
                  <DocumentTitleText diplomeType={document.diplomeType} typeDocument={document.typeDocument} />
                ) : (
                  t("dashboard.noLinkedDocument")
                )}
              </p>
            </article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-obc-800" aria-hidden="true" />
            <h2 className="font-semibold text-text-1">{t("dashboard.nextAppointment")}</h2>
          </div>
          {nextAppointment ? (
            <div className="mt-5 rounded-lg border border-[var(--border-token)] bg-surface-1 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-1">
                    {nextAppointment.diplomeType && nextAppointment.typeDocument ? (
                      <DocumentTitleText
                        diplomeType={nextAppointment.diplomeType}
                        typeDocument={nextAppointment.typeDocument}
                      />
                    ) : (
                      t("dashboard.schoolDocument")
                    )}
                  </p>
                  <p className="mt-2 break-words text-sm text-text-3">
                    <LocaleDate value={nextAppointment.dateRdv} /> à {nextAppointment.heureRdv} ·{" "}
                    {nextAppointment.lieu}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge tone={appointmentTone(nextAppointment.statut as never)}>
                    <AppointmentStatusText statut={nextAppointment.statut} />
                  </StatusBadge>
                  <p className="mt-2 text-sm font-semibold text-obc-800">
                    {(() => {
                      const countdown = getCountdownKey(nextAppointment.dateRdv);
                      return t(countdown.key, countdown.days ? { days: countdown.days } : undefined);
                    })()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-[var(--border-token)] bg-surface-1 p-4 text-sm text-text-3">
              {t("dashboard.noActiveAppointment")}
            </p>
          )}
        </section>

        <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-obc-800" aria-hidden="true" />
            <h2 className="font-semibold text-text-1">{t("dashboard.recentNotifications")}</h2>
          </div>
          <div className="mt-5 divide-y divide-[var(--border-token)]">
            {notifications.length === 0 ? (
              <p className="py-3 text-sm text-text-3">{t("dashboard.noRecentNotifications")}</p>
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
        <h2 className="font-semibold text-text-1">{t("dashboard.quickActions")}</h2>
        <p className="mt-1 text-sm text-text-3">{t("dashboard.quickActionsHint")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const text =
              action.href === "/dashboard/payments" && paymentCount > 0
                ? t(
                    paymentCount > 1
                      ? "dashboard.actions.paymentsCountPlural"
                      : "dashboard.actions.paymentsCount",
                    { count: paymentCount },
                  )
                : t(action.textKey);

            return (
              <Link
                key={action.titleKey}
                href={action.href}
                className="group flex items-center gap-4 rounded-lg border border-[var(--border-token)] bg-surface-1 p-3 transition-[var(--transition-base)] hover:-translate-y-0.5 hover:border-obc-200 hover:shadow-hover"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border-token)] bg-surface-0">
                  <Image src={action.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-text-1 group-hover:text-obc-800">
                    {t(action.titleKey)}
                  </span>
                  <span className="block text-sm text-text-3">{text}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
