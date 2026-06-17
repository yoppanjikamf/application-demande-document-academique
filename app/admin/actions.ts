"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { OBC_SETTINGS_ID } from "@/lib/appointment-service";
import { getCurrentUser } from "@/lib/auth";
import {
  ORGANISME_IDS,
  getAdminDocumentScope,
  isDocumentRequestAllowed,
} from "@/lib/document-routing";
import { DUPLICATA_REQUIRED_PIECES } from "@/lib/duplicata-storage";
import { importDocumentAvailabilityFromCsv } from "@/lib/document-availability-import";
import { applyDocumentStatusTransition } from "@/lib/document-status-transition";
import { createNotification } from "@/lib/notification-service";
import { prisma } from "@/lib/prisma";
import {
  parseImportDiplomeType,
  parseImportDocumentType,
  upsertStudentImportRow,
  type StudentImportRow,
} from "@/lib/admin-student-import";
import {
  adminManualStudentSchema,
  adminQuotaSchema,
  documentStatusUpdateSchema,
} from "@/lib/validations";
import { Role, StatutDocument } from "@/lib/generated/prisma/client";

const CSV_FIELDS = [
  "eleve_matricule",
  "eleve_email",
  "eleve_nom",
  "eleve_prenom",
  "eleve_date_naissance",
  "diplome_type",
  "annee_session",
  "centre_examen",
  "region_composition",
  "document_type",
  "document_statut",
] as const;

type CsvField = (typeof CSV_FIELDS)[number];
type CsvRow = {
  lineNumber: number;
  values: Partial<Record<CsvField, string>>;
};

type ParsedCsv = {
  rows: CsvRow[];
  missingRequiredFields: CsvField[];
};

type ImportCsvResult = {
  rowsCount: number;
  documentsCount: number;
};

type ImportAdminUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

const REQUIRED_IMPORT_FIELDS: readonly CsvField[] = [
  "eleve_matricule",
  "eleve_email",
  "eleve_nom",
  "eleve_prenom",
];

const CSV_FIELD_LABELS: Record<CsvField, string> = {
  eleve_matricule: "matricule élève",
  eleve_email: "email élève",
  eleve_nom: "nom élève",
  eleve_prenom: "prénom élève",
  eleve_date_naissance: "date de naissance",
  diplome_type: "type de diplôme",
  annee_session: "année de session",
  centre_examen: "centre d'examen",
  region_composition: "région de composition",
  document_type: "type de document",
  document_statut: "statut du document",
};

const CSV_FIELD_ALIASES: Record<CsvField, readonly string[]> = {
  eleve_matricule: [
    "eleve_matricule",
    "matricule_eleve",
    "matricule",
    "numero_matricule",
    "student_id",
    "id_eleve",
  ],
  eleve_email: ["eleve_email", "email_eleve", "email", "mail", "courriel", "adresse_email"],
  eleve_nom: ["eleve_nom", "nom_eleve", "nom", "lastname", "surname", "family_name"],
  eleve_prenom: ["eleve_prenom", "prenom_eleve", "prenom", "first_name", "given_name"],
  eleve_date_naissance: [
    "eleve_date_naissance",
    "date_naissance",
    "naissance",
    "date_de_naissance",
    "dob",
  ],
  diplome_type: ["diplome_type", "type_diplome", "diplome", "examen", "type_examen"],
  annee_session: ["annee_session", "session", "annee", "year", "annee_examen"],
  centre_examen: ["centre_examen", "centre_d_examen", "centre", "etablissement"],
  region_composition: ["region_composition", "region_de_composition", "region", "region_examen"],
  document_type: ["document_type", "type_document", "document", "type_doc"],
  document_statut: [
    "document_statut",
    "statut_document",
    "statut_du_document",
    "statut",
    "disponibilite",
  ],
};

function normalizeKey(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function detectCsvDelimiter(text: string) {
  const candidates = [",", ";", "\t"] as const;
  const counts = new Map<string, number>(candidates.map((delimiter) => [delimiter, 0]));
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      break;
    }

    if (!inQuotes && counts.has(char)) {
      counts.set(char, (counts.get(char) ?? 0) + 1);
    }
  }

  return candidates.reduce((best, delimiter) =>
    (counts.get(delimiter) ?? 0) > (counts.get(best) ?? 0) ? delimiter : best,
  );
}

