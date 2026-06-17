import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DashboardListPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-[var(--border-token)] bg-surface-0 shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardListPanelHeader({
  left,
  right,
  className,
}: {
  left: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-token)] bg-surface-1 px-4 py-3 text-sm font-medium text-text-3 sm:px-5",
        className,
      )}
    >
      <span className="min-w-0">{left}</span>
      {right ? <span className="shrink-0">{right}</span> : null}
    </div>
  );
}

export function DashboardPaginationBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}
