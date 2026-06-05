import { MapPin } from "lucide-react";

import { getAgentCentreExamen, getCentreExamenAppointmentWhere } from "@/lib/centre-examen-service";
import { getDocumentTitle } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import type { Prisma, StatutRendezVous } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { CentreAppointmentsPanel } from "@/components/centre-examen/centre-appointments-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { CentreAppointment } from "@/components/centre-examen/centre-appointments-panel";

type CentreExamenPageProps = {
  searchParams?: Promise<{
    slot?: string;
  }>;
};

export default async function CentreExamenPage({ searchParams }: CentreExamenPageProps) {
  const user = await requireRole("AGENT_CENTRE_EXAMEN", "/centre-examen");
  const params = await searchParams;
  const slot = params?.slot?.trim();
  const centre = await getAgentCentreExamen(user);
  const todayBaseWhere = getCentreExamenAppointmentWhere(centre, "today");
  const upcomingWhere = getCentreExamenAppointmentWhere(centre, "upcoming");
  const todayStatuses: StatutRendezVous[] = ["PLANIFIE", "CONFIRME", "HONORE"];
  const todayWhere: Prisma.RendezVousWhereInput = {
    ...todayBaseWhere,
    statut: { in: todayStatuses },
  };

  const [todayAppointments, upcomingAppointments, listedAppointments, confirmedToday] =
    await Promise.all([
    prisma.rendezVous.findMany({
      where: todayWhere,
      orderBy: [{ heureRdv: "asc" }],
      include: {
        eleve: { select: { nom: true, prenom: true, matricule: true } },
        document: { select: { diplomeType: true, typeDocument: true, centreExamen: true } },
      },
    }),
    prisma.rendezVous.findMany({
      where: upcomingWhere,
      orderBy: [{ dateRdv: "asc" }, { heureRdv: "asc" }],
      include: {
        eleve: { select: { nom: true, prenom: true, matricule: true } },
        document: { select: { diplomeType: true, typeDocument: true, centreExamen: true } },
      },
    }),
    prisma.rendezVous.findMany({
      where: {
        ...upcomingWhere,
        ...(slot ? { heureRdv: slot } : {}),
      },
      orderBy: [{ heureRdv: "asc" }],
      include: {
        eleve: { select: { nom: true, prenom: true, matricule: true } },
        document: { select: { diplomeType: true, typeDocument: true, centreExamen: true } },
      },
    }),
    prisma.rendezVous.count({
      where: {
        ...todayWhere,
        statut: "HONORE",
      },
    }),
  ]);

  const mapAppointment = (appointment: (typeof listedAppointments)[number]): CentreAppointment => ({
    id: appointment.id,
    dateRdv: appointment.dateRdv.toISOString(),
    heureRdv: appointment.heureRdv,
    lieu: appointment.lieu,
    statut: appointment.statut,
    retraitConfirmeAt: appointment.retraitConfirmeAt?.toISOString() ?? null,
    eleve: appointment.eleve,
    document: appointment.document
      ? {
          ...appointment.document,
          title: getDocumentTitle(appointment.document),
        }
      : null,
  });

  const initialAppointments = todayAppointments.map(mapAppointment);
  const initialUpcomingAppointments = listedAppointments.map(mapAppointment);

  const initialSlots = Array.from(
    new Set(
      (initialUpcomingAppointments.length > 0 ? upcomingAppointments : todayAppointments).map(
        (appointment) => appointment.heureRdv,
      ),
    ),
  );

  return (
    <DashboardShell
      role="AGENT_CENTRE_EXAMEN"
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      scopeLabel={centre.nom}
      activePath="/centre-examen"
      title="Rendez-vous du centre"
      subtitle="Consultez les rendez-vous à venir et confirmez les retraits le jour J."
    >
      <section className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
          <p className="text-sm font-medium text-text-3">Centre d&apos;examen</p>
          <h2 className="mt-2 text-2xl font-bold text-text-1">{centre.nom}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-text-3">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {centre.region}
            {centre.ville ? ` · ${centre.ville}` : ""}
          </p>
        </div>
        <div className="rounded-lg border border-obc-200 bg-obc-100 p-5 shadow-card lg:min-w-72">
          <p className="text-sm font-medium text-obc-800">Retraits confirmés aujourd&apos;hui</p>
          <p className="mt-2 text-3xl font-bold text-obc-800">
            {confirmedToday}/{todayAppointments.length}
          </p>
        </div>
      </section>

      <CentreAppointmentsPanel
        centreName={centre.nom}
        initialAppointments={initialAppointments}
        initialUpcomingAppointments={initialUpcomingAppointments}
        initialSlots={initialSlots}
        initialSlot={slot}
      />
    </DashboardShell>
  );
}
