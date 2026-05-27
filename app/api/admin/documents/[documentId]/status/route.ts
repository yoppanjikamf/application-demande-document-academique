import { z } from "zod";

import { getDocumentTitle, getPickupLocation } from "@/lib/appointment-service";
import { ApiError, handleApiError, json, parseJson, requireApiUser } from "@/lib/api-utils";
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
    await requireApiUser("ADMINISTRATEUR");
    const { documentId } = await params;
    const input = await parseJson(request, statusSchema);
    const document = await prisma.documentAcademique.findUnique({
      where: { id: documentId },
      include: { eleve: true },
    });

    if (!document) {
      throw new ApiError("Document introuvable.", 404);
    }

    const previousStatus = document.statut;
    const updated = await prisma.documentAcademique.update({
      where: { id: document.id },
      data: { statut: input.statut },
    });

    const documentTitle = getDocumentTitle(document);
    if (previousStatus !== "DISPONIBLE" && input.statut === "DISPONIBLE") {
      await notifyDocumentAvailable({
        userId: document.eleve.id,
        to: document.eleve.email,
        documentTitle,
        typeDocument: document.typeDocument,
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
      });
    }

    return json({ document: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
