import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import type { DiplomePrincipal, TypeDocument } from "@/lib/generated/prisma/client";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  userId?: string;
  fromName?: string;
};

function getDocumentSenderName(diplomeType?: DiplomePrincipal) {
  if (diplomeType === "BEPC") {
    return "DECC Documents";
  }

  if (diplomeType === "PROBATOIRE" || diplomeType === "BACCALAUREAT") {
    return "OBC Documents";
  }

  return undefined;
}

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
  diplomeType,
  location,
}: {
  userId: string;
  to: string;
  documentTitle: string;
  typeDocument: TypeDocument;
  diplomeType: DiplomePrincipal;
  location: string;
}) {
  const isReleve = typeDocument === "RELEVE_NOTES";
  const isDuplicata = typeDocument === "DUPLICATA";
  const subject = isReleve
    ? "Relevé de notes disponible au centre d'examen"
    : isDuplicata
      ? "Duplicata prêt pour retrait"
      : "Document scolaire disponible pour rendez-vous";
  const text = isReleve
    ? `Votre relevé de notes est désormais disponible dans votre centre d'examen : ${location}.`
    : isDuplicata
      ? `Votre duplicata est prêt. Veuillez vous rendre dans votre établissement ou centre d'examen concerné pour le retirer : ${location}. Aucun rendez-vous n'est requis pour ce retrait.`
      : `Votre document scolaire ${documentTitle} est disponible. Cliquez sur cette notification dans votre espace Notifications pour programmer une date de rendez-vous avant le retrait. Lieu de retrait : ${location}.`;

  await prisma.notification.create({
    data: {
      userId,
      typeNotification: "DOCUMENT_DISPONIBLE",
      message: text,
    },
  });

  await sendTrackedMail({
    userId,
    to,
    subject,
    text,
    fromName: getDocumentSenderName(diplomeType),
  });
}

export async function notifyDuplicataRequestRegistered({
  userId,
  to,
  documentTitle,
  diplomeType,
}: {
  userId: string;
  to: string;
  documentTitle: string;
  diplomeType: DiplomePrincipal;
}) {
  const subject = "Demande de duplicata enregistrée";
  const text = `Votre demande de duplicata a été enregistrée avec succès et elle est en cours de traitement. Document scolaire : ${documentTitle}.`;

  await prisma.notification.create({
    data: {
      userId,
      typeNotification: "DEMANDE_DUPLICATA",
      message: text,
    },
  });

  await sendTrackedMail({
    userId,
    to,
    subject,
    text,
    fromName: getDocumentSenderName(diplomeType),
  });
}

export async function notifyPaymentConfirmed({
  userId,
  to,
  recipientName,
  documentTitle,
  diplomeType,
  paymentMode,
  receiptNumber,
  amount,
  paymentDate,
}: {
  userId: string;
  to: string;
  recipientName: string;
  documentTitle: string;
  diplomeType?: DiplomePrincipal;
  paymentMode: string;
  receiptNumber: string;
  amount: number;
  paymentDate: Date;
}) {
  const formattedAmount = new Intl.NumberFormat("fr-FR").format(amount);
  const formattedDate = paymentDate.toLocaleDateString("fr-FR");
  const subject = "Paiement pris en compte";
  const text = [
    `Bonjour ${recipientName},`,
    "",
    "Votre paiement a bien été pris en compte.",
    "",
    `Document scolaire concerné : ${documentTitle}`,
    `Montant : ${formattedAmount} FCFA`,
    `Mode de paiement : ${paymentMode}`,
    `Numéro de reçu : ${receiptNumber}`,
    `Date du paiement : ${formattedDate}`,
    "",
    "Vous pouvez consulter et télécharger votre reçu depuis votre espace Paiements.",
    "",
    "Cordialement,",
    "DR-DOCSCOL",
  ].join("\n");

  await prisma.notification.create({
    data: {
      userId,
      typeNotification: "PAIEMENT_EFFECTUE",
      message: `Votre paiement de ${formattedAmount} FCFA pour ${documentTitle} a bien été pris en compte. Reçu : ${receiptNumber}.`,
    },
  });

  await sendTrackedMail({
    userId,
    to,
    subject,
    text,
    fromName: getDocumentSenderName(diplomeType),
  });
}

export async function notifyDocumentRetired({
  userId,
  to,
  documentTitle,
  diplomeType,
}: {
  userId: string;
  to: string;
  documentTitle: string;
  diplomeType: DiplomePrincipal;
}) {
  const subject = "Accusé de réception du document";
  const text = `Nous confirmons que le document scolaire ${documentTitle} a bien été récupéré.`;

  await prisma.notification.create({
    data: {
      userId,
      typeNotification: "DOCUMENT_RETIRE",
      message: text,
    },
  });

  await sendTrackedMail({
    userId,
    to,
    subject,
    text,
    fromName: getDocumentSenderName(diplomeType),
  });
}

export async function notifyAppointmentConfirmed({
  userId,
  to,
  documentTitle,
  diplomeType,
  documentType,
  date,
  time,
  location,
  recipientName,
}: {
  userId: string;
  to: string;
  documentTitle: string;
  diplomeType: DiplomePrincipal;
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
    items.push("Reçu de paiement du duplicata");
  }
  const text = [
    `Bonjour ${recipientName},`,
    `Votre rendez-vous de retrait est confirmé.`,
    `Document scolaire : ${documentTitle}`,
    `Date : ${formattedDate}`,
    `Heure : ${time}`,
    `Lieu : ${location}`,
    "Pièces à présenter :",
    ...items.map((item) => `- ${item}`),
  ].join("\n");

  await prisma.notification.create({
    data: {
      userId,
      typeNotification: "RENDEZ_VOUS_CONFIRME",
      message: text,
    },
  });

  await sendTrackedMail({
    userId,
    to,
    subject,
    text,
    fromName: getDocumentSenderName(diplomeType),
  });
}
