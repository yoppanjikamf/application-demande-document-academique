"use client";

import type { DiplomePrincipal } from "@/lib/generated/prisma/client";
import { requestOriginalDiplomaAction, requestReleveNotesAction } from "@/app/dashboard/actions";
import { PendingForm, PendingSubmitButton } from "@/components/ui/action-loading-dialog";

type PendingDocumentRequestFormProps = {
  diplomeType: DiplomePrincipal;
  type: "ORIGINAL" | "RELEVE_NOTES";
  label?: string;
};

export function PendingDocumentRequestForm({
  diplomeType,
  type,
  label = "Faire une demande",
}: PendingDocumentRequestFormProps) {
  const action = type === "ORIGINAL" ? requestOriginalDiplomaAction : requestReleveNotesAction;
  const pendingTitle =
    type === "ORIGINAL" ? "Demande de diplôme en cours" : "Demande de relevé en cours";
  const pendingDescription =
    type === "ORIGINAL"
      ? "Enregistrement de votre demande de diplôme original auprès de l'administration."
      : "Enregistrement de votre demande de relevé de notes auprès de votre centre d'examen.";

  return (
    <PendingForm
      action={action}
      pendingTitle={pendingTitle}
      pendingDescription={pendingDescription}
    >
      <input type="hidden" name="diplomeType" value={diplomeType} />
      <PendingSubmitButton pendingLabel="Envoi en cours...">{label}</PendingSubmitButton>
    </PendingForm>
  );
}
