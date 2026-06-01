import {
  CalendarDays,
  CreditCard,
  FileText,
  FolderCheck,
  Home,
  Import,
  LayoutDashboard,
  MessageSquareText,
  ScrollText,
  UsersRound,
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
      { title: "Élèves", url: "/admin/students", icon: UsersRound },
      { title: "Documents", url: "/admin/documents", icon: FolderCheck },
      { title: "Planning", url: "/admin/appointments", icon: CalendarDays },
      { title: "Paiements", url: "/admin/payments", icon: CreditCard },
      { title: "Audit logs", url: "/admin/audit-logs", icon: ScrollText },
      { title: "Disponibilités", url: "/admin/rdv-disponibilites", icon: CalendarDays },
      { title: "Import CSV", url: "/admin/import", icon: Import },
      { title: "Compte", url: "/account", icon: UserRound },
    ],
  },
];

const eleveSections: NavSection[] = [
  {
    label: "Espace élève",
    items: [
      { title: "Accueil", url: "/dashboard", icon: Home },
      { title: "Documents", url: "/dashboard/documents", icon: FileText },
      { title: "Rendez-vous", url: "/dashboard/rendez-vous", icon: CalendarDays },
      { title: "Paiements", url: "/dashboard/payments", icon: CreditCard },
      { title: "Notifications", url: "/dashboard/notifications", icon: MessageSquareText },
      { title: "Compte", url: "/account", icon: UserRound },
    ],
  },
];

export function getNavSections(role: Role) {
  return role === "ADMINISTRATEUR" ? adminSections : eleveSections;
}
