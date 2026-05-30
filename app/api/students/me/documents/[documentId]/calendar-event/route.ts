import { ApiError, handleApiError, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

/**
 * Génère un identifiant unique iCalendar
 */
function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}@dr-docscol.app`;
}

/**
 * Formate une date en format iCalendar (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Échappe les caractères spéciaux pour iCalendar
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

function parseTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

function buildAppointmentDates(dateRdv: Date, heureRdv: string) {
  const [startRaw, endRaw] = heureRdv.split("-");
  const startTime = parseTime(startRaw);
  const endTime = endRaw ? parseTime(endRaw) : null;
  const startDate = new Date(dateRdv);

  if (startTime) {
    startDate.setHours(startTime.hours, startTime.minutes, 0, 0);
  }

  const endDate = new Date(startDate);
  if (endTime) {
    endDate.setHours(endTime.hours, endTime.minutes, 0, 0);
  } else {
    endDate.setHours(endDate.getHours() + 1);
  }

  if (endDate <= startDate) {
    endDate.setTime(startDate.getTime() + 60 * 60 * 1000);
  }

  return { startDate, endDate };
}

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser("ELEVE");
    const { documentId } = await params;

    // Récupérer le document et les rendez-vous associés
    const document = await prisma.documentAcademique.findFirst({
      where: { id: documentId, eleveId: user.id },
      include: {
        eleve: true,
        rendezVous: {
          where: { statut: { in: ["PLANIFIE", "CONFIRME"] } },
          orderBy: { dateRdv: "asc" },
          take: 1,
        },
      },
    });

    if (!document) {
      throw new ApiError("Document introuvable.", 404);
    }

    if (document.rendezVous.length === 0) {
      throw new ApiError(
        "Aucun rendez-vous planifié pour ce document. L'export calendrier n'est pas disponible.",
        422,
      );
    }

    const rdv = document.rendezVous[0];
    const { startDate, endDate } = buildAppointmentDates(rdv.dateRdv, rdv.heureRdv);

    // Construire le document iCalendar
    const uid = generateUID();
    const dtstamp = formatICalDate(new Date());
    const dtstart = formatICalDate(startDate);
    const dtend = formatICalDate(endDate);

    const documentTitle =
      document.diplomeType === "BEPC"
        ? `BEPC - ${document.typeDocument}`
        : document.diplomeType === "PROBATOIRE"
          ? `Probatoire - ${document.typeDocument}`
          : `Baccalauréat - ${document.typeDocument}`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DR-DOCSCOL//Gestion Documents//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:DR-DOCSCOL",
      "X-WR-TIMEZONE:Africa/Douala",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:Retrait - ${escapeICalText(documentTitle)}`,
      `DESCRIPTION:Rendez-vous de retrait pour ${escapeICalText(documentTitle)}\\nMatricule: ${escapeICalText(document.eleve.matricule)}\\nLieu: ${escapeICalText(rdv.lieu)}${rdv.commentaire ? `\\nCommentaire: ${escapeICalText(rdv.commentaire)}` : ""}`,
      `LOCATION:${escapeICalText(rdv.lieu)}`,
      `STATUS:${rdv.statut === "CONFIRME" ? "CONFIRMED" : "TENTATIVE"}`,
      `ATTENDEE;CN=${escapeICalText(document.eleve.prenom)} ${escapeICalText(document.eleve.nom)}:mailto:${document.eleve.email}`,
      "TRANSP:OPAQUE",
      `CREATED:${dtstamp}`,
      `LAST-MODIFIED:${dtstamp}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    // Retourner le fichier .ics
    const response = new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="rendez-vous-${document.id}.ics"`,
      },
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
