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
import { ORGANISME_IDS } from "@/lib/document-routing";

export type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

const obcAdminSections: NavSection[] = [
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

const deccAdminSections: NavSection[] = [
  {
    label: "Administration DECC",
    items: [
      { title: "Vue d'ensemble", url: "/admin", icon: LayoutDashboard },
      { title: "Élèves", url: "/admin/students", icon: UsersRound },
      { title: "Documents BEPC", url: "/admin/documents", icon: FolderCheck },
      { title: "Paiements", url: "/admin/payments", icon: CreditCard },
      { title: "Audit logs", url: "/admin/audit-logs", icon: ScrollText },
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

export function getNavSections(role: Role, organismeId?: string | null) {
  if (role !== "ADMINISTRATEUR") {
    return eleveSections;
  }

  return organismeId === ORGANISME_IDS.DECC ? deccAdminSections : obcAdminSections;
}
