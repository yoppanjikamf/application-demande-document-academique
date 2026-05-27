import type { ReactNode } from "react";

import type { Role } from "@/lib/generated/prisma/client";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export function DashboardShell({
  role,
  userName,
  title,
  subtitle,
  activePath,
  children,
}: {
  role: Role;
  userName?: string;
  title: string;
  subtitle: string;
  activePath: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <DashboardSidebar role={role} activePath={activePath} />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader role={role} userName={userName} title={title} subtitle={subtitle} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