function parseCsvRecords(text: string, delimiter: string) {
  const records: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      row.push(cell);
      records.push(row);
      row = [];
      cell = "";

      if (char === "\r" && next === "\n") {
        index += 1;
      }
      continue;
    }

    cell += char;
  }

  if (cell || row.length > 0) {
    row.push(cell);
    records.push(row);
  }

  return records;
}

function resolveCsvField(header: string): CsvField | null {
  const key = normalizeKey(header);

  for (const field of CSV_FIELDS) {
    if (CSV_FIELD_ALIASES[field].map(normalizeKey).includes(key)) {
      return field;
    }
  }

  if (key.includes("matricule")) {
    return "eleve_matricule";
  }
  if (key.includes("mail") || key.includes("courriel")) {
    return "eleve_email";
  }
  if ((key.includes("prenom") || key.includes("first")) && !key.includes("admin")) {
    return "eleve_prenom";
  }
  if (
    (key === "nom" || key.includes("nom_eleve") || key.includes("last")) &&
    !key.includes("admin")
  ) {
    return "eleve_nom";
  }
  if (key.includes("naissance") || key === "dob") {
    return "eleve_date_naissance";
  }
  if (key.includes("diplome") || key.includes("examen")) {
    return key.includes("centre") ? "centre_examen" : "diplome_type";
  }
  if (key.includes("region")) {
    return "region_composition";
  }
  if (key.includes("document") || key.includes("doc")) {
    return key.includes("statut") ? "document_statut" : "document_type";
  }

  return null;
}

function parseCsv(text: string): ParsedCsv {
  const normalizedText = text.replace(/^\uFEFF/, "");
  const delimiter = detectCsvDelimiter(normalizedText);
  const records = parseCsvRecords(normalizedText, delimiter).filter((record) =>
    record.some((cell) => cell.trim()),
  );

  if (records.length < 2) {
    return { rows: [], missingRequiredFields: REQUIRED_IMPORT_FIELDS.slice() };
  }

  const headers = records[0].map((header) => header.trim());
  const fieldsByIndex = headers.map(resolveCsvField);
  const missingRequiredFields = REQUIRED_IMPORT_FIELDS.filter(
    (field) => !fieldsByIndex.includes(field),
  );

  const rows = records.slice(1).map((record, index) => {
    const values: Partial<Record<CsvField, string>> = {};

    fieldsByIndex.forEach((field, fieldIndex) => {
      if (!field) {
        return;
      }

      const value = (record[fieldIndex] ?? "").trim();
      if (value || !values[field]) {
        values[field] = value;
      }
    });

    return {
      lineNumber: index + 2,
      values,
    };
  });

  return { rows, missingRequiredFields };
}

function buildUtcDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split(/[-/.]/).map(Number);
    return buildUtcDate(year, month, day);
  }

  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(trimmed)) {
    const [day, month, rawYear] = trimmed.split(/[-/.]/).map(Number);
    const year = rawYear < 100 ? 2000 + rawYear : rawYear;
    return buildUtcDate(year, month, day);
  }

  if (/^\d+([.,]\d+)?$/.test(trimmed)) {
    const serial = Number(trimmed.replace(",", "."));
    if (serial > 20000 && serial < 100000) {
      return new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86_400_000);
    }
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalize(value: string) {
  return value.trim();
}

function normalizeUpper(value: string) {
  return value.trim().toUpperCase();
}

function getCsvValue(row: CsvRow, field: CsvField) {
  return row.values[field] ?? "";
}

function getRowLabel(row: CsvRow, matricule?: string) {
  return `Ligne ${row.lineNumber}${matricule ? ` (${matricule})` : ""}`;
}

function requireImportErrorUrl(message: string) {
  const params = new URLSearchParams({
    importStatus: "error",
    importMessage: message,
  });

  return `/admin/students?${params.toString()}`;
}

function getImportSuccessUrl(rowsCount: number, documentsCount: number) {
  const params = new URLSearchParams({
    importStatus: "success",
    importMessage: `${rowsCount} élève(s) traité(s) et ${documentsCount} document(s) enregistré(s) en attente. Utilisez l'import de disponibilisation pour passer les documents à Disponible.`,
  });

  return `/admin/students?${params.toString()}`;
}

