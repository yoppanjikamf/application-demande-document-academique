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

export type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

const adminSections: NavSection[] = [
  {
    label: "Administration",
    items: [
      { title: "Vue d'ensemble", url: "/admin", icon: LayoutDashboard },
      { title: "Documents", url: "/admin/documents", icon: FolderCheck },
      { title: "Disponibilites", url: "/admin/rdv-disponibilites", icon: CalendarDays },
      { title: "Import CSV", url: "/admin/import", icon: Import },
      { title: "Compte", url: "/account", icon: UserRound },
    ],
  },
];

const eleveSections: NavSection[] = [
  {
    label: "Espace eleve",
    items: [
      { title: "Accueil", url: "/dashboard", icon: Home },
      { title: "Documents", url: "/dashboard/documents", icon: FileText },
      { title: "Rendez-vous", url: "/dashboard/rendez-vous", icon: CalendarDays },
      { title: "Compte", url: "/account", icon: UserRound },
    ],
  },
];

export function getNavSections(role: Role) {
  return role === "ADMINISTRATEUR" ? adminSections : eleveSections;
}
