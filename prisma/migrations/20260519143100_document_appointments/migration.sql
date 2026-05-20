ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "diplomeType" "DiplomePrincipal" NOT NULL DEFAULT 'BACCALAUREAT';
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "centreExamen" TEXT;
ALTER TABLE "rendez_vous" ADD COLUMN IF NOT EXISTS "documentId" TEXT;

UPDATE "documents" SET "statut" = 'PAS_DISPONIBLE' WHERE "statut"::text IN ('EN_ATTENTE', 'NON_DISPONIBLE');
UPDATE "duplicatas" SET "statut" = 'PAS_DISPONIBLE' WHERE "statut"::text IN ('EN_ATTENTE', 'NON_DISPONIBLE');
UPDATE "releves" SET "statut" = 'PAS_DISPONIBLE' WHERE "statut"::text IN ('EN_ATTENTE', 'NON_DISPONIBLE');
UPDATE "diplomes" SET "statut" = 'PAS_DISPONIBLE' WHERE "statut"::text IN ('EN_ATTENTE', 'NON_DISPONIBLE');

UPDATE "documents" SET "typeDocument" = 'ORIGINAL' WHERE "typeDocument"::text = 'DIPLOME';
UPDATE "documents" SET "typeDocument" = 'RELEVE_NOTES' WHERE "typeDocument"::text = 'RELEVE';
UPDATE "duplicatas" SET "typeDocument" = 'DUPLICATA' WHERE "typeDocument"::text <> 'DUPLICATA';

ALTER TABLE "documents" ALTER COLUMN "statut" SET DEFAULT 'PAS_DISPONIBLE';
ALTER TABLE "duplicatas" ALTER COLUMN "statut" SET DEFAULT 'PAS_DISPONIBLE';
ALTER TABLE "releves" ALTER COLUMN "statut" SET DEFAULT 'PAS_DISPONIBLE';
ALTER TABLE "diplomes" ALTER COLUMN "statut" SET DEFAULT 'PAS_DISPONIBLE';

WITH ranked_documents AS (
  SELECT
    "id",
    row_number() OVER (
      PARTITION BY "eleveId", "diplomeType", "typeDocument"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" DESC
    ) AS rank
  FROM "documents"
)
DELETE FROM "documents"
WHERE "id" IN (
  SELECT "id" FROM ranked_documents WHERE rank > 1
);

CREATE TABLE IF NOT EXISTS "examens_valides" (
  "id" TEXT NOT NULL,
  "diplomeType" "DiplomePrincipal" NOT NULL,
  "anneeSession" INTEGER,
  "centreExamen" TEXT,
  "eleveId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "examens_valides_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "parametres_rendez_vous" (
  "id" TEXT NOT NULL DEFAULT 'GLOBAL',
  "quotaJournalier" INTEGER NOT NULL DEFAULT 200,
  "lieuObc" TEXT NOT NULL DEFAULT 'Centre OBC',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "parametres_rendez_vous_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "creneaux_horaires" (
  "id" TEXT NOT NULL,
  "heureDebut" TEXT NOT NULL,
  "heureFin" TEXT NOT NULL,
  "actif" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "creneaux_horaires_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "jours_feries" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "nom" TEXT NOT NULL,
  "annuel" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "jours_feries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "mail_logs" (
  "id" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ENVOYE',
  "error" TEXT,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "mail_logs_pkey" PRIMARY KEY ("id")
);

INSERT INTO "parametres_rendez_vous" ("id", "quotaJournalier", "lieuObc", "updatedAt")
VALUES ('GLOBAL', 200, 'Centre OBC', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "creneaux_horaires" ("id", "heureDebut", "heureFin", "updatedAt")
SELECT 'slot-0800-1000', '08:00', '10:00', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "creneaux_horaires" WHERE "heureDebut" = '08:00' AND "heureFin" = '10:00');
INSERT INTO "creneaux_horaires" ("id", "heureDebut", "heureFin", "updatedAt")
SELECT 'slot-1000-1200', '10:00', '12:00', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "creneaux_horaires" WHERE "heureDebut" = '10:00' AND "heureFin" = '12:00');
INSERT INTO "creneaux_horaires" ("id", "heureDebut", "heureFin", "updatedAt")
SELECT 'slot-1400-1600', '14:00', '16:00', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "creneaux_horaires" WHERE "heureDebut" = '14:00' AND "heureFin" = '16:00');

DO $$ BEGIN
  ALTER TABLE "examens_valides" ADD CONSTRAINT "examens_valides_eleveId_fkey"
    FOREIGN KEY ("eleveId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_documentId_fkey"
    FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "mail_logs" ADD CONSTRAINT "mail_logs_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "examens_valides_eleveId_diplomeType_key" ON "examens_valides"("eleveId", "diplomeType");
CREATE INDEX IF NOT EXISTS "examens_valides_diplomeType_idx" ON "examens_valides"("diplomeType");
CREATE UNIQUE INDEX IF NOT EXISTS "documents_eleveId_diplomeType_typeDocument_key" ON "documents"("eleveId", "diplomeType", "typeDocument");
CREATE INDEX IF NOT EXISTS "documents_statut_idx" ON "documents"("statut");
CREATE INDEX IF NOT EXISTS "documents_diplomeType_typeDocument_idx" ON "documents"("diplomeType", "typeDocument");
CREATE INDEX IF NOT EXISTS "rendez_vous_dateRdv_heureRdv_statut_idx" ON "rendez_vous"("dateRdv", "heureRdv", "statut");
CREATE INDEX IF NOT EXISTS "rendez_vous_documentId_statut_idx" ON "rendez_vous"("documentId", "statut");
CREATE INDEX IF NOT EXISTS "rendez_vous_eleveId_statut_idx" ON "rendez_vous"("eleveId", "statut");
CREATE UNIQUE INDEX IF NOT EXISTS "rendez_vous_document_active_key" ON "rendez_vous"("documentId")
  WHERE "documentId" IS NOT NULL AND "statut" IN ('PLANIFIE', 'CONFIRME');
CREATE UNIQUE INDEX IF NOT EXISTS "creneaux_horaires_heureDebut_heureFin_key" ON "creneaux_horaires"("heureDebut", "heureFin");
CREATE UNIQUE INDEX IF NOT EXISTS "jours_feries_date_key" ON "jours_feries"("date");
CREATE INDEX IF NOT EXISTS "mail_logs_userId_idx" ON "mail_logs"("userId");
