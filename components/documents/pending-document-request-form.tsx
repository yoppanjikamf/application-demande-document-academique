"use client";

import type { DiplomePrincipal } from "@/lib/generated/prisma/client";
import { requestOriginalDiplomaAction, requestReleveNotesAction } from "@/app/dashboard/actions";
import { useI18n } from "@/components/i18n/locale-provider";
import { PendingForm, PendingSubmitButton } from "@/components/ui/action-loading-dialog";

type PendingDocumentRequestFormProps = {
  diplomeType: DiplomePrincipal;
  type: "ORIGINAL" | "RELEVE_NOTES";
  label?: string;
};

export function PendingDocumentRequestForm({
  diplomeType,
  type,
  label,
}: PendingDocumentRequestFormProps) {
  const { t } = useI18n();
  const action = type === "ORIGINAL" ? requestOriginalDiplomaAction : requestReleveNotesAction;
  const pendingTitle =
    type === "ORIGINAL"
      ? t("dashboard.documents.requestingDiploma")
      : t("dashboard.documents.requestingTranscript");
  const pendingDescription =
    type === "ORIGINAL"
      ? t("dashboard.documents.requestDiplomaPending")
      : t("dashboard.documents.requestTranscriptPending");
  const resolvedLabel = label ?? t("dashboard.documents.request");

  return (
    <PendingForm
      action={action}
      pendingTitle={pendingTitle}
      pendingDescription={pendingDescription}
    >
      <input type="hidden" name="diplomeType" value={diplomeType} />
      <PendingSubmitButton pendingLabel={t("dashboard.documents.sending")}>
        {resolvedLabel}
      </PendingSubmitButton>
    </PendingForm>
  );
}
