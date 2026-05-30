import { getDocumentTitle, getPickupLocation } from "@/lib/appointment-service";
import { handleApiError, json, requireInternalRequest } from "@/lib/api-utils";
import { sendTrackedMail } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    requireInternalRequest(request);

    // Rappel des documents disponibles depuis au moins 30 jours et non retirés.
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const documentsToRemind = await prisma.documentAcademique.findMany({
      where: {
        statut: "DISPONIBLE",
        updatedAt: { lte: cutoffDate },
      },
      include: {
        eleve: true,
        antenneRegionale: true,
      },
    });

    if (documentsToRemind.length === 0) {
      return json({
        ok: true,
        message: "Aucun document disponible depuis plus de 30 jours.",
        count: 0,
      });
    }

    const results: { success: number; failed: number } = {
      success: 0,
      failed: 0,
    };

    for (const document of documentsToRemind) {
      try {
        const existingReminder = await prisma.auditLog.findFirst({
          where: {
            action: "DOCUMENT_WITHDRAWAL_REMINDER_30DAYS_SENT",
            resource: "DOCUMENT",
            resourceId: document.id,
          },
          select: { id: true },
        });

        if (existingReminder) {
          continue;
        }

        const documentTitle = getDocumentTitle(document);
        const location = await getPickupLocation(document);
        const availableSince = document.updatedAt.toLocaleDateString("fr-FR");

        // Créer une notification en base de données
        await prisma.notification.create({
          data: {
            userId: document.eleve.id,
            typeNotification: "DOCUMENT_WITHDRAWAL_REMINDER_30DAYS",
            message: `Rappel: votre ${documentTitle} est disponible depuis le ${availableSince}. Lieu de retrait: ${location}.`,
          },
        });

        // Envoyer un email
        await sendTrackedMail({
          userId: document.eleve.id,
          to: document.eleve.email,
          subject: `Rappel: document disponible - ${documentTitle}`,
          text: `Bonjour ${document.eleve.prenom},\n\nVotre ${documentTitle} est disponible depuis le ${availableSince} et n'a pas encore été retiré.\n\nLieu de retrait : ${location}\n\nVeuillez vous présenter avec votre carte scolaire ou CNI et votre accusé de réception.\n\nCordialement,\nDR-DOCSCOL`,
        });

        // Créer un log d'audit
        await prisma.auditLog.create({
          data: {
            action: "DOCUMENT_WITHDRAWAL_REMINDER_30DAYS_SENT",
            resource: "DOCUMENT",
            resourceId: document.id,
            userId: document.eleve.id,
            details: JSON.stringify({
              documentId: document.id,
              reminderType: "30DAYS",
              availableSince: document.updatedAt,
            }),
          },
        });

        results.success += 1;
      } catch (error) {
        console.error(`Failed to send 30-day reminder for document ${document.id}:`, error);
        results.failed += 1;
      }
    }

    return json(
      {
        ok: true,
        message: `Rappels envoyes: ${results.success} succes, ${results.failed} echecs.`,
        results,
      },
      202,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
