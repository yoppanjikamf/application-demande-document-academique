import { z } from "zod";

import { ApiError, handleApiError, json, parseJson, requireApiUser } from "@/lib/api-utils";
import { resolveDocumentRoute } from "@/lib/document-routing";
import {
  getDuplicataFee,
  parseDuplicataInstruction,
  type DuplicataTarget,
} from "@/lib/duplicata-service";
import { prisma } from "@/lib/prisma";
import { modePaiement } from "@/lib/generated/prisma/client";

const initiatePaymentSchema = z.object({
  documentId: z.string().trim().min(10),
  modePaiement: z.nativeEnum(modePaiement),
  cibleDocument: z.enum(["ORIGINAL", "RELEVE_NOTES"]).optional(),
});

function getDuplicataPaymentTitle(diplomeType: string, target: DuplicataTarget) {
  return target === "ORIGINAL"
    ? `Duplicata du diplôme original du ${diplomeType}`
    : `Duplicata du relevé de notes du ${diplomeType}`;
}

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
      include: { duplicata: true },
    });

    if (existingPayment) {
      const meta = parseDuplicataInstruction(existingPayment.duplicata.intruction);
      return json({
        payment: existingPayment,
        amount: meta.cibleDocument ? getDuplicataFee(meta.cibleDocument) : null,
      });
    }

    if (!input.cibleDocument) {
      throw new ApiError("Le document source du duplicata est requis.", 400);
    }

    const route = resolveDocumentRoute(document);
    const amount = getDuplicataFee(input.cibleDocument);
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
        nomDuplicata: getDuplicataPaymentTitle(document.diplomeType, input.cibleDocument),
        statut: document.statut,
        regionComposition: document.regionComposition,
        organismeId: route.organismeId,
        antenneRegionaleId: route.antenneRegionaleId,
        intruction: JSON.stringify({
          diplomeType: document.diplomeType,
          cibleDocument: input.cibleDocument,
          centreExamen: document.centreExamen,
          justificatif: "Non fourni via API",
          montant: amount,
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

    return json({ payment, amount }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
