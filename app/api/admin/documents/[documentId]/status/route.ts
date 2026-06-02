import { z } from "zod";

import { getDocumentTitle, getPickupLocation } from "@/lib/appointment-service";
import { ApiError, handleApiError, json, parseJson, requireApiUser } from "@/lib/api-utils";
import { getAdminDocumentScope, isDocumentRequestAllowed } from "@/lib/document-routing";
import { syncLatestDuplicataStatus } from "@/lib/duplicata-service";
import { notifyDocumentAvailable, notifyDocumentRetired } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";

const statusSchema = z.object({
  statut: z.enum(["PAS_DISPONIBLE", "DISPONIBLE", "RETIRE"]),
});

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const admin = await requireApiUser("ADMINISTRATEUR");
    const { documentId } = await params;
    const input = await parseJson(request, statusSchema);
    const document = await prisma.documentAcademique.findFirst({
      where: { id: documentId, ...getAdminDocumentScope(admin) },
      include: { eleve: true },
    });

    if (!document) {
      throw new ApiError("Document introuvable.", 404);
    }

    if (!isDocumentRequestAllowed(document.diplomeType, document.typeDocument)) {
      throw new ApiError("Le Probatoire ne donne pas lieu à la délivrance d'un diplôme.", 422);
    }

    const previousStatus = document.statut;
    const updated = await prisma.documentAcademique.update({
      where: { id: document.id },
      data: { statut: input.statut },
    });

    if (document.typeDocument === "DUPLICATA") {
      await syncLatestDuplicataStatus(document, input.statut);
    }

    // Créer un log d'audit
    await prisma.auditLog
      .create({
        data: {
          action: "DOCUMENT_STATUS_CHANGED",
          resource: "DOCUMENT",
          resourceId: document.id,
          userId: admin.id,
          details: JSON.stringify({
            documentId: document.id,
            eleveMatricule: document.eleve.matricule,
            previousStatus: previousStatus,
            newStatus: input.statut,
            documentType: document.typeDocument,
            diplomeType: document.diplomeType,
          }),
        },
      })
      .catch((err) => {
        console.error("Failed to create audit log:", err);
      });

    const documentTitle = getDocumentTitle(document);
    if (previousStatus !== "DISPONIBLE" && input.statut === "DISPONIBLE") {
      await notifyDocumentAvailable({
        userId: document.eleve.id,
        to: document.eleve.email,
        documentTitle,
        typeDocument: document.typeDocument,
        diplomeType: document.diplomeType,
        location: await getPickupLocation(document),
      });
    }

    if (previousStatus !== "RETIRE" && input.statut === "RETIRE") {
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

    return json({ document: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
