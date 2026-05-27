import { importTestDataAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminImportPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin/import");

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      userName={`${user.prenom} ${user.nom}`}
      activePath="/admin/import"
      title="Import CSV"
      subtitle="Importer des eleves, documents et rendez-vous depuis un fichier CSV structure."
    >
      <form action={importTestDataAction} className="max-w-2xl space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-950">Fichier CSV</h2>
          <p className="mt-1 text-sm text-slate-500">
            Les colonnes attendues suivent le modele fourni dans `docs/test-data-eleves.csv`.
          </p>
        </div>
        <Input type="file" name="file" accept=".csv" />
        <Button type="submit">Importer</Button>
      </form>
    </DashboardShell>
  );
}
