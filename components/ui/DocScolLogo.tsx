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
  const sizeClass =
    variant === "icon" ? "h-10 w-10" : variant === "mark" ? "h-12 w-12" : "h-11 w-11";

  return (
    <span className={cn("inline-flex items-center gap-3", themeClasses[theme], className)}>
      <svg
        viewBox="0 0 48 48"
        className={cn("shrink-0 drop-shadow-sm", sizeClass)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="docscol-badge" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--edu-500)" />
            <stop offset="0.55" stopColor="var(--obc-600)" />
            <stop offset="1" stopColor="var(--obc-800)" />
          </linearGradient>
          <linearGradient id="docscol-cap" x1="11" y1="11" x2="37" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#eaf3ee" />
          </linearGradient>
        </defs>

        {/* Badge arrondi (dégradé savoir -> reussite) */}
        <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#docscol-badge)" />
        <rect
          x="2.75"
          y="2.75"
          width="42.5"
          height="42.5"
          rx="12.25"
          stroke="#ffffff"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />

        {/* Toque de diplome */}
        <path d="M24 11.5 38 18 24 24.5 10 18 24 11.5Z" fill="url(#docscol-cap)" />
        <path
          d="M16.5 21.2v5.1c0 .5.3 1 .8 1.3 1.9 1.1 4.2 1.7 6.7 1.7s4.8-.6 6.7-1.7c.5-.3.8-.8.8-1.3v-5.1L24 24.7l-7.5-3.5Z"
          fill="#ffffff"
          fillOpacity="0.9"
        />
        {/* Pampille or */}
        <path
          d="M37.4 18.4v7.2"
          stroke="var(--gold-400)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="37.4" cy="27" r="1.9" fill="var(--gold-400)" />
        <circle cx="24" cy="18" r="1.7" fill="var(--gold-300)" />
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
