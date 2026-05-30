import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { resolveDocumentRoute } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";

export default async function NotificationsPage() {
  const user = await requireRole("ELEVE", "/dashboard/notifications");
  const [notifications, appointmentDocuments] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
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
  const appointmentDocument = appointmentDocuments.find((document) => resolveDocumentRoute(document).requiresAppointment);
  const appointmentUrl = appointmentDocument
    ? `/dashboard/documents?exam=${appointmentDocument.diplomeType}&type=ORIGINAL`
    : null;

  return (
    <DashboardShell
      role="ELEVE"
      userName={`${user.prenom} ${user.nom}`}
      activePath="/dashboard/notifications"
      title="Notifications"
      subtitle="Messages de disponibilité, confirmations et rappels liés à vos documents."
    >
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">Aucune notification.</p>
          ) : (
            notifications.map((notification) => {
              const canScheduleAppointment =
                notification.typeNotification === "DOCUMENT_DISPONIBLE" &&
                appointmentUrl &&
                notification.message.toLowerCase().includes("rendez-vous");

              return (
                <div key={notification.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <StatusBadge tone={notification.statut === "LUE" ? "blue" : "amber"}>
                      {notification.typeNotification}
                    </StatusBadge>
                    <span className="text-sm text-slate-500">
                      {notification.dateEnvoi.toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{notification.message}</p>
                  {canScheduleAppointment ? (
                    <Button asChild size="sm" className="mt-4">
                      <Link href={appointmentUrl}>
                        <CalendarDays className="h-4 w-4" />
                        Programmer le rendez-vous
                      </Link>
                    </Button>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
