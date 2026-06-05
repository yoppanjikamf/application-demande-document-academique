import { MapPin } from "lucide-react";

import { getAgentCentreExamen, getCentreExamenAppointmentWhere } from "@/lib/centre-examen-service";
import { getDocumentTitle } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import type { Prisma, StatutRendezVous } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { CentreAppointmentsPanel } from "@/components/centre-examen/centre-appointments-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
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
      <WelcomeBanner
        accent="agent"
        eyebrow="Centre d'examen"
        title={centre.nom}
        subtitle={`${centre.region}${centre.ville ? ` · ${centre.ville}` : ""}`}
        icon={MapPin}
        trailing={
          <div className="rounded-lg border border-white/15 bg-white/10 px-5 py-4 text-center lg:min-w-56">
            <p className="text-xs uppercase tracking-wide text-white/70">
              Retraits confirmés aujourd&apos;hui
            </p>
            <p className="mt-2 text-3xl font-bold">
              {confirmedToday}/{todayAppointments.length}
            </p>
          </div>
        }
      />

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
