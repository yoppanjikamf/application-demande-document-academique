import Link from "next/link";
import { CalendarDays, CheckCircle2, ClipboardList } from "lucide-react";

import {
  getAgentCentreExamen,
  getCentreExamenAppointmentWhere,
  normalizeAgentAppointmentFilter,
  type AgentAppointmentFilter,
} from "@/lib/centre-examen-service";
import { getDocumentTitle } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConfirmWithdrawalButton } from "@/components/centre-examen/confirm-withdrawal-button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";

type CentreExamenPageProps = {
  searchParams?: Promise<{
    filter?: string;
  }>;
};

const filterItems: Array<{ value: AgentAppointmentFilter; label: string }> = [
  { value: "today", label: "Aujourd'hui" },
  { value: "upcoming", label: "À venir" },
  { value: "processed", label: "Déjà traités" },
];

function buildFilterHref(filter: AgentAppointmentFilter) {
  return filter === "today" ? "/centre-examen" : `/centre-examen?filter=${filter}`;
}

export default async function CentreExamenPage({ searchParams }: CentreExamenPageProps) {
  const user = await requireRole("AGENT_CENTRE_EXAMEN", "/centre-examen");
  const params = await searchParams;
  const filter = normalizeAgentAppointmentFilter(params?.filter);
  const centre = await getAgentCentreExamen(user);
  const appointments = await prisma.rendezVous.findMany({
    where: getCentreExamenAppointmentWhere(centre.region, filter),
    orderBy: [{ dateRdv: filter === "processed" ? "desc" : "asc" }, { heureRdv: "asc" }],
    include: {
      eleve: {
        select: {
          nom: true,
          prenom: true,
          matricule: true,
        },
      },
      document: {
        select: {
          diplomeType: true,
          typeDocument: true,
          centreExamen: true,
        },
      },
    },
  });

  return (
    <DashboardShell
      role="AGENT_CENTRE_EXAMEN"
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      scopeLabel={centre.nom}
      activePath="/centre-examen"
      title="Rendez-vous centre d'examen"
      subtitle="Confirmation des retraits programmés dans votre centre."
    >
      <div className="flex flex-wrap items-center gap-2">
        {filterItems.map((item) => (
          <Button
            key={item.value}
            asChild
            size="sm"
            variant={filter === item.value ? "default" : "outline"}
          >
            <Link href={buildFilterHref(item.value)}>{item.label}</Link>
          </Button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_auto] border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500">
          <span>Rendez-vous</span>
          <span>Statut</span>
        </div>
        <div className="divide-y divide-slate-100">
          {appointments.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="mt-3 text-sm text-slate-500">Aucun rendez-vous trouvé.</p>
            </div>
          ) : (
            appointments.map((appointment) => {
              const documentTitle = appointment.document
                ? getDocumentTitle(appointment.document)
                : "Document scolaire";
              const isRetired = appointment.statut === "HONORE";

              return (
                <div
                  key={appointment.id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-950">
                        {appointment.eleve.nom} {appointment.eleve.prenom}
                      </p>
                      <span className="font-mono text-xs text-slate-500">
                        {appointment.eleve.matricule}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                      <span className="inline-flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        {documentTitle}
                      </span>
                      <span>{appointment.document?.centreExamen ?? centre.nom}</span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        {appointment.dateRdv.toLocaleDateString("fr-FR")}
                      </span>
                      <span>{appointment.heureRdv}</span>
                    </div>
                    {appointment.retraitConfirmeAt ? (
                      <p className="mt-2 inline-flex items-center gap-2 text-sm text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Retiré le {appointment.retraitConfirmeAt.toLocaleString("fr-FR")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                    <StatusBadge status={isRetired ? "RETIRE" : "EN_ATTENTE"} />
                    {!isRetired ? <ConfirmWithdrawalButton appointmentId={appointment.id} /> : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
