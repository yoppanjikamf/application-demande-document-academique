// Structure responsive commune aux espaces élève et administrateur.
import type { ReactNode } from "react";

import { getUnreadNotificationCount } from "@/lib/notification-service";
import type { Role } from "@/lib/generated/prisma/client";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export async function DashboardShell({
  role,
  organismeId,
  userId,
  userName,
  userMatricule,
  title,
  subtitle,
  scopeLabel,
  activePath,
  children,
}: {
  role: Role;
  organismeId?: string | null;
  userId?: string;
  userName?: string;
  userMatricule?: string;
  title: string;
  subtitle: string;
  scopeLabel?: string;
  activePath: string;
  children: ReactNode;
}) {
  const unreadNotificationCount =
    role === "ELEVE" && userId ? await getUnreadNotificationCount(userId) : 0;

  return (
    <div className="min-h-screen bg-surface-1 text-text-1">
      <div className="flex min-h-screen">
        <DashboardSidebar
          role={role}
          organismeId={organismeId}
          userName={userName}
          userMatricule={userMatricule}
          scopeLabel={scopeLabel}
          activePath={activePath}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            role={role}
            userName={userName}
            title={title}
            subtitle={subtitle}
            scopeLabel={scopeLabel}
            activePath={activePath}
            unreadNotificationCount={unreadNotificationCount}
          />
          <main className="min-h-[calc(100vh-64px)] flex-1 bg-surface-1 px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
