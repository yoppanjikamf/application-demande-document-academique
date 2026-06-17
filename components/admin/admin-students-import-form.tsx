"use client";

import Link from "next/link";
import { Download } from "lucide-react";

import { importTestDataAction } from "@/app/admin/actions";
import { STUDENT_IMPORT_CSV_HEADER } from "@/lib/admin-student-import.constants";
import { PendingForm, PendingSubmitButton } from "@/components/ui/action-loading-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminStudentsImportFormProps = {
  importStatus?: string;
  importMessage?: string;
};

const CSV_COLUMNS = [
  "eleve_matricule, eleve_email, eleve_nom, eleve_prenom (obligatoires)",
  "eleve_date_naissance, diplome_type, annee_session, centre_examen, region_composition",
  "document_type (optionnel ; statut initial toujours Pas disponible)",
];

export function AdminStudentsImportForm({
  importStatus,
  importMessage,
}: AdminStudentsImportFormProps) {
  const isSuccess = importStatus === "success";

  return (
    <PendingForm
      action={importTestDataAction}
      className="space-y-4 rounded-md border border-[var(--border-token)] bg-surface-0 p-5 shadow-card"
      pendingTitle="Import CSV en cours"
      pendingDescription="Création ou mise à jour des fiches élève et enregistrement des documents en attente."
      pendingHint="Un fichier volumineux peut prendre plusieurs secondes. Ne fermez pas la fenêtre."
    >
      {importMessage ? (
        <div
          className={
            isSuccess
              ? "rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              : "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          }
        >
          {importMessage}
        </div>
      ) : null}
      <div>
        <h3 className="font-semibold text-text-1">Import nouveaux élèves (CSV)</h3>
        <p className="mt-1 text-sm text-text-3">
          Ajoutez des élèves pas encore présents en base (nouvelle promotion, entrée dans le cycle).
          Les documents créés restent en <strong>Pas disponible</strong> jusqu&apos;à l&apos;import
          de disponibilisation ou à une action admin manuelle.
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-text-muted">
          {CSV_COLUMNS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href="/templates/import-eleves.csv" download>
          <Download className="h-4 w-4" />
          Télécharger le modèle CSV
        </Link>
      </Button>
      <details className="rounded-md border border-[var(--border-token)] bg-surface-1 p-3 text-xs text-text-3">
        <summary className="cursor-pointer font-medium text-text-2">En-tête attendu</summary>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all">
          {STUDENT_IMPORT_CSV_HEADER}
        </pre>
      </details>
      <Input type="file" name="file" accept=".csv,text/csv" required />
      <PendingSubmitButton pendingLabel="Import en cours...">
        Importer le fichier
      </PendingSubmitButton>
    </PendingForm>
  );
}
