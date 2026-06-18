"use client";

import Link from "next/link";
import { Download } from "lucide-react";

import { importDocumentAvailabilityAction } from "@/app/admin/actions";
import { AVAILABILITY_IMPORT_CSV_HEADER } from "@/lib/admin-student-import.constants";
import { PendingForm, PendingSubmitButton } from "@/components/ui/action-loading-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminAvailabilityImportFormProps = {
  availStatus?: string;
  availMessage?: string;
  availErrors?: string;
};

export function AdminAvailabilityImportForm({
  availStatus,
  availMessage,
  availErrors,
}: AdminAvailabilityImportFormProps) {
  const isSuccess = availStatus === "success";

  return (
    <PendingForm
      action={importDocumentAvailabilityAction}
      className="space-y-4 rounded-md border border-[var(--border-token)] bg-surface-0 p-5 shadow-card"
      pendingTitle="Disponibilisation en cours"
      pendingDescription="Mise à jour des statuts document par document (Import A disponibilisation)."
      pendingHint="Les notifications sont envoyées aux élèves concernés."
    >
      {availMessage ? (
        <div
          className={
            isSuccess
              ? "rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              : "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          }
        >
          {availMessage}
        </div>
      ) : null}
      {availErrors ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Lignes en erreur</p>
          <p className="mt-2 whitespace-pre-wrap break-words">{availErrors.replace(/\s\|\s/g, "\n")}</p>
        </div>
      ) : null}
      <div>
        <h3 className="font-semibold text-text-1">Import disponibilisation (Import A)</h3>
        <p className="mt-1 text-sm text-text-3">
          Une ligne = un élève déjà en base + un document précis à passer à{" "}
          <strong>Disponible</strong>. Exemples : relevés Probatoire, originaux BEPC ou
          Baccalauréat. L&apos;élève doit déjà exister ; le document aussi. Les duplicatas sont
          exclus.
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-text-muted">
          <li>Colonnes obligatoires : matricule, diplome_type, document_type</li>
          <li>Colonnes utiles : annee_session (recommandée)</li>
          <li>Notification automatique après chaque passage à Disponible</li>
        </ul>
      </div>
      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href="/templates/import-disponibilisation.csv" download>
          <Download className="h-4 w-4" />
          Télécharger le modèle CSV
        </Link>
      </Button>
      <details className="rounded-md border border-[var(--border-token)] bg-surface-1 p-3 text-xs text-text-3">
        <summary className="cursor-pointer font-medium text-text-2">En-tête attendu</summary>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all">
          {AVAILABILITY_IMPORT_CSV_HEADER}
        </pre>
      </details>
      <Input type="file" name="file" accept=".csv,text/csv" required />
      <PendingSubmitButton pendingLabel="Disponibilisation...">
        Disponibiliser les documents
      </PendingSubmitButton>
    </PendingForm>
  );
}
