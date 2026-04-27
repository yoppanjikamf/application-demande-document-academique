-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ELEVE', 'ADMINISTRATEUR');

-- CreateEnum
CREATE TYPE "StatutNotification" AS ENUM ('ENVOYEE', 'RECUE', 'LUE');

-- CreateEnum
CREATE TYPE "StatutRendezVous" AS ENUM ('PLANIFIE', 'CONFIRME', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutDocument" AS ENUM ('EN_ATTENTE', 'RETIRE');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE', 'EFFECTUE');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('RELEVE', 'DIPLOME', 'DUPLICATA');

-- CreateEnum
CREATE TYPE "modePaiement" AS ENUM ('ORANGEMONEY', 'MTNMONEY', 'CARTEBANCAIRE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "derniereConnexion" TIMESTAMP(3),
    "matriculeE" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "emailE" TEXT,
    "matriculeA" TEXT,
    "nomService" TEXT,
    "emailA" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rendez_vous" (
    "id" TEXT NOT NULL,
    "dateRdv" TIMESTAMP(3) NOT NULL,
    "heureRdv" TEXT NOT NULL,
    "lieu" TEXT NOT NULL,
    "statut" "StatutRendezVous" NOT NULL DEFAULT 'PLANIFIE',
    "commentaire" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rendez_vous_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "typeNotification" TEXT NOT NULL,
    "statut" "StatutNotification" NOT NULL DEFAULT 'ENVOYEE',
    "message" TEXT NOT NULL,
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "typeDocument" "TypeDocument" NOT NULL,
    "statut" "StatutDocument" NOT NULL DEFAULT 'EN_ATTENTE',
    "eleveId" TEXT NOT NULL,
    "paiementId" TEXT,
    "releveId" TEXT,
    "diplomeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duplicatas" (
    "id" TEXT NOT NULL,
    "typeDocument" "TypeDocument" NOT NULL,
    "nomDuplicata" TEXT NOT NULL,
    "statut" "StatutDocument" NOT NULL DEFAULT 'EN_ATTENTE',
    "intruction" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "duplicatas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "statut" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE',
    "modePaiment" TEXT NOT NULL,
    "duplicataId" TEXT NOT NULL,
    "documentAcademiqueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releves" (
    "id" TEXT NOT NULL,
    "nomReleve" TEXT NOT NULL,
    "statut" "StatutDocument" NOT NULL DEFAULT 'EN_ATTENTE',
    "instruction" TEXT NOT NULL,
    "duplicataId" TEXT NOT NULL,
    "documentAcademiqueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "releves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diplomes" (
    "id" TEXT NOT NULL,
    "nomDiplome" TEXT NOT NULL,
    "statut" "StatutDocument" NOT NULL DEFAULT 'EN_ATTENTE',
    "instruction" TEXT NOT NULL,
    "duplicataId" TEXT NOT NULL,
    "documentAcademiqueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diplomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recus" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "dateEmission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modePaiement" TEXT,
    "commentaire" TEXT,
    "matriculeEId" TEXT,
    "paiementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_matriculeE_key" ON "users"("matriculeE");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailE_key" ON "users"("emailE");

-- CreateIndex
CREATE UNIQUE INDEX "users_matriculeA_key" ON "users"("matriculeA");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailA_key" ON "users"("emailA");

-- CreateIndex
CREATE UNIQUE INDEX "paiements_duplicataId_key" ON "paiements"("duplicataId");

-- CreateIndex
CREATE UNIQUE INDEX "paiements_documentAcademiqueId_key" ON "paiements"("documentAcademiqueId");

-- CreateIndex
CREATE UNIQUE INDEX "releves_duplicataId_key" ON "releves"("duplicataId");

-- CreateIndex
CREATE UNIQUE INDEX "releves_documentAcademiqueId_key" ON "releves"("documentAcademiqueId");

-- CreateIndex
CREATE UNIQUE INDEX "diplomes_duplicataId_key" ON "diplomes"("duplicataId");

-- CreateIndex
CREATE UNIQUE INDEX "diplomes_documentAcademiqueId_key" ON "diplomes"("documentAcademiqueId");

-- CreateIndex
CREATE UNIQUE INDEX "recus_numero_key" ON "recus"("numero");

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duplicatas" ADD CONSTRAINT "duplicatas_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_duplicataId_fkey" FOREIGN KEY ("duplicataId") REFERENCES "duplicatas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_documentAcademiqueId_fkey" FOREIGN KEY ("documentAcademiqueId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "releves" ADD CONSTRAINT "releves_duplicataId_fkey" FOREIGN KEY ("duplicataId") REFERENCES "duplicatas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "releves" ADD CONSTRAINT "releves_documentAcademiqueId_fkey" FOREIGN KEY ("documentAcademiqueId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diplomes" ADD CONSTRAINT "diplomes_duplicataId_fkey" FOREIGN KEY ("duplicataId") REFERENCES "duplicatas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diplomes" ADD CONSTRAINT "diplomes_documentAcademiqueId_fkey" FOREIGN KEY ("documentAcademiqueId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recus" ADD CONSTRAINT "recus_matriculeEId_fkey" FOREIGN KEY ("matriculeEId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recus" ADD CONSTRAINT "recus_paiementId_fkey" FOREIGN KEY ("paiementId") REFERENCES "paiements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
