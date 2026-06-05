-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- AlterTable
ALTER TABLE "centres_examen" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "title" TEXT;

-- CreateIndex
CREATE INDEX "notifications_userId_deletedAt_dateEnvoi_idx" ON "notifications"("userId", "deletedAt", "dateEnvoi");

-- CreateIndex
CREATE INDEX "notifications_userId_statut_idx" ON "notifications"("userId", "statut");

-- CreateIndex
CREATE INDEX "notifications_typeNotification_idx" ON "notifications"("typeNotification");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
