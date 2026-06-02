-- Role dedie aux agents rattaches aux centres d'examen.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'AGENT_CENTRE_EXAMEN';

-- Centres d'examen regionaux.
CREATE TABLE IF NOT EXISTS "centres_examen" (
  "id" TEXT NOT NULL,
  "nom" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "ville" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "centres_examen_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "centres_examen_region_key"
  ON "centres_examen"("region");

INSERT INTO "centres_examen" ("id", "nom", "region", "ville", "createdAt", "updatedAt")
VALUES
  ('centre-examen-adamaoua', 'Centre d''examen Adamaoua', 'Adamaoua', 'Ngaoundere', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('centre-examen-centre', 'Centre d''examen Centre', 'Centre', 'Yaounde', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('centre-examen-est', 'Centre d''examen Est', 'Est', 'Bertoua', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('centre-examen-extreme-nord', 'Centre d''examen Extreme-Nord', 'Extreme-Nord', 'Maroua', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('centre-examen-littoral', 'Centre d''examen Littoral', 'Littoral', 'Douala', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('centre-examen-nord', 'Centre d''examen Nord', 'Nord', 'Garoua', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('centre-examen-nord-ouest', 'Centre d''examen Nord-Ouest', 'Nord-Ouest', 'Bamenda', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('centre-examen-ouest', 'Centre d''examen Ouest', 'Ouest', 'Bafoussam', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('centre-examen-sud', 'Centre d''examen Sud', 'Sud', 'Ebolowa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('centre-examen-sud-ouest', 'Centre d''examen Sud-Ouest', 'Sud-Ouest', 'Buea', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "nom" = EXCLUDED."nom",
  "region" = EXCLUDED."region",
  "ville" = EXCLUDED."ville",
  "updatedAt" = CURRENT_TIMESTAMP;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "centreExamenId" TEXT;
ALTER TABLE "rendez_vous" ADD COLUMN IF NOT EXISTS "retraitConfirmeAt" TIMESTAMP(3);
ALTER TABLE "rendez_vous" ADD COLUMN IF NOT EXISTS "retraitConfirmeParId" TEXT;

CREATE INDEX IF NOT EXISTS "users_centreExamenId_idx" ON "users"("centreExamenId");
CREATE INDEX IF NOT EXISTS "rendez_vous_retraitConfirmeParId_idx" ON "rendez_vous"("retraitConfirmeParId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_centreExamenId_fkey'
  ) THEN
    ALTER TABLE "users"
      ADD CONSTRAINT "users_centreExamenId_fkey"
      FOREIGN KEY ("centreExamenId") REFERENCES "centres_examen"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rendez_vous_retraitConfirmeParId_fkey'
  ) THEN
    ALTER TABLE "rendez_vous"
      ADD CONSTRAINT "rendez_vous_retraitConfirmeParId_fkey"
      FOREIGN KEY ("retraitConfirmeParId") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
