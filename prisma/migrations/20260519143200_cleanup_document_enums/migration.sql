ALTER TABLE "documents" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "duplicatas" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "releves" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "diplomes" ALTER COLUMN "statut" DROP DEFAULT;

ALTER TYPE "StatutDocument" RENAME TO "StatutDocument_old";
CREATE TYPE "StatutDocument" AS ENUM ('PAS_DISPONIBLE', 'DISPONIBLE', 'RETIRE');

ALTER TABLE "documents" ALTER COLUMN "statut" TYPE "StatutDocument" USING "statut"::text::"StatutDocument";
ALTER TABLE "duplicatas" ALTER COLUMN "statut" TYPE "StatutDocument" USING "statut"::text::"StatutDocument";
ALTER TABLE "releves" ALTER COLUMN "statut" TYPE "StatutDocument" USING "statut"::text::"StatutDocument";
ALTER TABLE "diplomes" ALTER COLUMN "statut" TYPE "StatutDocument" USING "statut"::text::"StatutDocument";

ALTER TABLE "documents" ALTER COLUMN "statut" SET DEFAULT 'PAS_DISPONIBLE';
ALTER TABLE "duplicatas" ALTER COLUMN "statut" SET DEFAULT 'PAS_DISPONIBLE';
ALTER TABLE "releves" ALTER COLUMN "statut" SET DEFAULT 'PAS_DISPONIBLE';
ALTER TABLE "diplomes" ALTER COLUMN "statut" SET DEFAULT 'PAS_DISPONIBLE';

DROP TYPE "StatutDocument_old";

ALTER TYPE "TypeDocument" RENAME TO "TypeDocument_old";
CREATE TYPE "TypeDocument" AS ENUM ('ORIGINAL', 'RELEVE_NOTES', 'DUPLICATA');

ALTER TABLE "documents" ALTER COLUMN "typeDocument" TYPE "TypeDocument" USING "typeDocument"::text::"TypeDocument";
ALTER TABLE "duplicatas" ALTER COLUMN "typeDocument" TYPE "TypeDocument" USING "typeDocument"::text::"TypeDocument";

DROP TYPE "TypeDocument_old";
