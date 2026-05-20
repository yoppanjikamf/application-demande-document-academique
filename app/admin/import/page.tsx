import { importTestDataAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminImportPage() {
  await requireRole("ADMINISTRATEUR", "/admin/import");

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      activePath="/admin/import"
      title="Import CSV"
      subtitle="Importer un jeu de donnees eleves/documents/rdv pour les tests."
    >
      <form action={importTestDataAction} className="space-y-3 rounded-md border bg-card p-5 shadow-sm">
        <Input type="file" name="file" accept=".csv" />
        <Button type="submit">Importer</Button>
      </form>
    </DashboardShell>
  );
}
