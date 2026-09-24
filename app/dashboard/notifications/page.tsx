import { requireRole } from "@/lib/auth";
import { resolveDocumentRoute } from "@/lib/document-routing";
import { markNotificationsAsRead } from "@/lib/notification-service";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StudentNotificationsView } from "@/components/dashboard/student-notifications-view";

export default async function NotificationsPage() {
  const user = await requireRole("ELEVE", "/dashboard/notifications");
  await markNotificationsAsRead(user.id);

  const [notifications, appointmentDocuments] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { dateEnvoi: "desc" },
      take: 100,
    }),
    prisma.documentAcademique.findMany({
      where: {
        eleveId: user.id,
        statut: "DISPONIBLE",
        typeDocument: "ORIGINAL",
      },
      orderBy: { updatedAt: "desc" },
      select: {
        diplomeType: true,
        typeDocument: true,
        centreExamen: true,
        regionComposition: true,
      },
    }),
  ]);
  const appointmentDocument = appointmentDocuments.find(
    (document) => resolveDocumentRoute(document).requiresAppointment,
  );
  const appointmentUrl = appointmentDocument
    ? `/dashboard/documents?exam=${appointmentDocument.diplomeType}&type=ORIGINAL`
    : null;

  return (
    <DashboardShell
      role="ELEVE"
      userId={user.id}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      activePath="/dashboard/notifications"
      titleKey="dashboard.studentNotificationsTitle"
      subtitleKey="dashboard.studentNotificationsSubtitle"
    >
      <StudentNotificationsView
        appointmentUrl={appointmentUrl}
        notifications={notifications.map((notification) => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          typeNotification: notification.typeNotification,
          statut: notification.statut,
          dateEnvoi: notification.dateEnvoi.toISOString(),
          actionUrl: notification.actionUrl,
        }))}
      />
    </DashboardShell>
  );
}
