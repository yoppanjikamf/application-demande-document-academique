import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

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
}: {
  userId: string;
  to: string;
  documentTitle: string;
}) {
  const subject = "Document disponible pour rendez-vous";
  const text = `Votre document ${documentTitle} est disponible. Vous pouvez maintenant prendre rendez-vous pour le retrait.`;

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
  date,
  time,
  location,
}: {
  userId: string;
  to: string;
  documentTitle: string;
  date: Date;
  time: string;
  location: string;
}) {
  const formattedDate = date.toLocaleDateString("fr-FR");
  const subject = "Confirmation de rendez-vous de retrait";
  const text = [
    `Votre rendez-vous de retrait est confirme.`,
    `Document: ${documentTitle}`,
    `Date: ${formattedDate}`,
    `Heure: ${time}`,
    `Lieu: ${location}`,
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
