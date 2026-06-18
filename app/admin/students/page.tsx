import { Suspense } from "react";
import { UserPlus } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAdminScopeLabel } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { AdminManualStudentForm } from "@/components/admin/admin-manual-student-form";
import { AdminAvailabilityImportForm } from "@/components/admin/admin-availability-import-form";
import { AdminStudentsImportForm } from "@/components/admin/admin-students-import-form";
import { AdminStudentsList } from "@/components/admin/admin-students-list";
import { AdminStudentsListSkeleton } from "@/components/admin/admin-students-list-skeleton";
import { AdminStudentsSearchForm } from "@/components/admin/admin-students-search-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

type AdminStudentsPageProps = {
  searchParams?: Promise<{
    q?: string;
    importStatus?: string;
    importMessage?: string;
    manualStatus?: string;
    manualMessage?: string;
    availStatus?: string;
    availMessage?: string;
    availErrors?: string;
  }>;
};

export default async function AdminStudentsPage({ searchParams }: AdminStudentsPageProps) {
  const user = await requireRole("ADMINISTRATEUR", "/admin/students");
  const params = await searchParams;
  const q = params?.q?.trim();
  const importStatus = params?.importStatus === "success" ? "success" : params?.importStatus;
  const importMessage = params?.importMessage?.trim();
  const manualStatus = params?.manualStatus === "success" ? "success" : params?.manualStatus;
  const manualMessage = params?.manualMessage?.trim();
  const availStatus = params?.availStatus;
  const availMessage = params?.availMessage?.trim();
  const availErrors = params?.availErrors?.trim();
  const scopeLabel = getAdminScopeLabel(user);

  const antenne = user.antenneRegionaleId
    ? await prisma.antenneRegionale.findUnique({
        where: { id: user.antenneRegionaleId },
        select: { region: true },
      })
    : null;

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      organismeId={user.organismeId}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      scopeLabel={scopeLabel}
      activePath="/admin/students"
      title="Élèves"
      subtitle="Ajoutez des élèves manuellement ou importez un tableau CSV, puis recherchez et suivez leurs dossiers."
    >
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-1">Disponibiliser des documents (Import A)</h2>
        <AdminAvailabilityImportForm
          availStatus={availStatus}
          availMessage={availMessage}
          availErrors={availErrors}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-obc-800" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-text-1">Ajouter des élèves</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminManualStudentForm
            defaultRegion={antenne?.region ?? "Centre"}
            manualStatus={manualStatus}
            manualMessage={manualMessage}
          />
          <AdminStudentsImportForm importStatus={importStatus} importMessage={importMessage} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-1">Élèves enregistrés</h2>
        <AdminStudentsSearchForm defaultQuery={q} />
        <Suspense key={q ?? "all"} fallback={<AdminStudentsListSkeleton />}>
          <AdminStudentsList user={user} query={q} />
        </Suspense>
      </section>
    </DashboardShell>
  );
}
