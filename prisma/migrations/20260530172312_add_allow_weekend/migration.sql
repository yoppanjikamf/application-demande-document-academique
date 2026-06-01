-- DropIndex
DROP INDEX "users_antenneRegionaleId_idx";

-- DropIndex
DROP INDEX "users_organismeId_idx";

-- AlterTable
ALTER TABLE "antennes_regionales" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "organismes" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "parametres_rendez_vous" ADD COLUMN     "allowWeekendBookings" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "lieuObc" SET DEFAULT 'Centre de retrait';
