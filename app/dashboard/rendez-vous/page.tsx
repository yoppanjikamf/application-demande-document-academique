import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StudentAppointmentsView } from "@/components/dashboard/student-appointments-view";

type RendezVousPageProps = {
  searchParams?: Promise<{ documentId?: string }>;
};

export default async function RendezVousPage({ searchParams }: RendezVousPageProps) {
  const user = await requireRole("ELEVE", "/dashboard/rendez-vous");
  const params = await searchParams;

  const rendezVous = await prisma.rendezVous.findMany({
    where: {
      eleveId: user.id,
      ...(params?.documentId ? { documentId: params.documentId } : {}),
    },
    orderBy: [{ dateRdv: "desc" }, { createdAt: "desc" }],
    include: {
      document: true,
      admin: true,
    },
  });

  return (
    <DashboardShell
      role="ELEVE"
      userId={user.id}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      activePath="/dashboard/rendez-vous"
      titleKey="dashboard.studentAppointmentsTitle"
      subtitleKey="dashboard.studentAppointmentsSubtitle"
    >
      <StudentAppointmentsView
        appointments={rendezVous.map((rdv) => ({
          id: rdv.id,
          dateRdv: rdv.dateRdv.toISOString(),
          heureRdv: rdv.heureRdv,
          lieu: rdv.lieu,
          commentaire: rdv.commentaire,
          statut: rdv.statut,
          diplomeType: rdv.document?.diplomeType ?? null,
          typeDocument: rdv.document?.typeDocument ?? null,
          agentName: `${rdv.admin.prenom} ${rdv.admin.nom}`,
        }))}
      />
    </DashboardShell>
  );
}
