import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default async function NotificationsPage() {
  const user = await requireRole("ELEVE", "/dashboard/notifications");
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { dateEnvoi: "desc" },
    take: 100,
  });

  return (
    <DashboardShell
      role="ELEVE"
      userName={`${user.prenom} ${user.nom}`}
      activePath="/dashboard/notifications"
      title="Notifications"
      subtitle="Messages de disponibilite, confirmations et rappels lies a vos documents."
    >
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">Aucune notification.</p>
          ) : (
            notifications.map((notification) => (
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
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
