import {
  BarChart3,
  CalendarDays,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  CreditCard,
  Bell,
  FileText,
  FolderOpen,
  HelpCircle,
  Receipt,
  Shield,
  Upload,
  LayoutDashboard,
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
    label: "Navigation",
    items: [
      { title: "Tableau de bord Admin", url: "/admin", icon: BarChart3 },
      { title: "Documents", url: "/admin/documents", icon: FileText },
      { title: "Étudiants", url: "/admin/students", icon: UsersRound },
      { title: "Paiements", url: "/admin/payments", icon: CreditCard },
      { title: "Rendez-vous", url: "/admin/appointments", icon: CalendarCheck },
      { title: "Disponibilités", url: "/admin/rdv-disponibilites", icon: Clock },
      { title: "Import CSV", url: "/admin/import", icon: Upload },
      { title: "Journaux d'audit", url: "/admin/audit-logs", icon: Shield },
    ],
  },
  {
    label: "Compte",
    items: [
      { title: "Mon Compte", url: "/account", icon: UserRound },
      { title: "Aide", url: "/", icon: HelpCircle },
    ],
  },
];

const deccAdminSections: NavSection[] = [
  {
    label: "Navigation",
    items: [
      { title: "Tableau de bord Admin", url: "/admin", icon: BarChart3 },
      { title: "Documents", url: "/admin/documents", icon: FileText },
      { title: "Étudiants", url: "/admin/students", icon: UsersRound },
      { title: "Paiements", url: "/admin/payments", icon: CreditCard },
      { title: "Import CSV", url: "/admin/import", icon: Upload },
      { title: "Journaux d'audit", url: "/admin/audit-logs", icon: Shield },
    ],
  },
  {
    label: "Compte",
    items: [
      { title: "Mon Compte", url: "/account", icon: UserRound },
      { title: "Aide", url: "/", icon: HelpCircle },
    ],
  },
];

const eleveSections: NavSection[] = [
  {
    label: "Navigation",
    items: [
      { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
      { title: "Mes Documents", url: "/dashboard/documents", icon: FolderOpen },
      { title: "Mes Rendez-vous", url: "/dashboard/rendez-vous", icon: CalendarDays },
      { title: "Paiements", url: "/dashboard/payments", icon: Receipt },
      { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
    ],
  },
  {
    label: "Compte",
    items: [
      { title: "Mon Compte", url: "/account", icon: UserRound },
      { title: "Aide", url: "/", icon: HelpCircle },
    ],
  },
];

const agentCentreSections: NavSection[] = [
  {
    label: "Navigation",
    items: [
      { title: "Retraits du jour", url: "/centre-examen", icon: ClipboardCheck },
    ],
  },
  {
    label: "Compte",
    items: [
      { title: "Mon Compte", url: "/account", icon: UserRound },
      { title: "Aide", url: "/", icon: HelpCircle },
    ],
  },
];

export function getNavSections(role: Role, organismeId?: string | null) {
  if (role === "AGENT_CENTRE_EXAMEN") {
    return agentCentreSections;
  }

  if (role !== "ADMINISTRATEUR") {
    return eleveSections;
  }

  return organismeId === ORGANISME_IDS.DECC ? deccAdminSections : obcAdminSections;
}
