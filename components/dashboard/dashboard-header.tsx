"use client";

import type { Role } from "@/lib/generated/prisma/client";
import { Bell, Menu, Search } from "lucide-react";

import { useSidebarContext } from "@/components/dashboard/sidebar-context";
import { Button } from "@/components/ui/button";

export function DashboardHeader({
  role,
  userName,
  title,
  subtitle,
}: {
  role: Role;
  userName?: string;
  title: string;
  subtitle: string;
}) {
  const { toggleSidebar } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex flex-wrap items-center gap-4 px-4 py-4 lg:px-6">
        <Button type="button" variant="outline" size="icon" className="lg:hidden" onClick={toggleSidebar}>
          <Menu className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase text-slate-500">
            {role === "ADMINISTRATEUR" ? "Back-office OBC" : "Espace eleve"}
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="hidden min-w-[260px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 xl:flex">
          <Search className="h-4 w-4" />
          <span>Rechercher un document, matricule...</span>
        </div>

        <Button type="button" variant="outline" size="icon" className="hidden sm:inline-flex">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
            {(userName ?? "OBC")
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
            Deconnexion
          </Button>
        </form>
      </div>
    </header>
  );
}
