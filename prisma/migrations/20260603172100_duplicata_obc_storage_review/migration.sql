-- CreateEnum
CREATE TYPE "StatutValidationDuplicata" AS ENUM ('SOUMISE', 'EN_ANALYSE', 'VALIDEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "TypePieceDuplicata" AS ENUM ('DECLARATION_PERTE', 'CNI', 'DEMANDE_ADRESSEE_DG_OBC', 'DECHARGE_BORDEREAU_REUSSITE');

-- CreateEnum
CREATE TYPE "StatutPieceDuplicata" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REJETEE');

-- AlterTable
ALTER TABLE "duplicatas" ADD COLUMN     "analysedAt" TIMESTAMP(3),
ADD COLUMN     "analysedById" TEXT,
ADD COLUMN     "motifRejet" TEXT,
ADD COLUMN     "statutValidation" "StatutValidationDuplicata" NOT NULL DEFAULT 'SOUMISE';

-- CreateTable
CREATE TABLE "pieces_duplicata" (
    "id" TEXT NOT NULL,
    "typePiece" "TypePieceDuplicata" NOT NULL,
    "statut" "StatutPieceDuplicata" NOT NULL DEFAULT 'EN_ATTENTE',
    "bucket" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "commentaire" TEXT,
    "validatedAt" TIMESTAMP(3),
    "validatedById" TEXT,
    "duplicataId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pieces_duplicata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pieces_duplicata_duplicataId_idx" ON "pieces_duplicata"("duplicataId");

-- CreateIndex
CREATE INDEX "pieces_duplicata_typePiece_idx" ON "pieces_duplicata"("typePiece");

-- CreateIndex
CREATE INDEX "pieces_duplicata_statut_idx" ON "pieces_duplicata"("statut");

-- CreateIndex
CREATE INDEX "pieces_duplicata_validatedById_idx" ON "pieces_duplicata"("validatedById");

-- CreateIndex
CREATE UNIQUE INDEX "pieces_duplicata_duplicataId_typePiece_key" ON "pieces_duplicata"("duplicataId", "typePiece");

-- CreateIndex
CREATE INDEX "duplicatas_statutValidation_idx" ON "duplicatas"("statutValidation");

-- CreateIndex
CREATE INDEX "duplicatas_analysedById_idx" ON "duplicatas"("analysedById");

-- AddForeignKey
ALTER TABLE "duplicatas" ADD CONSTRAINT "duplicatas_analysedById_fkey" FOREIGN KEY ("analysedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieces_duplicata" ADD CONSTRAINT "pieces_duplicata_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieces_duplicata" ADD CONSTRAINT "pieces_duplicata_duplicataId_fkey" FOREIGN KEY ("duplicataId") REFERENCES "duplicatas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase Storage bucket for official OBC duplicata request documents.
-- Files are private and accessed only through server-generated signed URLs.
DO $$
BEGIN
    IF to_regclass('storage.buckets') IS NOT NULL THEN
        INSERT INTO storage.buckets (
            id,
            name,
            public,
            file_size_limit,
            allowed_mime_types
        )
        VALUES (
            'duplicata-documents',
            'duplicata-documents',
            false,
            10485760,
            ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[]
        )
        ON CONFLICT (id) DO UPDATE SET
            public = EXCLUDED.public,
            file_size_limit = EXCLUDED.file_size_limit,
            allowed_mime_types = EXCLUDED.allowed_mime_types;
    END IF;
END $$;
