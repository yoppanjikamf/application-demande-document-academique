"use client";

import Link from "next/link";

import { cancelRendezVousAction } from "@/app/dashboard/actions";
import { StatusBadge, appointmentTone } from "@/components/dashboard/status-badge";
import { useI18n } from "@/components/i18n/locale-provider";
import { AppointmentStatusText, DocumentTitleText, LocaleDate } from "@/components/i18n/ui";
import { Button } from "@/components/ui/button";

type AppointmentItem = {
  id: string;
  dateRdv: string;
  heureRdv: string;
  lieu: string;
  commentaire: string | null;
  statut: "PLANIFIE" | "CONFIRME" | "ANNULE" | "HONORE";
  diplomeType: string | null;
  typeDocument: string | null;
  agentName: string;
};

export function StudentAppointmentsView({ appointments }: { appointments: AppointmentItem[] }) {
  const { t } = useI18n();

  if (appointments.length === 0) {
    return (
      <div className="space-y-3 rounded-md border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
        <p className="text-text-3">{t("dashboard.appointments.empty")}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/documents">{t("dashboard.appointments.backToDocuments")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((rdv) => (
        <article
          key={rdv.id}
          className="rounded-md border border-[var(--border-token)] bg-surface-0 p-4 shadow-card"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-lg font-semibold leading-snug text-text-1">
                {rdv.diplomeType && rdv.typeDocument ? (
                  <DocumentTitleText diplomeType={rdv.diplomeType} typeDocument={rdv.typeDocument} />
                ) : (
                  t("dashboard.schoolDocument")
                )}
              </p>
              <p className="break-words text-sm leading-6 text-text-3">
                <span className="font-medium text-text-2">{t("dashboard.appointments.date")}</span>{" "}
                <LocaleDate value={rdv.dateRdv} /> · {rdv.heureRdv}
              </p>
              <p className="break-words text-sm leading-6 text-text-3">
                <span className="font-medium text-text-2">{t("dashboard.appointments.place")}</span>{" "}
                {rdv.lieu}
              </p>
              <p className="break-words text-sm leading-6 text-text-3">
                <span className="font-medium text-text-2">{t("dashboard.appointments.agent")}</span>{" "}
                {rdv.agentName}
              </p>
              {rdv.commentaire ? (
                <p className="break-words text-sm leading-6 text-text-3">
                  <span className="font-medium text-text-2">{t("dashboard.appointments.comment")}</span>{" "}
                  {rdv.commentaire}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
              <StatusBadge tone={appointmentTone(rdv.statut)}>
                <AppointmentStatusText statut={rdv.statut} />
              </StatusBadge>
              {rdv.statut === "PLANIFIE" || rdv.statut === "CONFIRME" ? (
                <form action={cancelRendezVousAction}>
                  <input type="hidden" name="rendezVousId" value={rdv.id} />
                  <Button type="submit" size="sm" variant="outline" className="w-full sm:w-auto">
                    {t("dashboard.appointments.cancel")}
                  </Button>
                </form>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
