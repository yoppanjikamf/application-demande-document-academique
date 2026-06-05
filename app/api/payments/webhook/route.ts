import { z } from "zod";

import { ApiError, handleApiError, json, parseJson, requireInternalRequest } from "@/lib/api-utils";
import { notifyPaymentConfirmed } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";
import { getDuplicataFee, parseDuplicataInstruction } from "@/lib/duplicata-service";

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
      include: {
        duplicata: { include: { eleve: true } },
        documentAcademique: { include: { eleve: true } },
      },
    });

    if (!payment) {
      throw new ApiError("Paiement introuvable.", 404);
    }

    const duplicataMeta = payment.duplicata
      ? parseDuplicataInstruction(payment.duplicata.intruction)
      : null;
    const expectedAmount = duplicataMeta?.cibleDocument
      ? getDuplicataFee(duplicataMeta.cibleDocument)
      : null;
    const receiptAmount = input.montant ?? expectedAmount;

    if (input.statut === "EFFECTUE" && !receiptAmount) {
      throw new ApiError("Montant de paiement requis pour confirmer ce duplicata.", 400);
    }

    if (input.statut === "EFFECTUE" && expectedAmount && receiptAmount !== expectedAmount) {
      throw new ApiError(
        `Montant invalide pour ce duplicata. Montant attendu: ${expectedAmount} FCFA.`,
        400,
      );
    }

    const updated = await prisma.paiement.update({
      where: { id: payment.id },
      data: { statut: input.statut },
    });

    const receipt =
      input.statut === "EFFECTUE" && input.numeroRecu && receiptAmount
        ? await prisma.recu.upsert({
            where: { numero: input.numeroRecu },
            update: {
              paiementId: payment.id,
              montant: receiptAmount,
              modePaiement: payment.modePaiment,
              commentaire: input.commentaire,
              userId: payment.duplicata.eleveId,
            },
            create: {
              numero: input.numeroRecu,
              paiementId: payment.id,
              montant: receiptAmount,
              modePaiement: payment.modePaiment,
              commentaire: input.commentaire,
              userId: payment.duplicata.eleveId,
            },
          })
        : null;

    const eleve = payment.duplicata?.eleve ?? payment.documentAcademique?.eleve ?? null;
    if (input.statut === "EFFECTUE" && payment.statut !== "EFFECTUE" && eleve && receipt) {
      await notifyPaymentConfirmed({
        userId: eleve.id,
        to: eleve.email,
        recipientName: `${eleve.prenom} ${eleve.nom}`.trim(),
        documentTitle: payment.duplicata?.nomDuplicata ?? "Document scolaire",
        diplomeType: payment.documentAcademique?.diplomeType ?? duplicataMeta?.diplomeType,
        paymentMode: payment.modePaiment,
        receiptNumber: receipt.numero,
        amount: receipt.montant,
        paymentDate: receipt.dateEmission,
      });
    }

    return json({ payment: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
