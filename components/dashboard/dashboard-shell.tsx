import type { ReactNode } from "react";

import type { Role } from "@/lib/generated/prisma/client";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export function DashboardShell({
  role,
  title,
  subtitle,
  activePath,
  children,
}: {
  role: Role;
  title: string;
  subtitle: string;
  activePath: string;
  children: ReactNode;
}) {
  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
      <div className="flex min-h-[calc(100vh-3.5rem)] bg-muted/40">
        <DashboardSidebar role={role} activePath={activePath} />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader role={role} title={title} subtitle={subtitle} />
          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
