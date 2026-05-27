import { z } from "zod";

import { getDocumentTitle } from "@/lib/appointment-service";
import { ApiError, getPageParams, handleApiError, json, parseJson, requireApiUser } from "@/lib/api-utils";
import { notifyDocumentRetired } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";

const withdrawalSchema = z.object({
  documentId: z.string().trim().min(10),
  appointmentId: z.string().trim().min(10).optional(),
  commentaire: z.string().trim().max(250).optional(),
});

export async function GET(request: Request) {
  try {
    await requireApiUser("ADMINISTRATEUR");
    const { page, limit, skip } = getPageParams(request);
    const [withdrawals, total] = await Promise.all([
      prisma.rendezVous.findMany({
        where: { statut: "HONORE" },
        orderBy: [{ updatedAt: "desc" }, { dateRdv: "desc" }],
        skip,
        take: limit,
        include: {
          eleve: {
            select: {
              id: true,
              matricule: true,
              email: true,
              nom: true,
              prenom: true,
            },
          },
          admin: {
            select: {
              id: true,
              matricule: true,
              nom: true,
              prenom: true,
            },
          },
          document: true,
        },
      }),
      prisma.rendezVous.count({ where: { statut: "HONORE" } }),
    ]);

    return json({ withdrawals, pagination: { page, limit, total } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireApiUser("ADMINISTRATEUR");
    const input = await parseJson(request, withdrawalSchema);
    const document = await prisma.documentAcademique.findUnique({
      where: { id: input.documentId },
      include: { eleve: true },
    });

    if (!document) {
      throw new ApiError("Document introuvable.", 404);
    }

    const now = new Date();
    const appointment = input.appointmentId
      ? await prisma.rendezVous.findFirst({
          where: {
            id: input.appointmentId,
            documentId: document.id,
          },
        })
      : await prisma.rendezVous.findFirst({
          where: {
            documentId: document.id,
            statut: { in: ["PLANIFIE", "CONFIRME"] },
          },
          orderBy: { dateRdv: "asc" },
        });

    const withdrawal = await prisma.$transaction(async (tx) => {
      await tx.documentAcademique.update({
        where: { id: document.id },
        data: { statut: "RETIRE" },
      });

      if (appointment) {
        return tx.rendezVous.update({
          where: { id: appointment.id },
          data: {
            statut: "HONORE",
            commentaire: input.commentaire?.trim() || appointment.commentaire || "Retrait physique confirme",
          },
        });
      }

      return tx.rendezVous.create({
        data: {
          adminId: admin.id,
          eleveId: document.eleveId,
          documentId: document.id,
          dateRdv: now,
          heureRdv: now.toTimeString().slice(0, 5),
          lieu: "Centre OBC",
          statut: "HONORE",
          commentaire: input.commentaire?.trim() || "Retrait physique confirme",
        },
      });
    });

    await notifyDocumentRetired({
      userId: document.eleve.id,
      to: document.eleve.email,
      documentTitle: getDocumentTitle(document),
    });

    return json({ withdrawal }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
