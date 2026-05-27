-- Organismes responsables des documents academiques.
CREATE TABLE "organismes" (
  "id" TEXT NOT NULL,
  "nom" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "organismes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organismes_nom_key" ON "organismes"("nom");

-- Antennes regionales OBC.
CREATE TABLE "antennes_regionales" (
  "id" TEXT NOT NULL,
  "nom" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "ville" TEXT,
  "organismeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "antennes_regionales_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "antennes_regionales_region_key" ON "antennes_regionales"("region");
CREATE INDEX "antennes_regionales_organismeId_idx" ON "antennes_regionales"("organismeId");

INSERT INTO "organismes" ("id", "nom", "createdAt", "updatedAt")
VALUES
  ('org-obc', 'OBC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('org-decc', 'DECC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "antennes_regionales" ("id", "nom", "region", "ville", "organismeId", "createdAt", "updatedAt")
VALUES
  ('antenne-adamaoua', 'Antenne regionale OBC Adamaoua', 'Adamaoua', 'Ngaoundere', 'org-obc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-centre', 'Antenne regionale OBC Centre', 'Centre', 'Yaounde', 'org-obc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-est', 'Antenne regionale OBC Est', 'Est', 'Bertoua', 'org-obc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-extreme-nord', 'Antenne regionale OBC Extreme-Nord', 'Extreme-Nord', 'Maroua', 'org-obc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-littoral', 'Antenne regionale OBC Littoral', 'Littoral', 'Douala', 'org-obc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-nord', 'Antenne regionale OBC Nord', 'Nord', 'Garoua', 'org-obc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-nord-ouest', 'Antenne regionale OBC Nord-Ouest', 'Nord-Ouest', 'Bamenda', 'org-obc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-ouest', 'Antenne regionale OBC Ouest', 'Ouest', 'Bafoussam', 'org-obc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-sud', 'Antenne regionale OBC Sud', 'Sud', 'Ebolowa', 'org-obc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-sud-ouest', 'Antenne regionale OBC Sud-Ouest', 'Sud-Ouest', 'Buea', 'org-obc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "users"
  ADD COLUMN "organismeId" TEXT,
  ADD COLUMN "antenneRegionaleId" TEXT;

ALTER TABLE "documents"
  ADD COLUMN "organismeId" TEXT,
  ADD COLUMN "antenneRegionaleId" TEXT,
  ADD COLUMN "regionComposition" TEXT;

ALTER TABLE "duplicatas"
  ADD COLUMN "organismeId" TEXT,
  ADD COLUMN "antenneRegionaleId" TEXT,
  ADD COLUMN "regionComposition" TEXT;

ALTER TABLE "examens_valides"
  ADD COLUMN "regionComposition" TEXT;

UPDATE "users"
SET
  "organismeId" = CASE
    WHEN "role"::text = 'ADMINISTRATEUR' AND COALESCE("nomService", '') ILIKE '%DECC%' THEN 'org-decc'
    WHEN "role"::text = 'ADMINISTRATEUR' THEN 'org-obc'
    ELSE NULL
  END,
  "antenneRegionaleId" = CASE
    WHEN "role"::text = 'ADMINISTRATEUR' AND COALESCE("nomService", '') ILIKE '%DECC%' THEN NULL
    WHEN "role"::text = 'ADMINISTRATEUR' THEN 'antenne-centre'
    ELSE NULL
  END;

UPDATE "examens_valides"
SET "regionComposition" = 'Centre'
WHERE "regionComposition" IS NULL;

UPDATE "documents"
SET
  "organismeId" = CASE
    WHEN "diplomeType"::text = 'BEPC' THEN 'org-decc'
    ELSE 'org-obc'
  END,
  "regionComposition" = COALESCE("regionComposition", 'Centre'),
  "antenneRegionaleId" = CASE
    WHEN "diplomeType"::text = 'BACCALAUREAT' AND "typeDocument"::text IN ('ORIGINAL', 'DUPLICATA') THEN 'antenne-centre'
    ELSE NULL
  END;

UPDATE "duplicatas"
SET
  "organismeId" = CASE
    WHEN "intruction" LIKE '%"diplomeType":"BEPC"%' THEN 'org-decc'
    ELSE 'org-obc'
  END,
  "regionComposition" = COALESCE("regionComposition", 'Centre'),
  "antenneRegionaleId" = CASE
    WHEN "intruction" LIKE '%"diplomeType":"BACCALAUREAT"%'
      AND "intruction" LIKE '%"cibleDocument":"ORIGINAL"%' THEN 'antenne-centre'
    ELSE NULL
  END;

CREATE INDEX "users_organismeId_idx" ON "users"("organismeId");
CREATE INDEX "users_antenneRegionaleId_idx" ON "users"("antenneRegionaleId");
CREATE INDEX "documents_organismeId_idx" ON "documents"("organismeId");
CREATE INDEX "documents_antenneRegionaleId_idx" ON "documents"("antenneRegionaleId");
CREATE INDEX "duplicatas_organismeId_idx" ON "duplicatas"("organismeId");
CREATE INDEX "duplicatas_antenneRegionaleId_idx" ON "duplicatas"("antenneRegionaleId");

ALTER TABLE "antennes_regionales"
  ADD CONSTRAINT "antennes_regionales_organismeId_fkey"
  FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "users"
  ADD CONSTRAINT "users_organismeId_fkey"
  FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "users_antenneRegionaleId_fkey"
  FOREIGN KEY ("antenneRegionaleId") REFERENCES "antennes_regionales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "documents"
  ADD CONSTRAINT "documents_organismeId_fkey"
  FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "documents_antenneRegionaleId_fkey"
  FOREIGN KEY ("antenneRegionaleId") REFERENCES "antennes_regionales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "duplicatas"
  ADD CONSTRAINT "duplicatas_organismeId_fkey"
  FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "duplicatas_antenneRegionaleId_fkey"
  FOREIGN KEY ("antenneRegionaleId") REFERENCES "antennes_regionales"("id") ON DELETE SET NULL ON UPDATE CASCADE;
