import { z } from "zod";

import { getDocumentTitle } from "@/lib/appointment-service";
import { ApiError, handleApiError, json, parseJson, requireApiUser } from "@/lib/api-utils";
import { resolveDocumentRoute } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { modePaiement } from "@/lib/generated/prisma/client";

const initiatePaymentSchema = z.object({
  documentId: z.string().trim().min(10),
  modePaiement: z.nativeEnum(modePaiement),
});

export async function POST(request: Request) {
  try {
    const user = await requireApiUser("ELEVE");
    const input = await parseJson(request, initiatePaymentSchema);
    const document = await prisma.documentAcademique.findFirst({
      where: { id: input.documentId, eleveId: user.id },
    });

    if (!document) {
      throw new ApiError("Document introuvable.", 404);
    }

    if (document.typeDocument !== "DUPLICATA") {
      throw new ApiError("Le paiement est uniquement requis pour un duplicata dans ce MVP.", 409);
    }

    const existingPayment = await prisma.paiement.findFirst({
      where: { documentAcademiqueId: document.id },
    });

    if (existingPayment) {
      return json({ payment: existingPayment });
    }

    const route = resolveDocumentRoute(document);
    await prisma.documentAcademique.update({
      where: { id: document.id },
      data: {
        organismeId: route.organismeId,
        antenneRegionaleId: route.antenneRegionaleId,
      },
    });

    const duplicata = await prisma.duplicata.create({
      data: {
        eleveId: user.id,
        typeDocument: "DUPLICATA",
        nomDuplicata: getDocumentTitle(document),
        statut: document.statut,
        regionComposition: document.regionComposition,
        organismeId: route.organismeId,
        antenneRegionaleId: route.antenneRegionaleId,
        intruction: JSON.stringify({
          diplomeType: document.diplomeType,
          centreExamen: document.centreExamen,
          justificatif: "Non fourni via API",
          lieuRetrait: route.location,
        }),
      },
    });

    const payment = await prisma.paiement.create({
      data: {
        duplicataId: duplicata.id,
        documentAcademiqueId: document.id,
        modePaiment: input.modePaiement,
        statut: "EN_ATTENTE",
      },
    });

    return json({ payment }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
