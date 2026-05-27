import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import type { TypeDocument } from "@/lib/generated/prisma/client";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  userId?: string;
};

export async function sendTrackedMail(payload: MailPayload) {
  try {
    await sendMail(payload);
    await prisma.mailLog.create({
      data: {
        to: payload.to,
        subject: payload.subject,
        status: "ENVOYE",
        userId: payload.userId,
      },
    });
  } catch (error) {
    await prisma.mailLog.create({
      data: {
        to: payload.to,
        subject: payload.subject,
        status: "ERREUR",
        error: error instanceof Error ? error.message : "Erreur email inconnue",
        userId: payload.userId,
      },
    });
    throw error;
  }
}

export async function notifyDocumentAvailable({
  userId,
  to,
  documentTitle,
  typeDocument,
  location,
}: {
  userId: string;
  to: string;
  documentTitle: string;
  typeDocument: TypeDocument;
  location: string;
}) {
  const isReleve = typeDocument === "RELEVE_NOTES";
  const subject = isReleve
    ? "Releve de notes disponible au centre d'examen"
    : "Document disponible pour rendez-vous";
  const text = isReleve
    ? `Votre ${documentTitle} est disponible dans votre centre d'examen: ${location}. Aucune prise de rendez-vous n'est necessaire.`
    : `Votre document ${documentTitle} est disponible. Vous pouvez maintenant prendre rendez-vous pour le retrait.`;

  await prisma.notification.create({
    data: {
      userId,
      typeNotification: "DOCUMENT_DISPONIBLE",
      message: text,
    },
  });

  await sendTrackedMail({ userId, to, subject, text });
}

export async function notifyDocumentRetired({
  userId,
  to,
  documentTitle,
}: {
  userId: string;
  to: string;
  documentTitle: string;
}) {
  const subject = "Accuse de reception du document";
  const text = `Nous confirmons que le document ${documentTitle} a bien ete recupere.`;

  await prisma.notification.create({
    data: {
      userId,
      typeNotification: "DOCUMENT_RETIRE",
      message: text,
    },
  });

  await sendTrackedMail({ userId, to, subject, text });
}

export async function notifyAppointmentConfirmed({
  userId,
  to,
  documentTitle,
  documentType,
  date,
  time,
  location,
  recipientName,
}: {
  userId: string;
  to: string;
  documentTitle: string;
  documentType: TypeDocument;
  date: Date;
  time: string;
  location: string;
  recipientName: string;
}) {
  const formattedDate = date.toLocaleDateString("fr-FR");
  const subject = "Confirmation de rendez-vous de retrait";
  const items = ["Carte scolaire ou CNI", "Accuse de reception ou numero de demande"];
  if (documentType === "DUPLICATA") {
    items.push("Recu de paiement du duplicata");
  }
  const text = [
    `Bonjour ${recipientName},`,
    `Votre rendez-vous de retrait est confirme.`,
    `Document: ${documentTitle}`,
    `Date: ${formattedDate}`,
    `Heure: ${time}`,
    `Lieu: ${location}`,
    "Pieces a presenter:",
    ...items.map((item) => `- ${item}`),
  ].join("\n");

  await prisma.notification.create({
    data: {
      userId,
      typeNotification: "RENDEZ_VOUS_CONFIRME",
      message: text,
    },
  });

  await sendTrackedMail({ userId, to, subject, text });
}
