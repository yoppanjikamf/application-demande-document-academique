"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Role } from "@/lib/generated/prisma/client";
import { getNavSections } from "@/components/dashboard/nav-data";
import { useSidebarContext } from "@/components/dashboard/sidebar-context";

export function DashboardSidebar({
  role,
  activePath,
}: {
  role: Role;
  activePath: string;
}) {
  const { isOpen, isMobile, setIsOpen, toggleSidebar } = useSidebarContext();
  const sections = getNavSections(role);

  return (
    <>
      {isMobile && isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setIsOpen(false)}
          aria-label="Fermer le menu"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform lg:static lg:z-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              OBC Documents
            </Link>
            {isMobile ? (
              <button
                type="button"
                onClick={toggleSidebar}
                className="rounded-md border px-2 py-1 text-xs font-medium"
              >
                Fermer
              </button>
            ) : null}
          </div>

          <div className="mt-6 flex-1 overflow-y-auto pr-2">
            {sections.map((section) => (
              <div key={section.label} className="mb-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.label}
                </p>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePath === item.url;

                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        onClick={() => isMobile && setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