function getManualStudentSuccessUrl(matricule: string) {
  const params = new URLSearchParams({
    manualStatus: "success",
    manualMessage: `Élève ${matricule} enregistré avec succès.`,
  });

  return `/admin/students?${params.toString()}`;
}

function getManualStudentErrorUrl(message: string) {
  const params = new URLSearchParams({
    manualStatus: "error",
    manualMessage: message,
  });

  return `/admin/students?${params.toString()}`;
}

function assertObcAdmin(user: { role: Role; organismeId: string | null }) {
  if (user.role !== "ADMINISTRATEUR" || user.organismeId !== ORGANISME_IDS.OBC) {
    throw new Error("Outil reserve aux administrateurs OBC.");
  }
}

function getAdminDuplicataScope(user: {
  organismeId: string | null;
  antenneRegionaleId: string | null;
}) {
  return {
    ...(user.organismeId ? { organismeId: user.organismeId } : {}),
    ...(user.antenneRegionaleId ? { antenneRegionaleId: user.antenneRegionaleId } : {}),
  };
}

export async function updateAdminQuotaAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }
  assertObcAdmin(user);

  const parsed = adminQuotaSchema.safeParse({
    quotaJournalier: formData.get("quotaJournalier"),
  });

  if (!parsed.success) {
    throw new Error("Quota invalide.");
  }

  const oldSettings = await prisma.parametreRendezVous.findUnique({
    where: { id: OBC_SETTINGS_ID },
  });

  await prisma.parametreRendezVous.upsert({
    where: { id: OBC_SETTINGS_ID },
    update: { quotaJournalier: parsed.data.quotaJournalier },
    create: {
      id: OBC_SETTINGS_ID,
      quotaJournalier: parsed.data.quotaJournalier,
      lieuObc: "Centre de retrait",
    },
  });

  // Créer un log d'audit
  await prisma.auditLog
    .create({
      data: {
        action: "QUOTA_CHANGED",
        resource: "PARAMETER",
        resourceId: OBC_SETTINGS_ID,
        userId: user.id,
        details: JSON.stringify({
          previousQuota: oldSettings?.quotaJournalier || null,
          newQuota: parsed.data.quotaJournalier,
        }),
      },
    })
    .catch((err) => {
      console.error("Failed to create audit log:", err);
    });

  revalidatePath("/admin/rdv-disponibilites");
}

export async function upsertHolidayAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }
  assertObcAdmin(user);

  const dateStr = String(formData.get("date") ?? "");
  const nom = String(formData.get("nom") ?? "Jour férié");
  if (!dateStr) {
    throw new Error("Date manquante.");
  }

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  await prisma.jourFerie.upsert({
    where: { date },
    update: { nom },
    create: { date, nom, annuel: false },
  });

  revalidatePath("/admin/rdv-disponibilites");
}

export async function deleteHolidayAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }
  assertObcAdmin(user);

  const dateStr = String(formData.get("date") ?? "");
  if (!dateStr) {
    throw new Error("Date manquante.");
  }

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  await prisma.jourFerie.deleteMany({ where: { date } });
  revalidatePath("/admin/rdv-disponibilites");
}

export async function toggleWeekendBookingsAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }
  assertObcAdmin(user);

  const allow = String(formData.get("allow")) === "true";

  await prisma.parametreRendezVous.upsert({
    where: { id: OBC_SETTINGS_ID },
    update: { allowWeekendBookings: allow },
    create: {
      id: OBC_SETTINGS_ID,
      quotaJournalier: 200,
      lieuObc: "Centre de retrait",
      allowWeekendBookings: allow,
    },
  });

  revalidatePath("/admin/rdv-disponibilites");
}

