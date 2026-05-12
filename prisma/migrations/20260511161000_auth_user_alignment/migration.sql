-- Align local business users with Supabase Auth accounts.
-- Existing students/admins keep their internal User.id; authUserId is filled after signup/login.

ALTER TABLE "recus" DROP CONSTRAINT "recus_matriculeEId_fkey";
ALTER TABLE "recus" RENAME COLUMN "matriculeEId" TO "userId";

ALTER TABLE "users" ADD COLUMN "authUserId" TEXT;
ALTER TABLE "users" ADD COLUMN "matricule" TEXT;

UPDATE "users"
SET "matricule" = COALESCE("matriculeE", "matriculeA");

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "users" WHERE "matricule" IS NULL OR length(trim("matricule")) = 0) THEN
    RAISE EXCEPTION 'Cannot migrate users: every user must have matriculeE or matriculeA.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "users"
    GROUP BY "matricule"
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot migrate users: duplicate matricule values found.';
  END IF;
END $$;

ALTER TABLE "users" ALTER COLUMN "matricule" SET NOT NULL;

DROP INDEX "users_matriculeE_key";
DROP INDEX "users_emailE_key";
DROP INDEX "users_matriculeA_key";
DROP INDEX "users_emailA_key";

ALTER TABLE "users"
  DROP COLUMN "motDePasse",
  DROP COLUMN "matriculeE",
  DROP COLUMN "emailE",
  DROP COLUMN "matriculeA",
  DROP COLUMN "emailA";

CREATE UNIQUE INDEX "users_authUserId_key" ON "users"("authUserId");
CREATE UNIQUE INDEX "users_matricule_key" ON "users"("matricule");

ALTER TABLE "recus"
  ADD CONSTRAINT "recus_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
