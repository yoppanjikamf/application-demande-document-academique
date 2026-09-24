import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StudentHomeView } from "@/components/dashboard/student-home-view";

export default async function DashboardPage() {
  const user = await requireRole("ELEVE", "/dashboard");
  const [documents, nextRendezVous, notifications, paymentCount] = await Promise.all([
    prisma.documentAcademique.findMany({
      where: { eleveId: user.id },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.rendezVous.findFirst({
      where: { eleveId: user.id, statut: { in: ["PLANIFIE", "CONFIRME"] } },
      orderBy: [{ dateRdv: "asc" }, { heureRdv: "asc" }],
      include: { document: true },
    }),
    prisma.notification.findMany({
      where: { userId: user.id, deletedAt: null },
      take: 3,
      orderBy: { dateEnvoi: "desc" },
    }),
    prisma.paiement.count({
      where: {
        OR: [{ duplicata: { eleveId: user.id } }, { documentAcademique: { eleveId: user.id } }],
      },
    }),
  ]);

  return (
    <DashboardShell
      role="ELEVE"
      userId={user.id}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      activePath="/dashboard"
      titleKey="dashboard.studentHomeTitle"
      subtitleKey="dashboard.studentHomeSubtitle"
      subtitleVars={{ matricule: user.matricule }}
    >
      <StudentHomeView
        userName={`${user.prenom} ${user.nom}`}
        matricule={user.matricule}
        documents={documents.map((document) => ({
          typeDocument: document.typeDocument,
          diplomeType: document.diplomeType,
          statut: document.statut,
          requested: Boolean(document.demandeSoumiseAt),
        }))}
        nextAppointment={
          nextRendezVous
            ? {
                diplomeType: nextRendezVous.document?.diplomeType ?? null,
                typeDocument: nextRendezVous.document?.typeDocument ?? null,
                dateRdv: nextRendezVous.dateRdv.toISOString(),
                heureRdv: nextRendezVous.heureRdv,
                lieu: nextRendezVous.lieu,
                statut: nextRendezVous.statut,
              }
            : null
        }
        notifications={notifications.map((notification) => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
        }))}
        paymentCount={paymentCount}
      />
    </DashboardShell>
  );
}
