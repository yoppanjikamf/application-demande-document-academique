"use client";

import * as React from "react";
import { CalendarDays, CheckCircle2, ClipboardList } from "lucide-react";
import { toast } from "react-toastify";

import { ConfirmWithdrawalButton } from "@/components/centre-examen/confirm-withdrawal-button";
import { StatusBadge, appointmentTone } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";

type AppointmentStatus = "PLANIFIE" | "CONFIRME" | "ANNULE" | "HONORE";

export type CentreAppointment = {
  id: string;
  dateRdv: string;
  heureRdv: string;
  lieu: string;
  statut: AppointmentStatus;
  retraitConfirmeAt: string | null;
  eleve: {
    nom: string;
    prenom: string;
    matricule: string;
  };
  document: {
    diplomeType: string;
    typeDocument: string;
    centreExamen: string | null;
    title: string;
  } | null;
};

type CentreAppointmentsResponse = {
  appointments?: CentreAppointment[];
};

function buildSlots(appointments: CentreAppointment[]) {
  return Array.from(new Set(appointments.map((appointment) => appointment.heureRdv))).sort();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("fr-FR");
}

type AppointmentView = "today" | "upcoming";

export function CentreAppointmentsPanel({
  centreName,
  initialAppointments,
  initialUpcomingAppointments,
  initialSlots,
  initialSlot,
}: {
  centreName: string;
  initialAppointments: CentreAppointment[];
  initialUpcomingAppointments: CentreAppointment[];
  initialSlots: string[];
  initialSlot?: string;
}) {
  const [view, setView] = React.useState<AppointmentView>("upcoming");
  const [appointments, setAppointments] = React.useState(
    initialUpcomingAppointments.length > 0 ? initialUpcomingAppointments : initialAppointments,
  );
  const [selectedSlot, setSelectedSlot] = React.useState(initialSlot ?? "");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    setAppointments(view === "today" ? initialAppointments : initialUpcomingAppointments);
    setSelectedSlot("");
  }, [view, initialAppointments, initialUpcomingAppointments]);

  const refreshAppointments = React.useCallback(
    async ({
      silent = true,
      filter = view,
    }: { silent?: boolean; filter?: AppointmentView } = {}) => {
      try {
        if (!silent) {
          setIsRefreshing(true);
        }

        const response = await fetch(`/api/centre-examen/appointments?filter=${filter}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const data = (await response.json().catch(() => null)) as CentreAppointmentsResponse | null;

        if (!response.ok || !data?.appointments) {
          if (!silent) {
            toast.error("Actualisation des rendez-vous impossible.");
          }
          return;
        }

        setAppointments(data.appointments);
      } finally {
        setIsRefreshing(false);
      }
    },
    [view],
  );

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshAppointments({ filter: view });
    }, 10000);

    return () => window.clearInterval(interval);
  }, [refreshAppointments, view]);

  const slots = appointments.length > 0 ? buildSlots(appointments) : initialSlots;

  const listedAppointments = selectedSlot
    ? appointments.filter((appointment) => appointment.heureRdv === selectedSlot)
    : appointments;

  return (
    <>
      <section className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-text-1">Rendez-vous du centre</h2>
            <p className="mt-1 text-sm text-text-3">
              Les réservations élèves apparaissent ici dès confirmation, par région de composition.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={view === "upcoming" ? "default" : "outline"}
              onClick={() => {
                setView("upcoming");
                void refreshAppointments({ silent: false, filter: "upcoming" });
              }}
            >
              À venir
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "today" ? "default" : "outline"}
              onClick={() => {
                setView("today");
                void refreshAppointments({ silent: false, filter: "today" });
              }}
            >
              Aujourd&apos;hui
            </Button>
            <Button
              type="button"
              size="sm"
              variant={!selectedSlot ? "default" : "outline"}
              onClick={() => setSelectedSlot("")}
            >
              Tous les créneaux
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {slots.map((slot) => (
            <Button
              key={slot}
              type="button"
              size="sm"
              variant={selectedSlot === slot ? "default" : "outline"}
              onClick={() => setSelectedSlot(slot)}
            >
              {slot}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => void refreshAppointments({ silent: false })}
            disabled={isRefreshing}
            aria-label="Actualiser les rendez-vous du centre"
          >
            {isRefreshing ? "Actualisation..." : "Actualiser"}
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-[var(--border-token)] bg-surface-0 shadow-card">
        <div className="grid grid-cols-[1fr_auto] border-b border-[var(--border-token)] bg-surface-1 px-5 py-3 text-sm font-medium text-text-3">
          <span>{view === "today" ? "Retraits du jour" : "Rendez-vous à venir"}</span>
          <span>Action</span>
        </div>
        <div className="divide-y divide-[var(--border-token)]">
          {listedAppointments.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-text-muted" aria-hidden="true" />
              <p className="mt-3 text-sm text-text-3">Aucun rendez-vous sur ce créneau.</p>
            </div>
          ) : (
            listedAppointments.map((appointment) => {
              const documentTitle = appointment.document?.title ?? "Document scolaire";
              const isRetired = appointment.statut === "HONORE";

              return (
                <div
                  key={appointment.id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-text-1">
                        {appointment.eleve.nom} {appointment.eleve.prenom}
                      </p>
                      <span className="rounded-full bg-surface-1 px-2 py-1 font-mono text-xs text-text-3">
                        {appointment.eleve.matricule}
                      </span>
                      <StatusBadge tone={appointmentTone(appointment.statut)}>
                        {appointment.statut}
                      </StatusBadge>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-text-3 sm:grid-cols-2 xl:grid-cols-4">
                      <span className="inline-flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-obc-400" aria-hidden="true" />
                        {documentTitle}
                      </span>
                      <span>{appointment.document?.centreExamen ?? centreName}</span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-obc-400" aria-hidden="true" />
                        {formatDate(appointment.dateRdv)}
                      </span>
                      <span>{appointment.heureRdv}</span>
                    </div>
                    {appointment.retraitConfirmeAt ? (
                      <p className="mt-2 inline-flex items-center gap-2 text-sm text-[#16A34A]">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Retiré le {formatDateTime(appointment.retraitConfirmeAt)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex justify-start lg:justify-end">
                    {isRetired ? (
                      <StatusBadge status="RETIRE" />
                    ) : (
                      <ConfirmWithdrawalButton
                        appointmentId={appointment.id}
                        onConfirmed={() => void refreshAppointments({ silent: true })}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