export async function updateDocumentStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }

  const parsed = documentStatusUpdateSchema.safeParse({
    documentId: formData.get("documentId"),
    statut: formData.get("statut"),
  });

  if (!parsed.success) {
    throw new Error("Demande invalide.");
  }

  const document = await prisma.documentAcademique.findFirst({
    where: { id: parsed.data.documentId, ...getAdminDocumentScope(user) },
    include: { eleve: true },
  });

  if (!document) {
    throw new Error("Document introuvable.");
  }

  if (!isDocumentRequestAllowed(document.diplomeType, document.typeDocument)) {
    throw new Error("Le Probatoire ne donne pas lieu à la délivrance d'un diplôme.");
  }

  const nextStatus = parsed.data.statut;

  try {
    await applyDocumentStatusTransition({
      document,
      nextStatus,
      adminUserId: user.id,
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error("Mise à jour impossible.");
  }

  revalidatePath("/admin/documents");
  revalidatePath("/dashboard/documents");
}

export async function importDocumentAvailabilityAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(getAvailabilityImportErrorUrl("Fichier CSV manquant."));
  }

  let result;
  try {
    result = await importDocumentAvailabilityFromCsv(await file.text(), user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import impossible.";
    redirect(getAvailabilityImportErrorUrl(message));
  }

  if (result.updated === 0 && result.errors.length > 0) {
    redirect(
      getAvailabilityImportErrorUrl(
        `Aucune disponibilisation effectuée. ${result.errors.slice(0, 3).join(" ")}`,
      ),
    );
  }

  revalidatePath("/admin/documents");
  revalidatePath("/admin/students");
  revalidatePath("/dashboard/documents");

  const errorSuffix =
    result.errors.length > 0
      ? ` ${result.errors.length} ligne(s) en erreur (voir détail ci-dessous).`
      : "";

  redirect(
    getAvailabilityImportSuccessUrl(
      `${result.updated} document(s) disponibilise(s), ${result.notified} notification(s) envoyee(s), ${result.alreadyAvailable} deja disponible(s).${errorSuffix}`,
      result.errors,
    ),
  );
}

function getAvailabilityImportErrorUrl(message: string) {
  const params = new URLSearchParams({
    availStatus: "error",
    availMessage: message,
  });
  return `/admin/students?${params.toString()}`;
}

function getAvailabilityImportSuccessUrl(message: string, errors: string[]) {
  const params = new URLSearchParams({
    availStatus: "success",
    availMessage: message,
  });

  if (errors.length > 0) {
    params.set("availErrors", errors.slice(0, 10).join(" | "));
  }

  return `/admin/students?${params.toString()}`;
}

export async function updateDuplicataPieceReviewAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }

  const pieceId = String(formData.get("pieceId") ?? "");
  const statut = String(formData.get("statut") ?? "");
  const commentaire = String(formData.get("commentaire") ?? "").trim();

  if (!pieceId || (statut !== "VALIDEE" && statut !== "REJETEE")) {
    throw new Error("Analyse de pièce invalide.");
  }

  const piece = await prisma.pieceDuplicata.findFirst({
    where: {
      id: pieceId,
      duplicata: { is: getAdminDuplicataScope(user) },
    },
    include: {
      duplicata: { include: { eleve: true } },
    },
  });

  if (!piece) {
    throw new Error("Pièce introuvable.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.pieceDuplicata.update({
      where: { id: piece.id },
      data: {
        statut,
        commentaire: commentaire || null,
        validatedAt: new Date(),
        validatedById: user.id,
      },
    });

    await tx.duplicata.update({
      where: { id: piece.duplicataId },
      data: {
        statutValidation: "EN_ANALYSE",
        analysedById: user.id,
        analysedAt: new Date(),
      },
    });
  });

  await prisma.auditLog.create({
    data: {
      action: "DUPLICATA_PIECE_REVIEWED",
      resource: "DUPLICATA",
      resourceId: piece.duplicataId,
      userId: user.id,
      details: JSON.stringify({
        duplicataId: piece.duplicataId,
        pieceId: piece.id,
        typePiece: piece.typePiece,
        statut,
        commentaire: commentaire || null,
      }),
    },
  });

  revalidatePath("/admin/documents");
}

