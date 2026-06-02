import { cancelAppointmentAction, confirmAppointmentAction } from "@/app/admin/actions";
import { getDocumentTitle } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope, getAdminScopeLabel, ORGANISME_IDS } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
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
      subtitle="Rendez-vous actifs à confirmer ou à annuler dans DR-DOCSCOL."
    >
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_auto] border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500">
          <span>Rendez-vous</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-slate-100">
          {appointments.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">Aucun rendez-vous actif.</p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-950">
                      {appointment.document
                        ? getDocumentTitle(appointment.document)
                        : "Document scolaire"}
                    </p>
                    <StatusBadge tone={appointmentTone(appointment.statut)}>
                      {appointment.statut}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {appointment.dateRdv.toLocaleDateString("fr-FR")} · {appointment.heureRdv} ·{" "}
                    {appointment.lieu}
                  </p>
                  <p className="text-sm text-slate-500">
                    {appointment.eleve.prenom} {appointment.eleve.nom} ·{" "}
                    {appointment.eleve.matricule}
                  </p>
                  {appointment.document ? (
                    <p className="text-sm text-slate-500">
                      {appointment.document.organisme?.nom ?? "Organisme non defini"}
                      {appointment.document.antenneRegionale
                        ? ` · ${appointment.document.antenneRegionale.nom}`
                        : ""}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {appointment.statut === "PLANIFIE" ? (
                    <form action={confirmAppointmentAction}>
                      <input type="hidden" name="rendezVousId" value={appointment.id} />
                      <Button type="submit" size="sm">
                        Confirmer
                      </Button>
                    </form>
                  ) : null}
                  <form action={cancelAppointmentAction}>
                    <input type="hidden" name="rendezVousId" value={appointment.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Annuler
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
