// Structure responsive commune aux espaces élève et administrateur.
import type { ReactNode } from "react";

import type { Role } from "@/lib/generated/prisma/client";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export function DashboardShell({
  role,
  organismeId,
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
  userName?: string;
  userMatricule?: string;
  title: string;
  subtitle: string;
  scopeLabel?: string;
  activePath: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
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
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
