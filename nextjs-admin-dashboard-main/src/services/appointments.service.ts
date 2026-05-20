export type AppointmentStatus = "PLANIFIE" | "CONFIRME" | "ANNULE";

export type AppointmentItem = {
  id: string;
  documentId?: string;
  documentTitle: string;
  date: string;
  time: string;
  location: string;
  status: AppointmentStatus;
  agent: string;
  note?: string;
};

const APPOINTMENTS: AppointmentItem[] = [
  {
    id: "rdv-202",
    documentId: "doc-103",
    documentTitle: "Diplome provisoire",
    date: "2026-05-21",
    time: "10:00",
    location: "Direction des examens",
    status: "CONFIRME",
    agent: "Awa Diallo",
    note: "Merci d'apporter une piece d'identite.",
  },
  {
    id: "rdv-203",
    documentId: "doc-104",
    documentTitle: "Attestation de scolarite",
    date: "2026-04-29",
    time: "15:30",
    location: "Service scolarite - Batiment A",
    status: "CONFIRME",
    agent: "Samba Traore",
  },
  {
    id: "rdv-204",
    documentId: "doc-101",
    documentTitle: "Attestation de reussite",
    date: "2026-05-25",
    time: "09:00",
    location: "Service scolarite - Batiment A",
    status: "PLANIFIE",
    agent: "Fatou Ndiaye",
  },
];

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PLANIFIE: "Planifie",
  CONFIRME: "Confirme",
  ANNULE: "Annule",
};

export function getAppointmentStatusLabel(status: AppointmentStatus) {
  return STATUS_LABELS[status] ?? status;
}

export async function getStudentAppointments() {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return APPOINTMENTS;
}
