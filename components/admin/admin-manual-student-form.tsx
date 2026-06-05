"use client";

import { createManualStudentAction } from "@/app/admin/actions";
import { PendingForm, PendingSubmitButton } from "@/components/ui/action-loading-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AdminManualStudentFormProps = {
  defaultRegion?: string;
  manualStatus?: string;
  manualMessage?: string;
};

export function AdminManualStudentForm({
  defaultRegion = "Centre",
  manualStatus,
  manualMessage,
}: AdminManualStudentFormProps) {
  const isSuccess = manualStatus === "success";

  return (
    <PendingForm
      action={createManualStudentAction}
      className="space-y-4 rounded-md border border-[var(--border-token)] bg-surface-0 p-5 shadow-card"
      pendingTitle="Enregistrement de l'élève"
      pendingDescription="Création ou mise à jour du profil, de l'examen composé et des documents associés."
      pendingHint="L'élève activera son mot de passe plus tard via la page d'inscription."
    >
      {manualMessage ? (
        <div
          className={
            isSuccess
              ? "rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              : "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          }
        >
          {manualMessage}
        </div>
      ) : null}

      <div>
        <h3 className="font-semibold text-text-1">Ajout manuel</h3>
        <p className="mt-1 text-sm text-text-3">
          Enregistrez un élève et son examen. Sans mot de passe : l&apos;élève s&apos;active sur{" "}
          <span className="font-medium">/auth/register</span> avec matricule et email, puis prend
          lui-même ses rendez-vous de retrait lorsque ses documents sont disponibles.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="manual-matricule">Matricule</Label>
          <Input id="manual-matricule" name="matricule" required placeholder="ELEVE0123" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-email">Email</Label>
          <Input
            id="manual-email"
            name="email"
            type="email"
            required
            placeholder="eleve@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-nom">Nom</Label>
          <Input id="manual-nom" name="nom" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-prenom">Prénom</Label>
          <Input id="manual-prenom" name="prenom" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-dateNaissance">Date de naissance</Label>
          <Input id="manual-dateNaissance" name="dateNaissance" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-anneeSession">Année de session</Label>
          <Input
            id="manual-anneeSession"
            name="anneeSession"
            type="number"
            min={1950}
            max={2100}
            defaultValue={new Date().getFullYear()}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="manual-diplomeType">Examen / diplôme</Label>
          <select
            id="manual-diplomeType"
            name="diplomeType"
            required
            defaultValue="BACCALAUREAT"
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            )}
          >
            <option value="BEPC">BEPC</option>
            <option value="PROBATOIRE">Probatoire</option>
            <option value="BACCALAUREAT">Baccalauréat</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-centreExamen">Centre d&apos;examen</Label>
          <Input id="manual-centreExamen" name="centreExamen" required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="manual-regionComposition">Région de composition</Label>
          <Input
            id="manual-regionComposition"
            name="regionComposition"
            defaultValue={defaultRegion}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="manual-documentType">Document (optionnel)</Label>
          <select
            id="manual-documentType"
            name="documentType"
            defaultValue=""
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            )}
          >
            <option value="">Aucun pour l&apos;instant</option>
            <option value="ORIGINAL">Original du diplôme</option>
            <option value="RELEVE_NOTES">Relevé de notes</option>
            <option value="DUPLICATA">Duplicata</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-documentStatut">Statut du document</Label>
          <select
            id="manual-documentStatut"
            name="documentStatut"
            defaultValue="PAS_DISPONIBLE"
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            )}
          >
            <option value="PAS_DISPONIBLE">Pas disponible</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="RETIRE">Retiré</option>
          </select>
        </div>
      </div>

      <PendingSubmitButton pendingLabel="Enregistrement..." className="w-full sm:w-auto">
        Enregistrer l&apos;élève
      </PendingSubmitButton>
    </PendingForm>
  );
}
