import Link from "next/link";
import { CalendarDays, CheckCircle2, ClipboardList, MapPin } from "lucide-react";

import { getAgentCentreExamen, getCentreExamenAppointmentWhere } from "@/lib/centre-examen-service";
import { getDocumentTitle } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import type { Prisma, StatutRendezVous } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ConfirmWithdrawalButton } from "@/components/centre-examen/confirm-withdrawal-button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge, appointmentTone } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";

type CentreExamenPageProps = {
  searchParams?: Promise<{
    slot?: string;
  }>;
};

function buildSlotHref(slot?: string) {
  return slot ? `/centre-examen?slot=${encodeURIComponent(slot)}` : "/centre-examen";
}

export default async function CentreExamenPage({ searchParams }: CentreExamenPageProps) {
  const user = await requireRole("AGENT_CENTRE_EXAMEN", "/centre-examen");
  const params = await searchParams;
  const slot = params?.slot?.trim();
  const centre = await getAgentCentreExamen(user);
  const todayBaseWhere = getCentreExamenAppointmentWhere(centre.region, "today");
  const todayStatuses: StatutRendezVous[] = ["PLANIFIE", "CONFIRME", "HONORE"];
  const todayWhere: Prisma.RendezVousWhereInput = {
    ...todayBaseWhere,
    statut: { in: todayStatuses },
  };

  const [todayAppointments, listedAppointments, confirmedToday] = await Promise.all([
    prisma.rendezVous.findMany({
      where: todayWhere,
      orderBy: [{ heureRdv: "asc" }],
      include: {
        eleve: { select: { nom: true, prenom: true, matricule: true } },
        document: { select: { diplomeType: true, typeDocument: true, centreExamen: true } },
      },
    }),
    prisma.rendezVous.findMany({
      where: {
        ...todayWhere,
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

  const slots = Array.from(new Set(todayAppointments.map((appointment) => appointment.heureRdv)));

  return (
    <DashboardShell
      role="AGENT_CENTRE_EXAMEN"
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      scopeLabel={centre.nom}
      activePath="/centre-examen"
      title="Rendez-vous du centre"
      subtitle="Confirmation des retraits physiques du jour."
    >
      <section className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Centre d&apos;examen</p>
          <h2 className="mt-2 text-2xl font-bold text-[#111827]">{centre.nom}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-[#6B7280]">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {centre.region}
            {centre.ville ? ` · ${centre.ville}` : ""}
          </p>
        </div>
        <div className="rounded-2xl border border-[#B7E4C7] bg-[#D8F3DC] p-5 shadow-sm lg:min-w-72">
          <p className="text-sm font-medium text-[#1B4332]">Retraits confirmés aujourd&apos;hui</p>
          <p className="mt-2 text-3xl font-bold text-[#1B4332]">
            {confirmedToday}/{todayAppointments.length}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-[#111827]">Filtrer par créneau horaire</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Rendez-vous planifiés pour aujourd&apos;hui.
            </p>
          </div>
          <Button asChild size="sm" variant={!slot ? "default" : "outline"}>
            <Link href={buildSlotHref()}>Tous</Link>
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {slots.map((slotItem) => (
            <Button
              key={slotItem}
              asChild
              size="sm"
              variant={slot === slotItem ? "default" : "outline"}
            >
              <Link href={buildSlotHref(slotItem)}>{slotItem}</Link>
            </Button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_auto] border-b border-[#E5E7EB] bg-[#F8F9FA] px-5 py-3 text-sm font-medium text-[#6B7280]">
          <span>Rendez-vous planifiés</span>
          <span>Action</span>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {listedAppointments.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-[#9CA3AF]" aria-hidden="true" />
              <p className="mt-3 text-sm text-[#6B7280]">Aucun rendez-vous sur ce créneau.</p>
            </div>
          ) : (
            listedAppointments.map((appointment) => {
              const documentTitle = appointment.document
                ? getDocumentTitle(appointment.document)
                : "Document académique";
              const isRetired = appointment.statut === "HONORE";

              return (
                <div
                  key={appointment.id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#111827]">
                        {appointment.eleve.nom} {appointment.eleve.prenom}
                      </p>
                      <span className="rounded-full bg-[#F8F9FA] px-2 py-1 font-mono text-xs text-[#6B7280]">
                        {appointment.eleve.matricule}
                      </span>
                      <StatusBadge tone={appointmentTone(appointment.statut)}>
                        {appointment.statut}
                      </StatusBadge>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-[#6B7280] sm:grid-cols-2 xl:grid-cols-4">
                      <span className="inline-flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-[#52B788]" aria-hidden="true" />
                        {documentTitle}
                      </span>
                      <span>{appointment.document?.centreExamen ?? centre.nom}</span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#52B788]" aria-hidden="true" />
                        {appointment.dateRdv.toLocaleDateString("fr-FR")}
                      </span>
                      <span>{appointment.heureRdv}</span>
                    </div>
                    {appointment.retraitConfirmeAt ? (
                      <p className="mt-2 inline-flex items-center gap-2 text-sm text-[#16A34A]">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Retiré le {appointment.retraitConfirmeAt.toLocaleString("fr-FR")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex justify-start lg:justify-end">
                    {isRetired ? (
                      <StatusBadge status="RETIRE" />
                    ) : (
                      <ConfirmWithdrawalButton appointmentId={appointment.id} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
