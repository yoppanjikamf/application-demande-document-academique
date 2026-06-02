"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const breadcrumbItems = getBreadcrumbItems(activePath);
  const areaLabel =
    role === "ADMINISTRATEUR"
      ? "Back-office"
      : role === "AGENT_CENTRE_EXAMEN"
        ? "Espace agent"
        : "Espace élève";

  function handleAdminSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();

    router.push(query ? `/admin/students?q=${encodeURIComponent(query)}` : "/admin/students");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="flex min-h-16 flex-wrap items-center gap-4 px-4 py-3 lg:px-6">
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
            className="mb-1 flex items-center gap-1 text-xs font-medium text-[#6B7280]"
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
          <h1 className="text-xl font-semibold tracking-normal text-[#111827] sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
          {scopeLabel ? (
            <p className="mt-2 inline-flex rounded-full border border-[#B7E4C7] bg-[#D8F3DC] px-3 py-1 text-xs font-medium text-[#1B4332]">
              Périmètre: {scopeLabel}
            </p>
          ) : null}
        </div>

        {role === "ADMINISTRATEUR" ? (
          <form
            onSubmit={handleAdminSearch}
            className="hidden min-w-[320px] items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-3 py-2 text-sm text-[#6B7280] xl:flex"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <input
              name="q"
              type="search"
              placeholder="Rechercher matricule, nom, prénom"
              className="min-w-0 flex-1 bg-transparent text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            />
            <button type="submit" className="text-xs font-semibold text-[#1B4332]">
              Rechercher
            </button>
          </form>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative hidden sm:inline-flex"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#DC2626]" />
          <span className="sr-only">Notifications</span>
        </Button>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B4332] text-sm font-semibold text-white">
            {(userName ?? "OBC/DECC")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((item) => item[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="max-w-36 truncate text-sm font-medium text-[#111827]">{userName}</div>
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
