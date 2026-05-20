export type DocumentStatus = "PAS_DISPONIBLE" | "DISPONIBLE" | "RETIRE";

export type DocumentAppointment = {
  id: string;
  date: string;
  time: string;
  status: "PLANIFIE" | "CONFIRME" | "ANNULE";
};

export type DocumentItem = {
  id: string;
  title: string;
  status: DocumentStatus;
  location: string;
  updatedAt: string;
  appointment?: DocumentAppointment;
};

const DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-101",
    title: "Attestation de reussite",
    status: "DISPONIBLE",
    location: "Service scolarite - Batiment A",
    updatedAt: "2026-05-10T09:30:00Z",
  },
  {
    id: "doc-102",
    title: "Releve de notes",
    status: "PAS_DISPONIBLE",
    location: "Service scolarite - Batiment A",
    updatedAt: "2026-05-05T14:10:00Z",
  },
  {
    id: "doc-103",
    title: "Diplome provisoire",
    status: "DISPONIBLE",
    location: "Direction des examens",
    updatedAt: "2026-05-12T08:00:00Z",
    appointment: {
      id: "rdv-202",
      date: "2026-05-21",
      time: "10:00",
      status: "CONFIRME",
    },
  },
  {
    id: "doc-104",
    title: "Attestation de scolarite",
    status: "RETIRE",
    location: "Service scolarite - Batiment A",
    updatedAt: "2026-04-27T16:40:00Z",
    appointment: {
      id: "rdv-203",
      date: "2026-04-29",
      time: "15:30",
      status: "CONFIRME",
    },
  },
];

const STATUS_LABELS: Record<DocumentStatus, string> = {
  PAS_DISPONIBLE: "Pas disponible",
  DISPONIBLE: "Disponible",
  RETIRE: "Retire",
};

export const DOCUMENT_STATUSES: DocumentStatus[] = [
  "PAS_DISPONIBLE",
  "DISPONIBLE",
  "RETIRE",
];

export function getDocumentStatusLabel(status: DocumentStatus) {
  return STATUS_LABELS[status] ?? status;
}

export async function getStudentDocuments() {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return DOCUMENTS;
}
