import { Skeleton } from "@/components/ui/skeleton";

/** Écran de chargement pleine page pour l'espace admin (évite la page blanche). */
export function AdminPageLoading() {
  return (
    <div className="flex h-dvh min-h-screen bg-surface-1 lg:h-screen">
      <aside className="hidden w-64 shrink-0 bg-obc-900 lg:block" aria-hidden="true">
        <div className="space-y-6 p-5">
          <Skeleton className="h-8 w-32 bg-white/20" />
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-white/10" />
            ))}
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-[var(--border-token)] bg-surface-0 px-6 py-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
        <div className="flex-1 space-y-6 px-4 py-5 sm:px-6 lg:px-8">
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-64 w-full rounded-md" />
          <p className="text-center text-sm text-text-3">Chargement en cours…</p>
        </div>
      </div>
    </div>
  );
}