export async function validateDuplicataRequestAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }

  const duplicataId = String(formData.get("duplicataId") ?? "");
  if (!duplicataId) {
    throw new Error("Demande de duplicata introuvable.");
  }

  const duplicata = await prisma.duplicata.findFirst({
    where: { id: duplicataId, ...getAdminDuplicataScope(user) },
    include: { pieces: true, eleve: true },
  });

  if (!duplicata) {
    throw new Error("Demande de duplicata introuvable.");
  }

  const validatedTypes = new Set(
    duplicata.pieces.filter((piece) => piece.statut === "VALIDEE").map((piece) => piece.typePiece),
  );
  const missing = DUPLICATA_REQUIRED_PIECES.filter((piece) => !validatedTypes.has(piece.type));

  if (missing.length > 0) {
    throw new Error(
      `Validation impossible. Pièces non validées: ${missing.map((piece) => piece.label).join(", ")}.`,
    );
  }

  await prisma.duplicata.update({
    where: { id: duplicata.id },
    data: {
      statutValidation: "VALIDEE",
      motifRejet: null,
      analysedById: user.id,
      analysedAt: new Date(),
    },
  });

  await createNotification({
    userId: duplicata.eleveId,
    typeNotification: "DUPLICATA_DOSSIER_VALIDE",
    title: "Dossier de duplicata validé",
    message:
      "Votre dossier de demande de duplicata a été validé par l'administration. Vous serez notifié dès que le duplicata sera prêt.",
    actionUrl: "/dashboard/documents",
    metadata: { duplicataId: duplicata.id },
  });

  await prisma.auditLog.create({
    data: {
      action: "DUPLICATA_REQUEST_VALIDATED",
      resource: "DUPLICATA",
      resourceId: duplicata.id,
      userId: user.id,
      details: JSON.stringify({
        duplicataId: duplicata.id,
        eleveId: duplicata.eleveId,
        eleveMatricule: duplicata.eleve.matricule,
      }),
    },
  });

  revalidatePath("/admin/documents");
}

export async function rejectDuplicataRequestAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }

  const duplicataId = String(formData.get("duplicataId") ?? "");
  const motifRejet = String(formData.get("motifRejet") ?? "").trim();

  if (!duplicataId || motifRejet.length < 5) {
    throw new Error("Veuillez renseigner un motif de rejet clair.");
  }

  const duplicata = await prisma.duplicata.findFirst({
    where: { id: duplicataId, ...getAdminDuplicataScope(user) },
    include: { eleve: true },
  });

  if (!duplicata) {
    throw new Error("Demande de duplicata introuvable.");
  }

  await prisma.duplicata.update({
    where: { id: duplicata.id },
    data: {
      statutValidation: "REJETEE",
      motifRejet,
      analysedById: user.id,
      analysedAt: new Date(),
    },
  });

  await createNotification({
    userId: duplicata.eleveId,
    typeNotification: "DUPLICATA_DOSSIER_REJETE",
    title: "Dossier de duplicata rejeté",
    message: `Votre dossier de demande de duplicata a été rejeté. Motif: ${motifRejet}`,
    actionUrl: "/dashboard/documents",
    metadata: { duplicataId: duplicata.id, motifRejet },
  });

  await prisma.auditLog.create({
    data: {
      action: "DUPLICATA_REQUEST_REJECTED",
      resource: "DUPLICATA",
      resourceId: duplicata.id,
      userId: user.id,
      details: JSON.stringify({
        duplicataId: duplicata.id,
        eleveId: duplicata.eleveId,
        eleveMatricule: duplicata.eleve.matricule,
        motifRejet,
      }),
    },
  });

  revalidatePath("/admin/documents");
}

