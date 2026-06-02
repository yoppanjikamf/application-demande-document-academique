import { cn } from "@/lib/utils";

type DocScolLogoVariant = "full" | "icon" | "mark";
type DocScolLogoTheme = "dark" | "light" | "gold";

const themeClasses: Record<DocScolLogoTheme, string> = {
  dark: "text-white",
  light: "text-obc-800",
  gold: "text-gold-500",
};

export function DocScolLogo({
  variant = "full",
  theme = "light",
  className,
}: {
  variant?: DocScolLogoVariant;
  theme?: DocScolLogoTheme;
  className?: string;
}) {
  const showText = variant === "full";
  const sizeClass = variant === "icon" ? "h-10 w-10" : variant === "mark" ? "h-12 w-12" : "h-11 w-11";

  return (
    <span className={cn("inline-flex items-center gap-3", themeClasses[theme], className)}>
      <svg
        viewBox="0 0 40 44"
        className={cn("shrink-0", sizeClass)}
        fill="none"
        aria-hidden="true"
      >
        <rect x="6" y="3" width="28" height="36" rx="3" fill="currentColor" opacity="0.15" />
        <rect x="3" y="3" width="28" height="36" rx="3" fill="currentColor" opacity="0.9" />
        <rect x="8" y="11" width="16" height="2" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="8" y="16" width="12" height="2" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="8" y="21" width="14" height="2" rx="1" fill="currentColor" opacity="0.3" />
        <circle cx="27" cy="9" r="8" fill="var(--gold-400)" />
        <text
          x="27"
          y="11.5"
          textAnchor="middle"
          fontSize="4.2"
          fontWeight="700"
          fill="#1B4332"
        >
          DR
        </text>
        <path d="M3 35 Q17 39 31 35 L31 39 Q17 43 3 39 Z" fill="var(--gold-300)" opacity="0.85" />
      </svg>
      {showText ? (
        <span className="min-w-0 leading-tight">
          <span className="block font-display text-lg text-current">DR-DOCSCOL</span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] opacity-65">
            Documents scolaires
          </span>
        </span>
      ) : null}
    </span>
  );
}
