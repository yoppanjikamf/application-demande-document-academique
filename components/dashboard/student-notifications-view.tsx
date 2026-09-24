"use client";

import Link from "next/link";
import { CalendarDays, Trash2 } from "lucide-react";

import {
  deleteAllNotificationsAction,
  deleteNotificationAction,
} from "@/app/dashboard/notifications/actions";
import { DashboardListPanel } from "@/components/dashboard/dashboard-list-panel";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useI18n } from "@/components/i18n/locale-provider";
import { LocaleDate } from "@/components/i18n/ui";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  id: string;
  title: string | null;
  message: string;
  typeNotification: string;
  statut: string;
  dateEnvoi: string;
  actionUrl: string | null;
};

export function StudentNotificationsView({
  notifications,
  appointmentUrl,
}: {
  notifications: NotificationItem[];
  appointmentUrl: string | null;
}) {
  const { t } = useI18n();

  return (
    <DashboardListPanel>
      <div className="flex flex-col gap-3 border-b border-[var(--border-token)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="font-semibold text-text-1">{t("dashboard.inbox.title")}</h2>
          <p className="mt-1 text-sm text-text-3">
            {t(
              notifications.length > 1 ? "dashboard.inbox.countPlural" : "dashboard.inbox.count",
              { count: notifications.length },
            )}
          </p>
        </div>
        {notifications.length > 0 ? (
          <form action={deleteAllNotificationsAction}>
            <Button type="submit" variant="outline" size="sm">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t("dashboard.inbox.deleteAll")}
            </Button>
          </form>
        ) : null}
      </div>
      <div className="divide-y divide-[#E8EEF6]">
        {notifications.length === 0 ? (
          <p className="px-5 py-6 text-sm text-text-3">{t("dashboard.inbox.empty")}</p>
        ) : (
          notifications.map((notification) => {
            const canScheduleAppointment =
              notification.typeNotification === "DOCUMENT_DISPONIBLE" &&
              appointmentUrl &&
              notification.message.toLowerCase().includes("rendez-vous");

            return (
              <div key={notification.id} className="px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={notification.statut === "LUE" ? "blue" : "amber"}>
                      {notification.typeNotification}
                    </StatusBadge>
                    {notification.title ? (
                      <h3 className="font-semibold text-text-1">{notification.title}</h3>
                    ) : null}
                  </div>
                  <span className="text-sm text-text-3">
                    <LocaleDate value={notification.dateEnvoi} />
                  </span>
                </div>
                <p className="mt-3 break-words whitespace-pre-line text-sm leading-6 text-text-3">
                  {notification.message}
                </p>
                {canScheduleAppointment ? (
                  <Button asChild size="sm" className="mt-4">
                    <Link href={appointmentUrl}>
                      <CalendarDays className="h-4 w-4" />
                      {t("dashboard.inbox.schedule")}
                    </Link>
                  </Button>
                ) : null}
                {!canScheduleAppointment && notification.actionUrl ? (
                  <Button asChild size="sm" variant="outline" className="mt-4">
                    <Link href={notification.actionUrl}>{t("dashboard.inbox.open")}</Link>
                  </Button>
                ) : null}
                <form action={deleteNotificationAction} className="mt-4">
                  <input type="hidden" name="notificationId" value={notification.id} />
                  <Button type="submit" size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {t("dashboard.inbox.delete")}
                  </Button>
                </form>
              </div>
            );
          })
        )}
      </div>
    </DashboardListPanel>
  );
}
