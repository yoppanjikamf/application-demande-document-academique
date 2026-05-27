import { z } from "zod";

import {
  ApiError,
  handleApiError,
  json,
  parseJson,
  requireInternalRequest,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

const paymentWebhookSchema = z.object({
  paymentId: z.string().trim().min(10),
  statut: z.enum(["EN_ATTENTE", "EFFECTUE"]),
  numeroRecu: z.string().trim().min(3).optional(),
  montant: z.coerce.number().positive().optional(),
  commentaire: z.string().trim().max(250).optional(),
});

export async function POST(request: Request) {
  try {
    requireInternalRequest(request);
    const input = await parseJson(request, paymentWebhookSchema);
    const payment = await prisma.paiement.findUnique({
      where: { id: input.paymentId },
      include: { duplicata: true, documentAcademique: true },
    });

    if (!payment) {
      throw new ApiError("Paiement introuvable.", 404);
    }

    const updated = await prisma.paiement.update({
      where: { id: payment.id },
      data: { statut: input.statut },
    });

    if (input.statut === "EFFECTUE" && input.numeroRecu && input.montant) {
      await prisma.recu.upsert({
        where: { numero: input.numeroRecu },
        update: {
          paiementId: payment.id,
          montant: input.montant,
          modePaiement: payment.modePaiment,
          commentaire: input.commentaire,
          userId: payment.duplicata.eleveId,
        },
        create: {
          numero: input.numeroRecu,
          paiementId: payment.id,
          montant: input.montant,
          modePaiement: payment.modePaiment,
          commentaire: input.commentaire,
          userId: payment.duplicata.eleveId,
        },
      });
    }

    return json({ payment: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
