import { importTestDataAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminImportPage() {
  await requireRole("ADMINISTRATEUR", "/admin/import");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import CSV</h1>
        <p className="text-muted-foreground">
          Importer un jeu de donnees eleves/documents/rdv pour les tests.
        </p>
      </div>

      <form action={importTestDataAction} className="rounded-md border p-4 space-y-3">
        <Input type="file" name="file" accept=".csv" />
        <Button type="submit">Importer</Button>
      </form>
    </div>
  );
}
