import { Skeleton } from "@/components/ui/skeleton";

export function AdminStudentsListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--border-token)] bg-surface-0 shadow-card">
      <div className="hidden grid-cols-[1.2fr_1fr_auto] gap-4 border-b border-[var(--border-token)] bg-surface-1 px-5 py-3 md:grid">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="divide-y divide-[#E8EEF6]">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 px-5 py-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="hidden h-4 w-48 md:block" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}
