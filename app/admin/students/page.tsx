import { Suspense } from "react";
import { UserPlus } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAdminImportPresentation } from "@/lib/admin-import-config";
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
    importErrors?: string;
    manualStatus?: string;
    manualMessage?: string;
    availStatus?: string;
    availMessage?: string;
    availErrors?: string;
    availWarnings?: string;
  }>;
};

export default async function AdminStudentsPage({ searchParams }: AdminStudentsPageProps) {
  const user = await requireRole("ADMINISTRATEUR", "/admin/students");
  const params = await searchParams;
  const q = params?.q?.trim();
  const importStatus = params?.importStatus === "success" ? "success" : params?.importStatus;
  const importMessage = params?.importMessage?.trim();
  const importErrors = params?.importErrors?.trim();
  const manualStatus = params?.manualStatus === "success" ? "success" : params?.manualStatus;
  const manualMessage = params?.manualMessage?.trim();
  const availStatus = params?.availStatus;
  const availMessage = params?.availMessage?.trim();
  const availErrors = params?.availErrors?.trim();
  const availWarnings = params?.availWarnings?.trim();
  const scopeLabel = getAdminScopeLabel(user);
  const importPresentation = getAdminImportPresentation(user);

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
      subtitle={
        importPresentation
          ? `Imports CSV ${importPresentation.organismeName} — région ${importPresentation.scopeLabel?.split(" - ")[1] ?? "Centre"}.`
          : "Ajoutez des élèves manuellement ou importez un tableau CSV, puis recherchez et suivez leurs dossiers."
      }
    >
      {importPresentation ? (
        <>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-text-1">
              {importPresentation.availabilityImport.title}
            </h2>
            <AdminAvailabilityImportForm
              presentation={importPresentation.availabilityImport}
              availStatus={availStatus}
              availMessage={availMessage}
              availErrors={availErrors}
              availWarnings={availWarnings}
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-obc-800" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-text-1">
                {importPresentation.studentImport.title}
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminManualStudentForm
                defaultRegion={antenne?.region ?? "Centre"}
                manualStatus={manualStatus}
                manualMessage={manualMessage}
              />
              <AdminStudentsImportForm
                presentation={importPresentation.studentImport}
                importStatus={importStatus}
                importMessage={importMessage}
                importErrors={importErrors}
              />
            </div>
          </section>
        </>
      ) : (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Compte administrateur sans organisme OBC ou DECC : imports CSV indisponibles.
        </p>
      )}

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
