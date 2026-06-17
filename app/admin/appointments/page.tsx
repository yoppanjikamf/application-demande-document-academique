import { cancelAppointmentAction } from "@/app/admin/actions";
import { getDocumentTitle } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope, getAdminScopeLabel, ORGANISME_IDS } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DashboardListPanel,
  DashboardListPanelHeader,
} from "@/components/dashboard/dashboard-list-panel";
import { StatusBadge, appointmentTone } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function AdminAppointmentsPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin/appointments");
  if (user.organismeId === ORGANISME_IDS.DECC) {
    redirect("/admin");
  }
  const scopeLabel = getAdminScopeLabel(user);
  const appointments = await prisma.rendezVous.findMany({
    where: {
      statut: { in: ["PLANIFIE", "CONFIRME"] },
      document: { is: getAdminDocumentScope(user) },
    },
    orderBy: [{ dateRdv: "asc" }, { heureRdv: "asc" }],
    take: 100,
    include: {
      eleve: true,
      document: { include: { organisme: true, antenneRegionale: true } },
    },
  });

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      organismeId={user.organismeId}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      scopeLabel={scopeLabel}
      activePath="/admin/appointments"
      title="Planning des retraits"
      subtitle="Rendez-vous de retrait à suivre, confirmer ou annuler pour votre périmètre OBC/DECC."
    >
      <DashboardListPanel>
        <DashboardListPanelHeader left="Rendez-vous" right="Actions" />
        <div className="divide-y divide-[#E8EEF6]">
          {appointments.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-3 sm:px-5">Aucun rendez-vous actif.</p>
          ) : (
            appointments.map((appointment) => (
              <article
                key={appointment.id}
                className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words font-medium text-text-1">
                      {appointment.document
                        ? getDocumentTitle(appointment.document)
                        : "Document scolaire"}
                    </p>
                    <StatusBadge tone={appointmentTone(appointment.statut)}>
                      {appointment.statut}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 break-words text-sm text-text-3">
                    {appointment.dateRdv.toLocaleDateString("fr-FR")} · {appointment.heureRdv} ·{" "}
                    {appointment.lieu}
                  </p>
                  <p className="break-words text-sm text-text-3">
                    {appointment.eleve.prenom} {appointment.eleve.nom} ·{" "}
                    {appointment.eleve.matricule}
                  </p>
                  {appointment.document ? (
                    <p className="break-words text-sm text-text-3">
                      {appointment.document.organisme?.nom ?? "Organisme non defini"}
                      {appointment.document.antenneRegionale
                        ? ` · ${appointment.document.antenneRegionale.nom}`
                        : ""}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={cancelAppointmentAction}>
                    <input type="hidden" name="rendezVousId" value={appointment.id} />
                    <Button type="submit" size="sm" variant="outline" className="w-full sm:w-auto">
                      Annuler
                    </Button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </DashboardListPanel>
    </DashboardShell>
  );
}
