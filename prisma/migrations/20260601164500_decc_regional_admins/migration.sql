-- Allow each organism to have its own regional antenna for the same region name.
DROP INDEX IF EXISTS "antennes_regionales_region_key";
CREATE UNIQUE INDEX IF NOT EXISTS "antennes_regionales_organismeId_region_key"
  ON "antennes_regionales"("organismeId", "region");

-- Regional DECC antennas for BEPC administration.
INSERT INTO "antennes_regionales" ("id", "nom", "region", "ville", "accessKey", "organismeId", "createdAt", "updatedAt")
VALUES
  ('antenne-decc-adamaoua', 'Antenne regionale DECC Adamaoua', 'Adamaoua', 'Ngaoundere', 'DECC-ADAMAOUA-2026', 'org-decc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-decc-centre', 'Antenne regionale DECC Centre', 'Centre', 'Yaounde', 'DECC-CENTRE-2026', 'org-decc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-decc-est', 'Antenne regionale DECC Est', 'Est', 'Bertoua', 'DECC-EST-2026', 'org-decc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-decc-extreme-nord', 'Antenne regionale DECC Extreme-Nord', 'Extreme-Nord', 'Maroua', 'DECC-EXTREME-NORD-2026', 'org-decc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-decc-littoral', 'Antenne regionale DECC Littoral', 'Littoral', 'Douala', 'DECC-LITTORAL-2026', 'org-decc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-decc-nord', 'Antenne regionale DECC Nord', 'Nord', 'Garoua', 'DECC-NORD-2026', 'org-decc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-decc-nord-ouest', 'Antenne regionale DECC Nord-Ouest', 'Nord-Ouest', 'Bamenda', 'DECC-NORD-OUEST-2026', 'org-decc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-decc-ouest', 'Antenne regionale DECC Ouest', 'Ouest', 'Bafoussam', 'DECC-OUEST-2026', 'org-decc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-decc-sud', 'Antenne regionale DECC Sud', 'Sud', 'Ebolowa', 'DECC-SUD-2026', 'org-decc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('antenne-decc-sud-ouest', 'Antenne regionale DECC Sud-Ouest', 'Sud-Ouest', 'Buea', 'DECC-SUD-OUEST-2026', 'org-decc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "nom" = EXCLUDED."nom",
  "region" = EXCLUDED."region",
  "ville" = EXCLUDED."ville",
  "accessKey" = EXCLUDED."accessKey",
  "organismeId" = EXCLUDED."organismeId",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Existing BEPC documents become visible to the regional DECC admin for their composition region.
UPDATE "documents" AS d
SET "organismeId" = 'org-decc',
    "antenneRegionaleId" = a."id"
FROM "antennes_regionales" AS a
WHERE d."diplomeType"::text = 'BEPC'
  AND a."organismeId" = 'org-decc'
  AND LOWER(a."region") = LOWER(COALESCE(NULLIF(d."regionComposition", ''), 'Centre'));

UPDATE "duplicatas" AS dup
SET "organismeId" = 'org-decc',
    "antenneRegionaleId" = a."id"
FROM "antennes_regionales" AS a
WHERE dup."intruction" LIKE '%"diplomeType":"BEPC"%'
  AND a."organismeId" = 'org-decc'
  AND LOWER(a."region") = LOWER(COALESCE(NULLIF(dup."regionComposition", ''), 'Centre'));
