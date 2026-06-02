import {
  getAgentCentreExamen,
  getCentreExamenAppointmentWhere,
  normalizeAgentAppointmentFilter,
} from "@/lib/centre-examen-service";
import { getDocumentTitle } from "@/lib/appointment-service";
import { handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser("AGENT_CENTRE_EXAMEN");
    const centre = await getAgentCentreExamen(user);
    const url = new URL(request.url);
    const filter = normalizeAgentAppointmentFilter(url.searchParams.get("filter"));

    const appointments = await prisma.rendezVous.findMany({
      where: getCentreExamenAppointmentWhere(centre.region, filter),
      orderBy: [{ dateRdv: filter === "processed" ? "desc" : "asc" }, { heureRdv: "asc" }],
      include: {
        eleve: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            matricule: true,
          },
        },
        document: {
          select: {
            id: true,
            diplomeType: true,
            typeDocument: true,
            centreExamen: true,
            regionComposition: true,
          },
        },
        retraitConfirmePar: {
          select: {
            id: true,
            matricule: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return json({
      centre,
      filter,
      appointments: appointments.map((appointment) => ({
        id: appointment.id,
        dateRdv: appointment.dateRdv,
        heureRdv: appointment.heureRdv,
        lieu: appointment.lieu,
        statut: appointment.statut === "HONORE" ? "RETIRE" : "EN_ATTENTE",
        retraitConfirmeAt: appointment.retraitConfirmeAt,
        retraitConfirmePar: appointment.retraitConfirmePar,
        eleve: appointment.eleve,
        document: appointment.document
          ? {
              ...appointment.document,
              title: getDocumentTitle(appointment.document),
            }
          : null,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
