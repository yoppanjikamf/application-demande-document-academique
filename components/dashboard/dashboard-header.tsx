"use client";

import type { Role } from "@/lib/generated/prisma/client";
import { Menu } from "lucide-react";

import { useSidebarContext } from "@/components/dashboard/sidebar-context";
import { Button } from "@/components/ui/button";

export function DashboardHeader({
  role,
  title,
  subtitle,
}: {
  role: Role;
  title: string;
  subtitle: string;
}) {
  const { toggleSidebar } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="flex flex-wrap items-start gap-4 px-4 py-4 lg:px-6">
        <Button type="button" variant="outline" size="icon" className="lg:hidden" onClick={toggleSidebar}>
          <Menu className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {role === "ADMINISTRATEUR" ? "Tableau de bord admin" : "Tableau de bord eleve"}
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <form action="/logout" method="post" className="ml-auto">
          <Button type="submit" variant="outline">
            Deconnexion
          </Button>
        </form>
      </div>
    </header>
  );
}
