"use client";

import type { Role } from "@/lib/generated/prisma/client";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";

import { useSidebarContext } from "@/components/dashboard/sidebar-context";
import { Button } from "@/components/ui/button";

const pathLabels: Record<string, string> = {
  admin: "Administration",
  dashboard: "Tableau de bord",
  documents: "Documents scolaires",
  students: "Élèves",
  appointments: "Rendez-vous",
  "rendez-vous": "Rendez-vous",
  payments: "Paiements",
  notifications: "Notifications",
  "rdv-disponibilites": "Disponibilités",
  import: "Import",
  "audit-logs": "Logs d'audit",
  account: "Compte",
  "centre-examen": "Centre d'examen",
};

function getBreadcrumbItems(activePath: string) {
  return activePath
    .split("/")
    .filter(Boolean)
    .map((segment) => pathLabels[segment] ?? segment);
}

export function DashboardHeader({
  role,
  userName,
  title,
  subtitle,
  scopeLabel,
  activePath,
}: {
  role: Role;
  userName?: string;
  title: string;
  subtitle: string;
  scopeLabel?: string;
  activePath: string;
}) {
  const { toggleSidebar } = useSidebarContext();
  const breadcrumbItems = getBreadcrumbItems(activePath);
  const areaLabel =
    role === "ADMINISTRATEUR"
      ? "Back-office"
      : role === "AGENT_CENTRE_EXAMEN"
        ? "Espace agent"
        : "Espace élève";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex flex-wrap items-center gap-4 px-4 py-4 lg:px-6">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>

        <div className="min-w-0 flex-1">
          <nav
            className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500"
            aria-label="Fil d'Ariane"
          >
            <span>{areaLabel}</span>
            {breadcrumbItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-1">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <span>{item}</span>
              </span>
            ))}
          </nav>
          <h1 className="text-xl font-semibold tracking-normal text-slate-950 sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          {scopeLabel ? (
            <p className="mt-2 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Périmètre: {scopeLabel}
            </p>
          ) : null}
        </div>

        <div className="hidden min-w-[260px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 xl:flex">
          <Search className="h-4 w-4" />
          <span>Rechercher un document scolaire, matricule...</span>
        </div>

        <Button type="button" variant="outline" size="icon" className="hidden sm:inline-flex">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
            {(userName ?? "DR-DOCSCOL")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((item) => item[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="max-w-36 truncate text-sm font-medium text-slate-700">{userName}</div>
        </div>

        <form action="/logout" method="post">
          <Button type="submit" variant="outline">
            Déconnexion
          </Button>
        </form>
      </div>
    </header>
  );
}
