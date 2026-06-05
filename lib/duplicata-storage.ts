import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TypePieceDuplicata } from "@/lib/generated/prisma/client";

export const DUPLICATA_BUCKET = "duplicata-documents";
export const MAX_DUPLICATA_FILE_SIZE = 10 * 1024 * 1024;

export const DUPLICATA_REQUIRED_PIECES: Array<{
  type: TypePieceDuplicata;
  label: string;
  description: string;
}> = [
  {
    type: "DECLARATION_PERTE",
    label: "Déclaration de perte",
    description: "Document déclarant la perte du relevé ou du diplôme.",
  },
  {
    type: "CNI",
    label: "Photocopie de la CNI",
    description: "Photocopie de la carte nationale d'identité.",
  },
  {
    type: "DEMANDE_ADRESSEE_DG_OBC",
    label: "Demande adressée au Directeur Général de l'OBC",
    description: "Demande manuscrite ou saisie adressée au DG de l'Office du Baccalauréat.",
  },
  {
    type: "DECHARGE_BORDEREAU_REUSSITE",
    label: "Décharge du bordereau de réussite",
    description: "Photocopie attestant que le diplôme a bel et bien été retiré.",
  },
];

const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

const EXTENSIONS_BY_MIME_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function getDuplicataPieceLabel(type: TypePieceDuplicata) {
  return DUPLICATA_REQUIRED_PIECES.find((piece) => piece.type === type)?.label ?? type;
}

export function validateDuplicataFile(file: File, label: string) {
  if (!file.name || file.size <= 0) {
    throw new Error(`${label}: fichier manquant.`);
  }

  if (file.size > MAX_DUPLICATA_FILE_SIZE) {
    throw new Error(`${label}: le fichier ne doit pas dépasser 10 Mo.`);
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`${label}: seuls les fichiers PDF, JPG, PNG ou WEBP sont acceptés.`);
  }
}

export async function ensureDuplicataBucket() {
  const supabase = createSupabaseAdminClient();
  const { data: bucket, error: readError } = await supabase.storage.getBucket(DUPLICATA_BUCKET);

  if (bucket) {
    return;
  }

  if (readError && readError.message !== "The resource was not found") {
    throw readError;
  }

  const { error } = await supabase.storage.createBucket(DUPLICATA_BUCKET, {
    public: false,
    fileSizeLimit: MAX_DUPLICATA_FILE_SIZE,
    allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
  });

  if (error) {
    throw error;
  }
}

export async function uploadDuplicataPiece({
  userId,
  duplicataId,
  typePiece,
  file,
}: {
  userId: string;
  duplicataId: string;
  typePiece: TypePieceDuplicata;
  file: File;
}) {
  validateDuplicataFile(file, getDuplicataPieceLabel(typePiece));
  await ensureDuplicataBucket();

  const supabase = createSupabaseAdminClient();
  const extension = EXTENSIONS_BY_MIME_TYPE[file.type] ?? "bin";
  const safeName = sanitizeFileName(file.name);
  const path = `duplicata/${userId}/${duplicataId}/${typePiece}-${Date.now()}-${safeName || `piece.${extension}`}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(DUPLICATA_BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return {
    bucket: DUPLICATA_BUCKET,
    path,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

export async function createDuplicataSignedUrl(path: string, expiresIn = 60 * 10) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(DUPLICATA_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
