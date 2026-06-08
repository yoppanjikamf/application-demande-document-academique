import Link from "next/link";
import { CalendarDays, Trash2 } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { resolveDocumentRoute } from "@/lib/document-routing";
import { markNotificationsAsRead } from "@/lib/notification-service";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  deleteAllNotificationsAction,
  deleteNotificationAction,
} from "@/app/dashboard/notifications/actions";

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
      title="Notifications"
      subtitle="Disponibilités, confirmations et rappels concernant vos documents scolaires."
    >
      <div className="overflow-hidden rounded-md border border-[var(--border-token)] bg-surface-0 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-token)] px-5 py-4">
          <div>
            <h2 className="font-semibold text-text-1">Boîte de notifications</h2>
            <p className="mt-1 text-sm text-text-3">
              {notifications.length} notification{notifications.length > 1 ? "s" : ""} visible
              {notifications.length > 1 ? "s" : ""}.
            </p>
          </div>
          {notifications.length > 0 ? (
            <form action={deleteAllNotificationsAction}>
              <Button type="submit" variant="outline" size="sm">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Tout supprimer
              </Button>
            </form>
          ) : null}
        </div>
        <div className="divide-y divide-[#E8EEF6]">
          {notifications.length === 0 ? (
            <p className="px-5 py-6 text-sm text-text-3">
              Vous êtes à jour : aucune notification pour le moment.
            </p>
          ) : (
            notifications.map((notification) => {
              const canScheduleAppointment =
                notification.typeNotification === "DOCUMENT_DISPONIBLE" &&
                appointmentUrl &&
                notification.message.toLowerCase().includes("rendez-vous");

              return (
                <div key={notification.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={notification.statut === "LUE" ? "blue" : "amber"}>
                        {notification.typeNotification}
                      </StatusBadge>
                      {notification.title ? (
                        <h3 className="font-semibold text-text-1">{notification.title}</h3>
                      ) : null}
                    </div>
                    <span className="text-sm text-text-3">
                      {notification.dateEnvoi.toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-text-3">
                    {notification.message}
                  </p>
                  {canScheduleAppointment ? (
                    <Button asChild size="sm" className="mt-4">
                      <Link href={appointmentUrl}>
                        <CalendarDays className="h-4 w-4" />
                        Programmer le rendez-vous
                      </Link>
                    </Button>
                  ) : null}
                  {!canScheduleAppointment && notification.actionUrl ? (
                    <Button asChild size="sm" variant="outline" className="mt-4">
                      <Link href={notification.actionUrl}>Ouvrir</Link>
                    </Button>
                  ) : null}
                  <form action={deleteNotificationAction} className="mt-4">
                    <input type="hidden" name="notificationId" value={notification.id} />
                    <Button type="submit" size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Supprimer
                    </Button>
                  </form>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
