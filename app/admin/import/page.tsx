import { importTestDataAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { getAdminScopeLabel } from "@/lib/document-routing";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminImportPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin/import");
  const scopeLabel = getAdminScopeLabel(user);

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      organismeId={user.organismeId}
      userName={`${user.prenom} ${user.nom}`}
      scopeLabel={scopeLabel}
      activePath="/admin/import"
      title="Import CSV"
      subtitle="Importer des élèves, documents et rendez-vous depuis un fichier CSV structuré."
    >
      <form
        action={importTestDataAction}
        className="max-w-2xl space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="font-semibold text-slate-950">Fichier CSV</h2>
          <p className="mt-1 text-sm text-slate-500">
            Le fichier ne doit contenir aucun mot de passe. Les élèves activent eux-mêmes leur
            compte avec leur matricule et leur adresse email.
          </p>
        </div>
        <Input type="file" name="file" accept=".csv" />
        <Button type="submit">Importer</Button>
      </form>
    </DashboardShell>
  );
}
