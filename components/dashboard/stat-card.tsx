import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  description,
  tone = "blue",
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
  tone?: "blue" | "green" | "amber" | "red";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-md ring-1 ${tones[tone]}`}>
        {icon}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
      {description ? <p className="mt-2 text-xs text-slate-500">{description}</p> : null}
    </div>
  );
}
