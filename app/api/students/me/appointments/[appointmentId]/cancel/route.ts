import { z } from "zod";

import { ACTIVE_RENDEZ_VOUS_STATUSES } from "@/lib/appointment-service";
import { ApiError, handleApiError, json, parseJson, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

const cancelSchema = z.object({
  motif: z.string().trim().max(250).optional(),
});

type RouteContext = {
  params: Promise<{ appointmentId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser("ELEVE");
    const { appointmentId } = await params;
    const input = await parseJson(request, cancelSchema);
    const appointment = await prisma.rendezVous.findFirst({
      where: {
        id: appointmentId,
        eleveId: user.id,
        statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES] },
      },
    });

    if (!appointment) {
      throw new ApiError("Rendez-vous introuvable ou deja cloture.", 404);
    }

    const updated = await prisma.rendezVous.update({
      where: { id: appointment.id },
      data: {
        statut: "ANNULE",
        commentaire: input.motif?.trim() || "Annulation eleve",
      },
    });

    return json({ appointment: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
