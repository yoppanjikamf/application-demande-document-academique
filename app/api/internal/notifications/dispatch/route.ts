import { z } from "zod";

import { getDocumentTitle, getPickupLocation } from "@/lib/appointment-service";
import { ApiError, handleApiError, json, parseJson, requireInternalRequest } from "@/lib/api-utils";
import { notifyDocumentAvailable } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";

const dispatchSchema = z.object({
  documentId: z.string().trim().min(10),
});

export async function POST(request: Request) {
  try {
    requireInternalRequest(request);
    const input = await parseJson(request, dispatchSchema);
    const document = await prisma.documentAcademique.findUnique({
      where: { id: input.documentId },
      include: { eleve: true },
    });

    if (!document) {
      throw new ApiError("Document introuvable.", 404);
    }

    if (document.statut !== "DISPONIBLE") {
      throw new ApiError("Le document n'est pas disponible.", 409);
    }

    await notifyDocumentAvailable({
      userId: document.eleve.id,
      to: document.eleve.email,
      documentTitle: getDocumentTitle(document),
      typeDocument: document.typeDocument,
      diplomeType: document.diplomeType,
      location: await getPickupLocation(document),
    });

    return json({ ok: true }, 202);
  } catch (error) {
    return handleApiError(error);
  }
}
