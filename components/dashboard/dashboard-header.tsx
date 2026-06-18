"use client";

import Link from "next/link";
import type { Role } from "@/lib/generated/prisma/client";
import { Bell, ChevronRight, Menu } from "lucide-react";

import { useI18n } from "@/components/i18n/locale-provider";
import { useSidebarContext } from "@/components/dashboard/sidebar-context";
import { Button } from "@/components/ui/button";
import type { TranslationKey } from "@/lib/i18n/translate";

function getBreadcrumbItems(activePath: string, t: (key: TranslationKey) => string) {
  return activePath
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      const key = `dashboard.paths.${segment.replace(/-/g, "")}` as TranslationKey;
      const translated = t(key);
      return translated === key ? segment : translated;
    });
}

export function DashboardHeader({
  role,
  userName,
  title,
  subtitle,
  scopeLabel,
  activePath,
  unreadNotificationCount = 0,
}: {
  role: Role;
  userName?: string;
  title: string;
  subtitle: string;
  scopeLabel?: string;
  activePath: string;
  unreadNotificationCount?: number;
}) {
  const { t } = useI18n();
  const { toggleSidebar } = useSidebarContext();
  const breadcrumbItems = getBreadcrumbItems(activePath, t);
  const areaLabel =
    role === "ADMINISTRATEUR"
      ? t("dashboard.areas.backOffice")
      : role === "AGENT_CENTRE_EXAMEN"
        ? t("dashboard.areas.agent")
        : t("dashboard.areas.student");

  return (
    <header className="z-30 shrink-0 border-b border-[var(--border-token)] bg-[rgba(255,255,255,0.92)] backdrop-blur-md lg:sticky lg:top-0">
      <div className="flex min-h-16 flex-wrap items-start gap-3 px-4 py-3 sm:items-center sm:gap-4 lg:px-8">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">{t("dashboard.openMenu")}</span>
        </Button>

        <div className="min-w-0 flex-1">
          <nav
            className="mb-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs font-semibold text-text-3"
            aria-label={t("dashboard.breadcrumb")}
          >
            <span>{areaLabel}</span>
            {breadcrumbItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-1">
                <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </span>
            ))}
          </nav>
          <h1 className="font-display text-lg leading-tight text-text-1 sm:text-2xl lg:text-3xl">
            {title}
          </h1>
          <p className="mt-1 line-clamp-3 text-sm text-text-3 sm:line-clamp-none">{subtitle}</p>
          {scopeLabel ? (
            <p className="mt-2 inline-flex rounded-full bg-gold-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-obc-800 ring-1 ring-gold-300">
              {t("dashboard.scopePrefix")}: {scopeLabel}
            </p>
          ) : null}
        </div>

        {role === "ELEVE" ? (
          <Button
            asChild
            variant="outline"
            size="icon"
            className="relative ml-auto inline-flex sm:ml-0"
          >
            <Link href="/dashboard/notifications">
              <Bell className="h-4 w-4" />
              {unreadNotificationCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--status-cancelled)] px-1 text-[10px] font-bold text-white">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              ) : null}
              <span className="sr-only">{t("dashboard.notifications")}</span>
            </Link>
          </Button>
        ) : null}

        <div className="hidden items-center gap-3 md:flex">
          <div className="ring-gold-300/70 flex h-10 w-10 items-center justify-center rounded-full bg-obc-800 text-sm font-bold text-white ring-2">
            {(userName ?? "OBC/DECC")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((item) => item[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="max-w-36 truncate text-sm font-semibold text-text-1">{userName}</div>
        </div>
      </div>
    </header>
  );
}
