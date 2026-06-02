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
          "fixed inset-y-0 left-0 z-50 border-r border-[#E5E7EB] bg-white transition-all lg:static lg:z-auto lg:translate-x-0",
          isOpen ? "w-60" : "w-20",
          isOpen ? "translate-x-0" : "-translate-x-full",
          !isMobile && !isOpen ? "translate-x-0" : "",
        )}
      >
        <div className="flex h-full flex-col px-3 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex min-w-0 items-center gap-3 px-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B4332] text-sm font-bold text-white shadow-sm">
                OD
              </span>
              {isOpen ? (
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#1B4332]">OBC/DECC</span>
                  <span className="block text-xs text-[#6B7280]">Retraits académiques</span>
                </span>
              ) : null}
            </Link>
            {isMobile ? (
              <button
                type="button"
                onClick={toggleSidebar}
                className="rounded-xl border border-[#E5E7EB] px-2 py-1 text-xs font-medium text-[#4B5563]"
                aria-label="Fermer le menu"
              >
                Fermer
              </button>
            ) : null}
          </div>

          <div
            className={cn(
              "mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-3",
              isOpen ? "block" : "hidden",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1B4332] ring-1 ring-[#E5E7EB]">
                {role === "ADMINISTRATEUR" ? (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                ) : role === "AGENT_CENTRE_EXAMEN" ? (
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <GraduationCap className="h-4 w-4" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111827]">
                  {userName ?? fallbackName}
                </p>
                {userMatricule ? (
                  <p className="mt-1 truncate font-mono text-xs text-[#6B7280]">{userMatricule}</p>
                ) : null}
                <p className="mt-2 inline-flex rounded-full border border-[#B7E4C7] bg-[#D8F3DC] px-2 py-1 text-xs font-medium text-[#1B4332]">
                  {badgeLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex-1 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.label} className="mb-7">
                {isOpen ? (
                  <p className="mb-3 px-3 text-xs font-semibold uppercase text-[#6B7280]">
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
                          "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                          isOpen ? "justify-start" : "justify-center",
                          isActive
                            ? "bg-[#1B4332] text-white shadow-sm"
                            : "text-[#4B5563] hover:bg-[#D8F3DC]/60 hover:text-[#1B4332]",
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

          <div
            className={cn(
              "mb-3 mt-4 rounded-xl border border-[#E5E7EB] bg-white p-3",
              isOpen ? "block" : "hidden",
            )}
          >
            <p className="truncate text-sm font-semibold text-[#111827]">
              {userName ?? fallbackName}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">Session active</p>
          </div>

          {!isMobile ? (
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F8F9FA]"
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
