"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Role } from "@/lib/generated/prisma/client";
import { getNavSections } from "@/components/dashboard/nav-data";
import { useSidebarContext } from "@/components/dashboard/sidebar-context";

export function DashboardSidebar({
  role,
  organismeId,
  userName,
  userMatricule,
  scopeLabel,
  activePath,
}: {
  role: Role;
  organismeId?: string | null;
  userName?: string;
  userMatricule?: string;
  scopeLabel?: string;
  activePath: string;
}) {
  const { isOpen, isMobile, setIsOpen, toggleSidebar } = useSidebarContext();
  const sections = getNavSections(role, organismeId);
  const fallbackName =
    role === "ADMINISTRATEUR"
      ? "Administrateur"
      : role === "AGENT_CENTRE_EXAMEN"
        ? "Agent centre"
        : "Élève";
  const badgeLabel =
    role === "ADMINISTRATEUR"
      ? (scopeLabel ?? "Administration")
      : role === "AGENT_CENTRE_EXAMEN"
        ? (scopeLabel ?? "Centre d'examen")
        : "Espace élève";

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
          "fixed inset-y-0 left-0 z-50 border-r border-slate-200 bg-white transition-all lg:static lg:z-auto lg:translate-x-0",
          isOpen ? "w-72" : "w-20",
          isOpen ? "translate-x-0" : "-translate-x-full",
          !isMobile && !isOpen ? "translate-x-0" : "",
        )}
      >
        <div className="flex h-full flex-col px-3 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex min-w-0 items-center gap-3 px-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F2D52] text-sm font-bold text-white">
                DR
              </span>
              {isOpen ? (
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-950">DR-DOCSCOL</span>
                  <span className="block text-xs text-slate-500">Documents scolaires</span>
                </span>
              ) : null}
            </Link>
            {isMobile ? (
              <button
                type="button"
                onClick={toggleSidebar}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600"
                aria-label="Fermer le menu"
              >
                Fermer
              </button>
            ) : null}
          </div>

          <div
            className={cn(
              "mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3",
              isOpen ? "block" : "hidden",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0F2D52] ring-1 ring-slate-200">
                {role === "ADMINISTRATEUR" ? (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                ) : role === "AGENT_CENTRE_EXAMEN" ? (
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <GraduationCap className="h-4 w-4" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {userName ?? fallbackName}
                </p>
                {userMatricule ? (
                  <p className="mt-1 truncate font-mono text-xs text-slate-500">{userMatricule}</p>
                ) : null}
                <p className="mt-2 inline-flex rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-900">
                  {badgeLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex-1 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.label} className="mb-7">
                {isOpen ? (
                  <p className="mb-3 px-3 text-xs font-semibold uppercase text-slate-400">
                    {section.label}
                  </p>
                ) : null}
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      activePath === item.url || activePath.startsWith(`${item.url}/`);

                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        onClick={() => isMobile && setIsOpen(false)}
                        className={cn(
                          "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                          isOpen ? "justify-start" : "justify-center",
                          isActive
                            ? "bg-blue-50 text-blue-900"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                        )}
                        aria-current={isActive ? "page" : undefined}
                        title={!isOpen ? item.title : undefined}
                      >
                        <Icon className="h-4 w-4" />
                        {isOpen ? item.title : null}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {!isMobile ? (
            <button
              type="button"
              onClick={toggleSidebar}
              className="mt-auto flex h-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label={isOpen ? "Reduire le menu" : "Etendre le menu"}
            >
              {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : null}
        </div>
      </aside>
    </>
  );
}