export async function importTestDataFromCsv(
  formData: FormData,
  user: ImportAdminUser,
): Promise<ImportCsvResult> {
  if (user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }

  let importedRowsCount = 0;
  let importedDocumentsCount = 0;

  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("Fichier CSV manquant.");
    }

    const content = await file.text();
    const { rows, missingRequiredFields } = parseCsv(content);

    if (rows.length === 0) {
      throw new Error("CSV vide ou invalide.");
    }

    if (missingRequiredFields.length > 0) {
      const missingLabels = missingRequiredFields
        .map((field) => CSV_FIELD_LABELS[field])
        .join(", ");
      throw new Error(`Colonnes obligatoires non reconnues : ${missingLabels}.`);
    }

    for (const row of rows) {
      const matricule = normalizeUpper(getCsvValue(row, "eleve_matricule"));
      const rowLabel = getRowLabel(row, matricule);
      const diplomeValue = getCsvValue(row, "diplome_type");
      const typeDocumentValue = getCsvValue(row, "document_type");
      const sessionValue = getCsvValue(row, "annee_session");
      const parsedSession = sessionValue ? Number(sessionValue) : null;

      const importRow: StudentImportRow = {
        matricule,
        email: normalize(getCsvValue(row, "eleve_email")).toLowerCase(),
        nom: normalize(getCsvValue(row, "eleve_nom")),
        prenom: normalize(getCsvValue(row, "eleve_prenom")),
        dateNaissance: parseDate(getCsvValue(row, "eleve_date_naissance")),
        diplomeType: diplomeValue ? (parseImportDiplomeType(diplomeValue) ?? undefined) : undefined,
        anneeSession:
          parsedSession && !Number.isNaN(parsedSession) ? Math.trunc(parsedSession) : null,
        centreExamen: normalize(getCsvValue(row, "centre_examen")) || undefined,
        regionComposition: normalize(getCsvValue(row, "region_composition") || "Centre"),
      };

      if (importRow.diplomeType === undefined && diplomeValue) {
        throw new Error(`${rowLabel}: type de diplôme invalide "${diplomeValue}".`);
      }

      if (typeDocumentValue) {
        const type = parseImportDocumentType(typeDocumentValue);

        if (!type) {
          throw new Error(`${rowLabel}: type de document invalide "${typeDocumentValue}".`);
        }
        if (!importRow.diplomeType) {
          throw new Error(
            `${rowLabel}: diplome_type est obligatoire lorsque document_type est renseigné.`,
          );
        }

        importRow.documentType = type;
        importRow.documentStatut = StatutDocument.PAS_DISPONIBLE;
      }

      const result = await upsertStudentImportRow(user, importRow, rowLabel);
      importedRowsCount += 1;
      if (result.documentCreated) {
        importedDocumentsCount += 1;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import CSV impossible.";
    throw new Error(message);
  }

  revalidatePath("/admin/documents");
  revalidatePath("/admin/students");
  revalidatePath("/admin");
  return {
    rowsCount: importedRowsCount,
    documentsCount: importedDocumentsCount,
  };
}

export async function createManualStudentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }

  const parsed = adminManualStudentSchema.safeParse({
    matricule: formData.get("matricule"),
    email: formData.get("email"),
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    dateNaissance: formData.get("dateNaissance") || undefined,
    diplomeType: formData.get("diplomeType"),
    anneeSession: formData.get("anneeSession") || undefined,
    centreExamen: formData.get("centreExamen"),
    regionComposition: formData.get("regionComposition"),
    documentType: formData.get("documentType") || undefined,
    documentStatut: formData.get("documentStatut") || undefined,
  });

  if (!parsed.success) {
    redirect(getManualStudentErrorUrl("Formulaire invalide. Vérifiez les champs obligatoires."));
  }

  const dateNaissance = parsed.data.dateNaissance ? new Date(parsed.data.dateNaissance) : null;

  if (dateNaissance && Number.isNaN(dateNaissance.getTime())) {
    redirect(getManualStudentErrorUrl("Date de naissance invalide."));
  }

  try {
    await upsertStudentImportRow(
      user,
      {
        matricule: parsed.data.matricule,
        email: parsed.data.email,
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        dateNaissance,
        diplomeType: parsed.data.diplomeType,
        anneeSession: parsed.data.anneeSession ?? null,
        centreExamen: parsed.data.centreExamen,
        regionComposition: parsed.data.regionComposition,
        documentType: parsed.data.documentType,
        documentStatut: parsed.data.documentStatut,
      },
      "Ajout manuel",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Enregistrement impossible.";
    redirect(getManualStudentErrorUrl(message));
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/documents");
  revalidatePath("/admin");
  redirect(getManualStudentSuccessUrl(parsed.data.matricule.toUpperCase()));
}

export async function importTestDataAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }

  let result: ImportCsvResult;
  try {
    result = await importTestDataFromCsv(formData, user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import CSV impossible.";
    redirect(requireImportErrorUrl(message));
  }

  redirect(getImportSuccessUrl(result.rowsCount, result.documentsCount));
}

export async function cancelAppointmentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    throw new Error("Accès refusé.");
  }
  assertObcAdmin(user);

  const rendezVousId = String(formData.get("rendezVousId") ?? "");
  if (!rendezVousId) {
    throw new Error("Rendez-vous manquant.");
  }

  await prisma.rendezVous.updateMany({
    where: { id: rendezVousId, document: { is: getAdminDocumentScope(user) } },
    data: {
      statut: "ANNULE",
      commentaire: "Annulation par le service administratif",
    },
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}
