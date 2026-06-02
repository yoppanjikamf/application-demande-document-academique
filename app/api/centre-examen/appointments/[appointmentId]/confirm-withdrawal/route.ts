import { getAgentCentreExamen, isCentreExamenDocumentEligible } from "@/lib/centre-examen-service";
import { getDocumentTitle } from "@/lib/appointment-service";
import { ApiError, handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { notifyDocumentRetired } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

type RouteContext = {
  params: Promise<{ appointmentId: string }>;
};

export async function PATCH(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser("AGENT_CENTRE_EXAMEN");
    const centre = await getAgentCentreExamen(user);
    const { appointmentId } = await params;
    const confirmedAt = new Date();

    const appointment = await prisma.$transaction(
      async (tx) => {
        const current = await tx.rendezVous.findUnique({
          where: { id: appointmentId },
          include: {
            eleve: {
              select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                matricule: true,
              },
            },
            document: true,
          },
        });

        if (!current || !current.document) {
          throw new ApiError("Rendez-vous introuvable.", 404);
        }

        if (!isCentreExamenDocumentEligible(current.document, centre.region)) {
          throw new ApiError("Ce rendez-vous n'appartient pas a votre centre d'examen.", 403);
        }

        if (current.statut === "HONORE" || current.retraitConfirmeAt) {
          throw new ApiError("Ce retrait a deja ete confirme.", 409);
        }

        if (current.statut !== "PLANIFIE" && current.statut !== "CONFIRME") {
          throw new ApiError(
            "Seuls les rendez-vous planifies peuvent etre marques comme retires.",
            409,
          );
        }

        if (current.document.statut === "RETIRE") {
          throw new ApiError("Ce document est deja marque comme retire.", 409);
        }

        const updatedAppointment = await tx.rendezVous.update({
          where: { id: current.id },
          data: {
            statut: "HONORE",
            retraitConfirmeAt: confirmedAt,
            retraitConfirmeParId: user.id,
            commentaire: current.commentaire
              ? `${current.commentaire}\nRetrait confirme par ${user.matricule}.`
              : `Retrait confirme par ${user.matricule}.`,
          },
          include: {
            eleve: {
              select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                matricule: true,
              },
            },
            document: true,
          },
        });

        await tx.documentAcademique.update({
          where: { id: current.document.id },
          data: { statut: "RETIRE" },
        });

        await tx.auditLog.create({
          data: {
            action: "WITHDRAWAL_CONFIRMED_BY_CENTER_AGENT",
            resource: "DOCUMENT",
            resourceId: current.document.id,
            userId: user.id,
            details: JSON.stringify({
              rendezVousId: current.id,
              eleveId: current.eleveId,
              matriculeEleve: current.eleve.matricule,
              documentId: current.document.id,
              diplomeType: current.document.diplomeType,
              typeDocument: current.document.typeDocument,
              centreExamenId: centre.id,
              centreExamen: centre.nom,
              region: centre.region,
              agentId: user.id,
              agentMatricule: user.matricule,
              confirmedAt: confirmedAt.toISOString(),
            }),
          },
        });

        return updatedAppointment;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if (appointment.document) {
      await notifyDocumentRetired({
        userId: appointment.eleve.id,
        to: appointment.eleve.email,
        documentTitle: getDocumentTitle(appointment.document),
        diplomeType: appointment.document.diplomeType,
      }).catch((error) => {
        console.error("Impossible d'envoyer l'email de retrait confirme:", error);
      });
    }

    return json({
      appointment: {
        id: appointment.id,
        statut: "RETIRE",
        retraitConfirmeAt: appointment.retraitConfirmeAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
