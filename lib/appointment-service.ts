import { prisma } from "@/lib/prisma";
import { isDocumentRequestAllowed, resolveDocumentRoute } from "@/lib/document-routing";
import { resolvePickupRouteForDocument } from "@/lib/duplicata-service";
import type {
  DiplomePrincipal,
  DocumentAcademique,
  StatutDocument,
  TypeDocument,
} from "@/lib/generated/prisma/client";

export const ACTIVE_RENDEZ_VOUS_STATUSES = ["PLANIFIE", "CONFIRME"] as const;
export const OBC_SETTINGS_ID = "GLOBAL";

export type AppointmentSlot = {
  value: string;
  label: string;
  remaining: number;
  disabled: boolean;
};

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isBeforeToday(date: Date) {
  return startOfDay(date).getTime() < startOfDay(new Date()).getTime();
}

export function isBeforeTomorrow(date: Date) {
  const tomorrow = startOfDay(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return startOfDay(date).getTime() < tomorrow.getTime();
}

function annualHolidayKeys(date: Date) {
  const year = date.getFullYear();
  return new Set([
    `${year}-01-01`,
    `${year}-02-11`,
    `${year}-05-01`,
    `${year}-05-20`,
    `${year}-08-15`,
    `${year}-12-25`,
  ]);
}

export async function isHoliday(date: Date) {
  const key = formatDateKey(date);
  if (annualHolidayKeys(date).has(key)) {
    return true;
  }

  const holiday = await prisma.jourFerie.findFirst({
    where: {
      OR: [
        { date: { gte: startOfDay(date), lte: endOfDay(date) } },
        {
          annuel: true,
          date: {
            gte: new Date(2000, date.getMonth(), date.getDate()),
            lte: new Date(2000, date.getMonth(), date.getDate(), 23, 59, 59, 999),
          },
        },
      ],
    },
    select: { id: true },
  });

  return Boolean(holiday);
}

export async function getAppointmentSettings() {
  const settings = await prisma.parametreRendezVous.findUnique({
    where: { id: OBC_SETTINGS_ID },
  });

  if (settings) {
    return settings;
  }

  return prisma.parametreRendezVous.create({
    data: { id: OBC_SETTINGS_ID, quotaJournalier: 200, lieuObc: "Centre de retrait", allowWeekendBookings: false },
  });
}

export async function getActiveTimeSlots() {
  const slots = await prisma.creneauHoraire.findMany({
    where: { actif: true },
    orderBy: { heureDebut: "asc" },
  });

  if (slots.length > 0) {
    return slots;
  }

  return [
    { id: "slot-0800-1000", heureDebut: "08:00", heureFin: "10:00", actif: true },
    { id: "slot-1000-1200", heureDebut: "10:00", heureFin: "12:00", actif: true },
    { id: "slot-1400-1600", heureDebut: "14:00", heureFin: "16:00", actif: true },
  ];
}

export function getDocumentTitle(document: {
  diplomeType: DiplomePrincipal;
  typeDocument: TypeDocument;
}) {
  const diplome = document.diplomeType.replace("_", " ");
  if (document.typeDocument === "ORIGINAL") {
    return `Diplôme ${diplome}`;
  }
  if (document.typeDocument === "RELEVE_NOTES") {
    return `Relevé de notes du ${diplome}`;
  }
  return `Duplicata du ${diplome}`;
}

export function getStatusLabel(status: StatutDocument) {
  if (status === "PAS_DISPONIBLE") {
    return "Pas disponible";
  }
  if (status === "DISPONIBLE") {
    return "Disponible";
  }
  return "Retiré";
}

export async function getPickupLocation(
  document: Pick<DocumentAcademique, "diplomeType" | "typeDocument" | "centreExamen" | "regionComposition"> & {
    eleveId?: string;
    antenneRegionale?: { nom: string; ville: string | null; region: string } | null;
  },
) {
  if (document.eleveId && document.typeDocument === "DUPLICATA") {
    return (await resolvePickupRouteForDocument({
      eleveId: document.eleveId,
      diplomeType: document.diplomeType,
      typeDocument: document.typeDocument,
      centreExamen: document.centreExamen,
      regionComposition: document.regionComposition,
    })).location;
  }

  return resolveDocumentRoute(document).location;
}

export async function getAvailableSlots(date: Date): Promise<AppointmentSlot[]> {
  const slots = await getActiveTimeSlots();

  const settings = await getAppointmentSettings();

  if (
    isBeforeTomorrow(date) ||
    (isWeekend(date) && !settings.allowWeekendBookings) ||
    (await isHoliday(date))
  ) {
    return slots.map((slot) => ({
      value: `${slot.heureDebut}-${slot.heureFin}`,
      label: `${slot.heureDebut} - ${slot.heureFin}`,
      remaining: 0,
      disabled: true,
    }));
  }

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const appointments = await prisma.rendezVous.findMany({
    where: {
      dateRdv: { gte: dayStart, lte: dayEnd },
      statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES] },
    },
    select: { heureRdv: true },
  });

  const dailyRemaining = Math.max(0, settings.quotaJournalier - appointments.length);
  const slotCapacity = Math.max(1, Math.ceil(settings.quotaJournalier / Math.max(1, slots.length)));

  return slots.map((slot) => {
    const value = `${slot.heureDebut}-${slot.heureFin}`;
    const count = appointments.filter((appointment) => appointment.heureRdv === value).length;
    const remaining = Math.min(dailyRemaining, Math.max(0, slotCapacity - count));

    return {
      value,
      label: `${slot.heureDebut} - ${slot.heureFin}`,
      remaining,
      disabled: remaining <= 0,
    };
  });
}

export async function hasAvailableSlots(date: Date) {
  const slots = await getAvailableSlots(date);
  return slots.some((slot) => !slot.disabled);
}

export async function findNextAvailableAppointmentDate(startDate: Date, maxDays = 60) {
  const cursor = startOfDay(startDate);

  for (let offset = 0; offset <= maxDays; offset += 1) {
    const candidate = new Date(cursor);
    candidate.setDate(cursor.getDate() + offset);

    if (await hasAvailableSlots(candidate)) {
      return candidate;
    }
  }

  return null;
}

export async function ensureDocumentsForValidatedExams(eleveId: string) {
  const exams = await prisma.examenValide.findMany({
    where: { eleveId },
    orderBy: { createdAt: "asc" },
  });

  if (exams.length === 0) {
    return;
  }

  for (const exam of exams) {
    for (const typeDocument of ["ORIGINAL", "RELEVE_NOTES", "DUPLICATA"] as const) {
      if (!isDocumentRequestAllowed(exam.diplomeType, typeDocument)) {
        continue;
      }

      const route = resolveDocumentRoute({
        diplomeType: exam.diplomeType,
        typeDocument,
        centreExamen: exam.centreExamen,
        regionComposition: exam.regionComposition,
      });
      await prisma.documentAcademique.upsert({
        where: {
          eleveId_diplomeType_typeDocument: {
            eleveId,
            diplomeType: exam.diplomeType,
            typeDocument,
          },
        },
        update: {
          centreExamen: exam.centreExamen,
          regionComposition: exam.regionComposition ?? undefined,
          organismeId: route.organismeId,
          antenneRegionaleId: route.antenneRegionaleId,
        },
        create: {
          eleveId,
          diplomeType: exam.diplomeType,
          typeDocument,
          centreExamen: exam.centreExamen,
          regionComposition: exam.regionComposition,
          organismeId: route.organismeId,
          antenneRegionaleId: route.antenneRegionaleId,
          statut: "PAS_DISPONIBLE",
        },
      });
    }
  }
}
