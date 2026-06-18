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
  LayoutDashboard,
  UsersRound,
  UserRound,
} from "lucide-react";

import type { Role } from "@/lib/generated/prisma/client";
import { ORGANISME_IDS } from "@/lib/document-routing";
import type { Translator } from "@/lib/i18n/translate";

export type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

const obcAdminSections = (t: Translator): NavSection[] => [
  {
    label: t("dashboard.nav.navigation"),
    items: [
      { title: t("dashboard.nav.adminDashboard"), url: "/admin", icon: BarChart3 },
      { title: t("dashboard.nav.documents"), url: "/admin/documents", icon: FileText },
      { title: t("dashboard.nav.students"), url: "/admin/students", icon: UsersRound },
      { title: t("dashboard.nav.payments"), url: "/admin/payments", icon: CreditCard },
      { title: t("dashboard.nav.appointments"), url: "/admin/appointments", icon: CalendarCheck },
      { title: t("dashboard.nav.availability"), url: "/admin/rdv-disponibilites", icon: Clock },
      { title: t("dashboard.nav.auditLogs"), url: "/admin/audit-logs", icon: Shield },
    ],
  },
  {
    label: t("dashboard.nav.account"),
    items: [
      { title: t("dashboard.nav.myAccount"), url: "/account", icon: UserRound },
      { title: t("common.help"), url: "/", icon: HelpCircle },
    ],
  },
];

const deccAdminSections = (t: Translator): NavSection[] => [
  {
    label: t("dashboard.nav.navigation"),
    items: [
      { title: t("dashboard.nav.adminDashboard"), url: "/admin", icon: BarChart3 },
      { title: t("dashboard.nav.documents"), url: "/admin/documents", icon: FileText },
      { title: t("dashboard.nav.students"), url: "/admin/students", icon: UsersRound },
      { title: t("dashboard.nav.payments"), url: "/admin/payments", icon: CreditCard },
      { title: t("dashboard.nav.auditLogs"), url: "/admin/audit-logs", icon: Shield },
    ],
  },
  {
    label: t("dashboard.nav.account"),
    items: [
      { title: t("dashboard.nav.myAccount"), url: "/account", icon: UserRound },
      { title: t("common.help"), url: "/", icon: HelpCircle },
    ],
  },
];

const eleveSections = (t: Translator): NavSection[] => [
  {
    label: t("dashboard.nav.navigation"),
    items: [
      { title: t("dashboard.nav.studentDashboard"), url: "/dashboard", icon: LayoutDashboard },
      { title: t("dashboard.nav.myDocuments"), url: "/dashboard/documents", icon: FolderOpen },
      { title: t("dashboard.nav.myAppointments"), url: "/dashboard/rendez-vous", icon: CalendarDays },
      { title: t("dashboard.nav.myPayments"), url: "/dashboard/payments", icon: Receipt },
      { title: t("dashboard.nav.myNotifications"), url: "/dashboard/notifications", icon: Bell },
    ],
  },
  {
    label: t("dashboard.nav.account"),
    items: [
      { title: t("dashboard.nav.myAccount"), url: "/account", icon: UserRound },
      { title: t("common.help"), url: "/", icon: HelpCircle },
    ],
  },
];

const agentCentreSections = (t: Translator): NavSection[] => [
  {
    label: t("dashboard.nav.navigation"),
    items: [{ title: t("dashboard.nav.agentWithdrawals"), url: "/centre-examen", icon: ClipboardCheck }],
  },
  {
    label: t("dashboard.nav.account"),
    items: [
      { title: t("dashboard.nav.myAccount"), url: "/account", icon: UserRound },
      { title: t("common.help"), url: "/", icon: HelpCircle },
    ],
  },
];

export function getNavSections(role: Role, organismeId: string | null | undefined, t: Translator) {
  if (role === "AGENT_CENTRE_EXAMEN") {
    return agentCentreSections(t);
  }

  if (role !== "ADMINISTRATEUR") {
    return eleveSections(t);
  }

  return organismeId === ORGANISME_IDS.DECC ? deccAdminSections(t) : obcAdminSections(t);
}
