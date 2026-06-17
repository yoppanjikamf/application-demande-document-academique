import { getDocumentTitle, getPickupLocation } from "@/lib/appointment-service";
import {
  canAdminAccessDocument,
  isDocumentRequestAllowed,
  resolveDocumentRoute,
} from "@/lib/document-routing";
import { findLatestDuplicataForDocument, syncLatestDuplicataStatus } from "@/lib/duplicata-service";
import { notifyDocumentAvailable, notifyDocumentRetired } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";
import type { StatutDocument } from "@/lib/generated/prisma/client";

type DocumentWithEleve = {
  id: string;
  statut: StatutDocument;
  typeDocument: import("@/lib/generated/prisma/client").TypeDocument;
  diplomeType: import("@/lib/generated/prisma/client").DiplomePrincipal;
  centreExamen: string | null;
  regionComposition: string | null;
  eleveId: string;
  eleve: {
    id: string;
    email: string;
    matricule: string;
  };
};

export async function applyDocumentStatusTransition({
  document,
  nextStatus,
  adminUserId,
}: {
  document: DocumentWithEleve;
  nextStatus: StatutDocument;
  adminUserId: string;
}) {
  if (!isDocumentRequestAllowed(document.diplomeType, document.typeDocument)) {
    throw new Error("Le Probatoire ne donne pas lieu à la délivrance d'un diplôme.");
  }

  const previousStatus = document.statut;

  if (
    nextStatus === "RETIRE" &&
    previousStatus !== "RETIRE" &&
    resolveDocumentRoute(document).pickupType === "CENTRE_EXAMEN"
  ) {
    throw new Error(
      "Ce retrait est confirmé par l'agent du centre d'examen lors du rendez-vous. L'administrateur gère uniquement la disponibilité (Disponible / Pas disponible).",
    );
  }

  if (document.typeDocument === "DUPLICATA" && nextStatus === "DISPONIBLE") {
    const latestDuplicata = await findLatestDuplicataForDocument(document);

    if (!latestDuplicata || latestDuplicata.statutValidation !== "VALIDEE") {
      throw new Error(
        "Le dossier de duplicata doit être validé avant de marquer le document comme disponible.",
      );
    }
  }

  await prisma.documentAcademique.update({
    where: { id: document.id },
    data: { statut: nextStatus },
  });

  if (document.typeDocument === "DUPLICATA") {
    await syncLatestDuplicataStatus(document, nextStatus);
  }

  await prisma.auditLog
    .create({
      data: {
        action: "DOCUMENT_STATUS_CHANGED",
        resource: "DOCUMENT",
        resourceId: document.id,
        userId: adminUserId,
        details: JSON.stringify({
          documentId: document.id,
          eleveMatricule: document.eleve.matricule,
          previousStatus,
          newStatus: nextStatus,
          documentType: document.typeDocument,
          diplomeType: document.diplomeType,
        }),
      },
    })
    .catch((err) => {
      console.error("Failed to create audit log:", err);
    });

  const documentTitle = getDocumentTitle(document);

  if (previousStatus !== "DISPONIBLE" && nextStatus === "DISPONIBLE") {
    const location = await getPickupLocation(document);
    await notifyDocumentAvailable({
      userId: document.eleve.id,
      to: document.eleve.email,
      documentTitle,
      typeDocument: document.typeDocument,
      diplomeType: document.diplomeType,
      location,
    });
  }

  if (previousStatus !== "RETIRE" && nextStatus === "RETIRE") {
    await prisma.rendezVous.updateMany({
      where: {
        documentId: document.id,
        statut: { in: ["PLANIFIE", "CONFIRME"] },
      },
      data: { statut: "HONORE" },
    });

    await notifyDocumentRetired({
      userId: document.eleve.id,
      to: document.eleve.email,
      documentTitle,
      diplomeType: document.diplomeType,
    });
  }

  return { previousStatus, nextStatus, notified: previousStatus !== "DISPONIBLE" && nextStatus === "DISPONIBLE" };
}

export function assertAdminCanManageDocument(
  admin: { organismeId?: string | null; antenneRegionaleId?: string | null },
  document: Pick<
    DocumentWithEleve,
    "diplomeType" | "typeDocument" | "centreExamen" | "regionComposition"
  >,
) {
  const route = resolveDocumentRoute(document);
  if (!canAdminAccessDocument(admin, route)) {
    throw new Error("Document hors de votre organisme ou antenne régionale.");
  }
}
