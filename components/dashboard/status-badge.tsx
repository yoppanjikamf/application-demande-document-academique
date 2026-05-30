import { cn } from "@/lib/utils";

type BadgeTone = "slate" | "blue" | "green" | "amber" | "red";

const tones: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
};

export function StatusBadge({
  children,
  tone = "slate",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function documentTone(status: "PAS_DISPONIBLE" | "DISPONIBLE" | "RETIRE") {
  if (status === "DISPONIBLE") {
    return "green" as const;
  }
  if (status === "RETIRE") {
    return "blue" as const;
  }
  return "amber" as const;
}

export function appointmentTone(status: "PLANIFIE" | "CONFIRME" | "ANNULE" | "HONORE") {
  if (status === "CONFIRME") {
    return "green" as const;
  }
  if (status === "HONORE") {
    return "blue" as const;
  }
  if (status === "ANNULE") {
    return "red" as const;
  }
  return "amber" as const;
}

export function paymentTone(status: "EN_ATTENTE" | "EFFECTUE" | "ANNULE") {
  if (status === "EFFECTUE") {
    return "green" as const;
  }
  if (status === "ANNULE") {
    return "red" as const;
  }
  return "amber" as const;
}
