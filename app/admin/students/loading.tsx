import { AdminStudentsListSkeleton } from "@/components/admin/admin-students-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminStudentsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <div className="rounded-md border border-[var(--border-token)] bg-surface-0 p-4 shadow-card">
        <Skeleton className="h-4 w-32" />
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <AdminStudentsListSkeleton />
    </div>
  );
}
