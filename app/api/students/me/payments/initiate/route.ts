import { z } from "zod";

import { ApiError, handleApiError, json, parseJson, requireApiUser } from "@/lib/api-utils";
import {
  findLatestDuplicataForDocument,
  getDuplicataFee,
  parseDuplicataInstruction,
} from "@/lib/duplicata-service";
import { prisma } from "@/lib/prisma";
import { modePaiement } from "@/lib/generated/prisma/client";

const initiatePaymentSchema = z.object({
  documentId: z.string().trim().min(10),
  modePaiement: z.nativeEnum(modePaiement).optional(),
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

    const duplicata = await findLatestDuplicataForDocument(document);

    if (!duplicata) {
      throw new ApiError(
        "Créez d'abord la demande de duplicata complète avec les pièces justificatives.",
        409,
      );
    }

    const payment = await prisma.paiement.findUnique({
      where: { duplicataId: duplicata.id },
      include: {
        duplicata: true,
        recu: true,
      },
    });

    if (!payment) {
      throw new ApiError("Aucun paiement n'est associé à cette demande de duplicata.", 404);
    }

    const meta = parseDuplicataInstruction(duplicata.intruction);

    return json({
      payment,
      amount: meta.cibleDocument ? getDuplicataFee(meta.cibleDocument) : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
