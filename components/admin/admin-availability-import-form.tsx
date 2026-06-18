"use client";

import Link from "next/link";
import { Download } from "lucide-react";

import { importDocumentAvailabilityAction } from "@/app/admin/actions";
import type { AdminImportPresentation } from "@/lib/admin-import-config";
import { PendingForm, PendingSubmitButton } from "@/components/ui/action-loading-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminAvailabilityImportFormProps = {
  presentation: AdminImportPresentation["availabilityImport"];
  availStatus?: string;
  availMessage?: string;
  availErrors?: string;
  availWarnings?: string;
};

export function AdminAvailabilityImportForm({
  presentation,
  availStatus,
  availMessage,
  availErrors,
  availWarnings,
}: AdminAvailabilityImportFormProps) {
  const isSuccess = availStatus === "success";

  return (
    <PendingForm
      action={importDocumentAvailabilityAction}
      className="space-y-4 rounded-md border border-[var(--border-token)] bg-surface-0 p-5 shadow-card"
      pendingTitle="Disponibilisation en cours"
      pendingDescription="Mise à jour des statuts document par document."
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
      {availWarnings ? (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          <p className="font-medium">Avertissements e-mail</p>
          <p className="mt-1 text-xs text-sky-900">
            La disponibilisation a réussi et la notification in-app a été créée. Seul l&apos;e-mail n&apos;a pas pu
            partir (configuration SMTP à vérifier dans <code>.env.local</code>).
          </p>
          <p className="mt-2 whitespace-pre-wrap break-words">{availWarnings.replace(/\s\|\s/g, "\n")}</p>
        </div>
      ) : null}
      <div>
        <h3 className="font-semibold text-text-1">{presentation.title}</h3>
        <p className="mt-1 text-sm text-text-3">{presentation.description}</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-text-muted">
          {presentation.bullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-text-muted">
          Fichier de démo (région) : <code className="text-text-2">{presentation.demoFileHint}</code>
        </p>
      </div>
      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href={presentation.templateUrl} download>
          <Download className="h-4 w-4" />
          Télécharger le modèle CSV
        </Link>
      </Button>
      <details className="rounded-md border border-[var(--border-token)] bg-surface-1 p-3 text-xs text-text-3">
        <summary className="cursor-pointer font-medium text-text-2">En-tête attendu</summary>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all">{presentation.csvHeader}</pre>
      </details>
      <Input type="file" name="file" accept=".csv,text/csv" required />
      <PendingSubmitButton pendingLabel="Disponibilisation...">
        Importer et disponibiliser
      </PendingSubmitButton>
    </PendingForm>
  );
}
