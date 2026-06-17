export const CSV_FIELDS = [
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

export type CsvField = (typeof CSV_FIELDS)[number];

export type CsvRow = {
  lineNumber: number;
  values: Partial<Record<CsvField, string>>;
};

export type ParsedCsv = {
  rows: CsvRow[];
  missingRequiredFields: CsvField[];
};

export const CSV_FIELD_LABELS: Record<CsvField, string> = {
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

export function parseAdminCsv(text: string, requiredFields: readonly CsvField[]): ParsedCsv {
  const normalizedText = text.replace(/^\uFEFF/, "");
  const delimiter = detectCsvDelimiter(normalizedText);
  const records = parseCsvRecords(normalizedText, delimiter).filter((record) =>
    record.some((cell) => cell.trim()),
  );

  if (records.length < 2) {
    return { rows: [], missingRequiredFields: requiredFields.slice() };
  }

  const headers = records[0].map((header) => header.trim());
  const fieldsByIndex = headers.map(resolveCsvField);
  const missingRequiredFields = requiredFields.filter((field) => !fieldsByIndex.includes(field));

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

export function getCsvValue(row: CsvRow, field: CsvField) {
  return row.values[field] ?? "";
}

export function getRowLabel(row: CsvRow, matricule?: string) {
  return `Ligne ${row.lineNumber}${matricule ? ` (${matricule})` : ""}`;
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

export function parseCsvDate(value: string) {
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

export function normalizeCsvText(value: string) {
  return value.trim();
}

export function normalizeCsvUpper(value: string) {
  return value.trim().toUpperCase();
}
