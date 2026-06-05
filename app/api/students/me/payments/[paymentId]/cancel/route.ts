import { ApiError, handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { renderBrandedEmail } from "@/lib/email-template";
import { sendTrackedMail } from "@/lib/mail-service";
import { createNotification } from "@/lib/notification-service";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser("ELEVE");
    const { paymentId } = await params;

    // Récupérer le paiement
    const payment = await prisma.paiement.findUnique({
      where: { id: paymentId },
      include: {
        duplicata: {
          include: { eleve: true },
        },
        documentAcademique: {
          include: { eleve: true },
        },
      },
    });

    if (!payment) {
      throw new ApiError("Paiement introuvable.", 404);
    }

    // Vérifier que le paiement appartient à l'élève connecté
    const belongsToUser =
      payment.duplicata?.eleveId === user.id || payment.documentAcademique?.eleveId === user.id;

    if (!belongsToUser) {
      throw new ApiError("Accès non autorisé.", 403);
    }

    // Vérifier que le paiement est en attente
    if (payment.statut !== "EN_ATTENTE") {
      throw new ApiError("Seuls les paiements en attente peuvent être annulés.", 409);
    }

    // Mettre à jour le statut du paiement
    const updatedPayment = await prisma.paiement.update({
      where: { id: payment.id },
      data: { statut: "ANNULE" },
    });

    // Créer un log d'audit
    const eleve = payment.duplicata?.eleve || payment.documentAcademique?.eleve;
    if (eleve) {
      await prisma.auditLog
        .create({
          data: {
            action: "PAYMENT_CANCELLED",
            resource: "PAYMENT",
            resourceId: payment.id,
            userId: user.id,
            details: JSON.stringify({
              paymentId: payment.id,
              previousStatus: payment.statut,
              newStatus: "ANNULE",
            }),
          },
        })
        .catch((err) => {
          console.error("Failed to create audit log:", err);
        });

      // Envoyer une notification à l'élève
      await sendTrackedMail({
        to: eleve.email,
        subject: "Paiement annulé",
        text: `Bonjour ${eleve.prenom},\n\nVotre paiement a été annulé avec succès. Si vous avez besoin d'assistance, veuillez contacter le service administratif.`,
        html: renderBrandedEmail({
          title: "Paiement annulé",
          eyebrow: "Paiement",
          intro: `Bonjour ${eleve.prenom}, votre paiement a été annulé avec succès.`,
          body: "Si vous avez besoin d'assistance, veuillez contacter le service administratif.",
          details: [{ label: "Référence paiement", value: payment.id }],
          cta: { label: "Voir mes paiements", href: "/dashboard/payments" },
          tone: "warning",
        }),
        userId: eleve.id,
      }).catch((err) => {
        console.error("Failed to send tracked mail:", err);
      });

      // Créer une notification en base
      await createNotification({
        userId: eleve.id,
        typeNotification: "PAYMENT_CANCELLED",
        title: "Paiement annulé",
        message: "Votre paiement a été annulé avec succès.",
        actionUrl: "/dashboard/payments",
        metadata: {
          paymentId: payment.id,
        },
      }).catch((err) => {
        console.error("Failed to create notification:", err);
      });
    }

    return json({
      payment: updatedPayment,
      message: "Paiement annulé avec succès.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
