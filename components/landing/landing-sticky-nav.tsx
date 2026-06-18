"use client";

import { useEffect, useState } from "react";

import { useI18n } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

const MORE_SECTION_HASHES = new Set([
  "#fonctionnalites",
  "#pourquoi",
  "#apercu",
  "#consultation",
  "#temoignages",
  "#voir-plus",
]);

type LandingStickyNavProps = {
  onBeforeNavigate?: (hash: string) => void;
};

export function LandingStickyNav({ onBeforeNavigate }: LandingStickyNavProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 420);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    { href: "#fonctionnalites", label: t("landing.stickyNav.features") },
    { href: "#etapes", label: t("landing.stickyNav.steps") },
    { href: "#faq", label: t("landing.stickyNav.faq") },
  ] as const;

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (MORE_SECTION_HASHES.has(href)) {
      event.preventDefault();
      onBeforeNavigate?.(href);
      window.history.replaceState(null, "", href);
      return;
    }
  }

  return (
    <nav
      aria-label={t("landing.stickyNav.label")}
      className={cn(
        "sticky top-16 z-30 border-b border-[var(--border-token)] bg-[rgba(255,255,255,0.95)] backdrop-blur-md transition-[transform,opacity] duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 lg:px-8">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(event) => handleClick(event, item.href)}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-text-2 transition-colors hover:bg-obc-50 hover:text-obc-800 sm:px-4 sm:text-sm"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export { MORE_SECTION_HASHES };
