import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarDays,
  FileText,
  FolderCheck,
  Home,
  Import,
  LayoutDashboard,
  UserRound,
} from "lucide-react";

import type { Role } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const adminItems: NavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/documents", label: "Documents", icon: FolderCheck },
  { href: "/admin/rdv-disponibilites", label: "Disponibilites", icon: CalendarDays },
  { href: "/admin/import", label: "Import CSV", icon: Import },
  { href: "/account", label: "Compte", icon: UserRound },
];

const eleveItems: NavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { href: "/account", label: "Compte", icon: UserRound },
];

export function DashboardShell({
  role,
  title,
  subtitle,
  activePath,
  children,
}: {
  role: Role;
  title: string;
  subtitle: string;
  activePath: string;
  children: ReactNode;
}) {
  const items = role === "ADMINISTRATEUR" ? adminItems : eleveItems;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-md border bg-card p-4 shadow-sm">
        <div className="border-b pb-4">
          <p className="text-sm text-muted-foreground">OBC</p>
          <p className="text-lg font-semibold tracking-tight">
            {role === "ADMINISTRATEUR" ? "Administration" : "Espace eleve"}
          </p>
        </div>
        <nav className="mt-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activePath === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="space-y-6">
        <header className="flex flex-col gap-3 rounded-md border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {role === "ADMINISTRATEUR" ? "Tableau de bord admin" : "Tableau de bord eleve"}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <form action="/logout" method="post">
            <button className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent">
              Deconnexion
            </button>
          </form>
        </header>

        {children}
      </div>
    </div>
  );
}
