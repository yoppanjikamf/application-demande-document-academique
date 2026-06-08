"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Role } from "@/lib/generated/prisma/client";
import { getNavSections } from "@/components/dashboard/nav-data";
import { useSidebarContext } from "@/components/dashboard/sidebar-context";
import { DocScolLogo } from "@/components/ui/DocScolLogo";
import { Button } from "@/components/ui/button";

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
          "fixed inset-y-0 left-0 z-50 h-screen bg-obc-800 text-white shadow-modal transition-all lg:relative lg:z-auto lg:h-full lg:shrink-0 lg:translate-x-0 lg:shadow-none",
          isOpen ? "w-[260px]" : "w-[72px]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          !isMobile && !isOpen ? "translate-x-0" : "",
        )}
      >
        <div className="flex h-full flex-col px-3 py-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex min-w-0 items-center gap-3 px-2">
              <DocScolLogo variant={isOpen ? "full" : "icon"} theme="dark" />
            </Link>
            {isMobile ? (
              <button
                type="button"
                onClick={toggleSidebar}
                className="rounded-md border border-white/15 px-2 py-1 text-xs font-semibold text-white/75"
                aria-label="Fermer le menu"
              >
                Fermer
              </button>
            ) : null}
          </div>

          <div className={cn("mt-4 border-y border-white/10 py-4", isOpen ? "block" : "hidden")}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-gold-300 ring-1 ring-white/15">
                {role === "ADMINISTRATEUR" ? (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                ) : role === "AGENT_CENTRE_EXAMEN" ? (
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <GraduationCap className="h-4 w-4" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {userName ?? fallbackName}
                </p>
                {userMatricule ? (
                  <p className="mt-1 truncate font-mono text-xs text-white/55">{userMatricule}</p>
                ) : null}
                <p className="mt-2 inline-flex rounded-full bg-gold-400 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-obc-900">
                  {badgeLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex-1 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.label} className="mb-7">
                {isOpen ? (
                  <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
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
                          "flex h-11 items-center gap-3 border-l-[3px] px-3 text-sm font-semibold transition-[var(--transition-base)]",
                          isOpen ? "justify-start" : "justify-center",
                          isActive
                            ? "bg-white/12 border-gold-400 text-white"
                            : "hover:bg-white/7 border-transparent text-white/70 hover:text-white",
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

          <form
            action="/logout"
            method="post"
            className={cn("mb-3 mt-4", isOpen ? "block" : "hidden")}
          >
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-white/75 hover:bg-red-500/10 hover:text-red-100"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Déconnexion
            </Button>
          </form>

          {!isMobile ? (
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-10 items-center justify-center rounded-md border border-white/15 text-white/70 hover:bg-white/10 hover:text-white"
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
