/*
  Warnings:

  - A unique constraint covering the columns `[disponibiliteId]` on the table `rendez_vous` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StatutDisponibilite" AS ENUM ('LIBRE', 'RESERVE', 'ANNULE');

-- AlterTable
ALTER TABLE "rendez_vous" ADD COLUMN     "disponibiliteId" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ELEVE';

-- CreateTable
CREATE TABLE "disponibilites_rdv" (
    "id" TEXT NOT NULL,
    "dateRdv" TIMESTAMP(3) NOT NULL,
    "heureRdv" TEXT NOT NULL,
    "lieu" TEXT NOT NULL,
    "statut" "StatutDisponibilite" NOT NULL DEFAULT 'LIBRE',
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disponibilites_rdv_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rendez_vous_disponibiliteId_key" ON "rendez_vous"("disponibiliteId");

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_disponibiliteId_fkey" FOREIGN KEY ("disponibiliteId") REFERENCES "disponibilites_rdv"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilites_rdv" ADD CONSTRAINT "disponibilites_rdv_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
