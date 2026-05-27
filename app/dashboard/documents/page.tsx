import Link from "next/link";
import { CreditCard, FileCheck2, FileText, GraduationCap, RotateCcw } from "lucide-react";

import { requestReleveNotesAction, submitDuplicataRequestAction } from "@/app/dashboard/actions";
import {
  ACTIVE_RENDEZ_VOUS_STATUSES,
  ensureDocumentsForValidatedExams,
  getPickupLocation,
  getStatusLabel,
} from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DiplomePrincipal, DocumentAcademique, RendezVous, TypeDocument } from "@/lib/generated/prisma/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge, documentTone } from "@/components/dashboard/status-badge";
import { AppointmentDialog } from "@/components/documents/appointment-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DocumentsPageProps = {
  searchParams?: Promise<{
    exam?: string;
    type?: string;
    cible?: string;
  }>;
};

type DuplicataMeta = {
  diplomeType?: DiplomePrincipal;
  cibleDocument?: Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES">;
  session?: number;
  centreExamen?: string;
  motif?: string;
  justificatif?: string;
};

type DocumentWithAppointments = DocumentAcademique & {
  rendezVous: RendezVous[];
};

const diplomeLabels: Record<DiplomePrincipal, string> = {
  BEPC: "BEPC",
  PROBATOIRE: "Probatoire",
  BACCALAUREAT: "Baccalaureat",
};

const optionLabels: Record<"ORIGINAL" | "RELEVE_NOTES" | "DUPLICATA", string> = {
  ORIGINAL: "Original du diplome",
  RELEVE_NOTES: "Releve de notes",
  DUPLICATA: "Duplicata",
};

function parseDiplome(value?: string): DiplomePrincipal | null {
  if (value === "BEPC" || value === "PROBATOIRE" || value === "BACCALAUREAT") {
    return value;
  }

  return null;
}

function parseOption(value?: string): "ORIGINAL" | "RELEVE_NOTES" | "DUPLICATA" | null {
  if (value === "ORIGINAL" || value === "RELEVE_NOTES" || value === "DUPLICATA") {
    return value;
  }

  return null;
}

function parseCible(value?: string): Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES"> | null {
  if (value === "ORIGINAL" || value === "RELEVE_NOTES") {
    return value;
  }

  return null;
}

function getDocument(documents: DocumentWithAppointments[], typeDocument: TypeDocument) {
  return documents.find((document) => document.typeDocument === typeDocument) ?? null;
}

function isActiveAppointment(status: RendezVous["statut"]) {
  return (ACTIVE_RENDEZ_VOUS_STATUSES as readonly string[]).includes(status);
}

function getActiveAppointment(document: DocumentWithAppointments | null) {
  return document?.rendezVous.find((appointment) => isActiveAppointment(appointment.statut)) ?? null;
}

function getHonoredAppointment(document: DocumentWithAppointments | null) {
  return document?.rendezVous.find((appointment) => appointment.statut === "HONORE") ?? null;
}

function getDuplicataTitle(diplomeType: DiplomePrincipal, target: Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES">) {
  return target === "ORIGINAL"
    ? `Duplicata du diplome original du ${diplomeLabels[diplomeType]}`
    : `Duplicata du releve de notes du ${diplomeLabels[diplomeType]}`;
}

function parseDuplicataMeta(value: string): DuplicataMeta {
  try {
    const parsed = JSON.parse(value) as DuplicataMeta;
    return parsed;
  } catch {
    return {};
  }
}

function getDuplicataWorkflowStatus(document: DocumentAcademique | null, hasPaidRequest: boolean) {
  if (document?.statut === "DISPONIBLE") {
    return { label: "Disponible", tone: "green" as const };
  }
  if (document?.statut === "RETIRE") {
    return { label: "Retire", tone: "blue" as const };
  }
  if (hasPaidRequest) {
    return { label: "En cours de traitement", tone: "amber" as const };
  }
  return { label: "Non disponible", tone: "slate" as const };
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const user = await requireRole("ELEVE", "/dashboard/documents");
  const params = await searchParams;

  await ensureDocumentsForValidatedExams(user.id);

  const exams = await prisma.examenValide.findMany({
    where: { eleveId: user.id },
    orderBy: { createdAt: "asc" },
  });
  const selectedExam = parseDiplome(params?.exam);
  const selectedOption = parseOption(params?.type);
  const selectedCible = parseCible(params?.cible);
  const currentExam = exams.find((exam) => exam.diplomeType === selectedExam) ?? null;

  const [documents, duplicatas] = currentExam
    ? await Promise.all([
        prisma.documentAcademique.findMany({
          where: { eleveId: user.id, diplomeType: currentExam.diplomeType },
          include: {
            rendezVous: {
              where: { statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES, "HONORE"] } },
              orderBy: [{ updatedAt: "desc" }, { dateRdv: "desc" }],
              take: 5,
            },
          },
        }),
        prisma.duplicata.findMany({
          where: { eleveId: user.id },
          include: {
            paiement: {
              include: { recu: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], []];

  const originalDocument = getDocument(documents, "ORIGINAL");
  const releveDocument = getDocument(documents, "RELEVE_NOTES");
  const duplicataDocument = getDocument(documents, "DUPLICATA");
  const latestDuplicata = currentExam && selectedCible
    ? duplicatas.find((duplicata) => {
        const meta = parseDuplicataMeta(duplicata.intruction);
        return meta.diplomeType === currentExam.diplomeType && meta.cibleDocument === selectedCible;
      }) ?? null
    : null;
  const activeDuplicataAppointment = getActiveAppointment(duplicataDocument);
  const activeOriginalAppointment = getActiveAppointment(originalDocument);
  const honoredDuplicataAppointment = getHonoredAppointment(duplicataDocument);
  const honoredOriginalAppointment = getHonoredAppointment(originalDocument);
  const honoredReleveAppointment = getHonoredAppointment(releveDocument);

  return (
    <DashboardShell
      role="ELEVE"
      userName={`${user.prenom} ${user.nom}`}
      activePath="/dashboard/documents"
      title="Mes documents"
      subtitle="Selectionnez d'abord un examen deja compose, puis le document souhaite."
    >
      {exams.length === 0 ? (
        <p className="rounded-md border border-slate-200 bg-white p-5 text-slate-500 shadow-sm">
          Aucun examen compose n&apos;est rattache a votre matricule.
        </p>
      ) : (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Examens deja composes</h2>
            <p className="mt-1 text-sm text-slate-500">Les examens non composes ne sont pas affiches.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {exams.map((exam) => {
              const isActive = exam.diplomeType === currentExam?.diplomeType;
              return (
                <Link
                  key={exam.id}
                  href={`/dashboard/documents?exam=${exam.diplomeType}`}
                  className={`rounded-md border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md ${
                    isActive ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                  }`}
                >
                  <GraduationCap className="h-6 w-6 text-blue-700" />
                  <p className="mt-4 text-lg font-semibold text-slate-950">{diplomeLabels[exam.diplomeType]}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Session {exam.anneeSession ?? "non renseignee"} · {exam.centreExamen ?? "Centre non renseigne"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {currentExam ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Documents du {diplomeLabels[currentExam.diplomeType]}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Choisissez le type de document a consulter ou demander.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { type: "ORIGINAL" as const, icon: FileCheck2, text: "Retrait au Centre OBC avec rendez-vous." },
              { type: "RELEVE_NOTES" as const, icon: FileText, text: "Retrait direct dans votre centre d'examen." },
              { type: "DUPLICATA" as const, icon: RotateCcw, text: "Demande, paiement, puis rendez-vous au Centre OBC." },
            ].map((option) => {
              const isActive = selectedOption === option.type;
              return (
                <Link
                  key={option.type}
                  href={`/dashboard/documents?exam=${currentExam.diplomeType}&type=${option.type}`}
                  className={`rounded-md border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md ${
                    isActive ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                  }`}
                >
                  <option.icon className="h-6 w-6 text-blue-700" />
                  <p className="mt-4 font-semibold text-slate-950">{optionLabels[option.type]}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{option.text}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {currentExam && selectedOption === "ORIGINAL" ? (
        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Original du diplome du {diplomeLabels[currentExam.diplomeType]}
              </h3>
              <p className="mt-1 text-sm text-slate-500">Retrait obligatoire au Centre OBC.</p>
            </div>
            <StatusBadge tone={originalDocument ? documentTone(originalDocument.statut) : "slate"}>
              {originalDocument ? getStatusLabel(originalDocument.statut) : "Non disponible"}
            </StatusBadge>
          </div>

          {originalDocument?.statut === "RETIRE" ? (
            <div className="mt-5 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              Ce document a deja ete retire
              {honoredOriginalAppointment
                ? ` le ${honoredOriginalAppointment.updatedAt.toLocaleDateString("fr-FR")}`
                : ""}
              .
            </div>
          ) : originalDocument?.statut === "DISPONIBLE" ? (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-slate-600">Lieu de retrait: Centre OBC</p>
              {activeOriginalAppointment ? (
                <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                  Rendez-vous confirme le {activeOriginalAppointment.dateRdv.toLocaleDateString("fr-FR")} ·{" "}
                  {activeOriginalAppointment.heureRdv}
                </div>
              ) : (
                <AppointmentDialog
                  documentId={originalDocument.id}
                  documentTitle={`Original du diplome du ${diplomeLabels[currentExam.diplomeType]}`}
                  disabled={false}
                />
              )}
            </div>
          ) : (
            <p className="mt-5 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
              Votre diplome n&apos;est pas encore disponible. Vous serez notifie des sa mise a disposition.
            </p>
          )}
        </section>
      ) : null}

      {currentExam && selectedOption === "RELEVE_NOTES" ? (
        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Releve de notes du {diplomeLabels[currentExam.diplomeType]}
              </h3>
              <p className="mt-1 text-sm text-slate-500">Aucun rendez-vous n&apos;est requis pour le releve.</p>
            </div>
            <StatusBadge tone={releveDocument ? documentTone(releveDocument.statut) : "slate"}>
              {releveDocument ? getStatusLabel(releveDocument.statut) : "Non disponible"}
            </StatusBadge>
          </div>

          {releveDocument?.statut === "RETIRE" ? (
            <div className="mt-5 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              Ce releve de notes a deja ete retire
              {honoredReleveAppointment ? ` le ${honoredReleveAppointment.updatedAt.toLocaleDateString("fr-FR")}` : ""}.
            </div>
          ) : releveDocument?.statut === "DISPONIBLE" ? (
            <div className="mt-5 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
              Votre releve de notes est disponible dans votre centre d&apos;examen:{" "}
              {await getPickupLocation(releveDocument)}. Vous pouvez vous y rendre directement pour le retrait.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
                Votre releve de notes n&apos;est pas encore disponible dans votre centre d&apos;examen. Vous serez notifie des
                sa mise a disposition.
              </p>
              <form action={requestReleveNotesAction}>
                <input type="hidden" name="diplomeType" value={currentExam.diplomeType} />
                <Button type="submit">Faire une demande</Button>
              </form>
            </div>
          )}
        </section>
      ) : null}

      {currentExam && selectedOption === "DUPLICATA" ? (
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Duplicata du {diplomeLabels[currentExam.diplomeType]}
            </h3>
            <p className="mt-1 text-sm text-slate-500">Selectionnez le document source du duplicata.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(["RELEVE_NOTES", "ORIGINAL"] as const).map((target) => {
              const isActive = selectedCible === target;
              return (
                <Link
                  key={target}
                  href={`/dashboard/documents?exam=${currentExam.diplomeType}&type=DUPLICATA&cible=${target}`}
                  className={`rounded-md border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md ${
                    isActive ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                  }`}
                >
                  <RotateCcw className="h-6 w-6 text-blue-700" />
                  <p className="mt-4 font-semibold text-slate-950">
                    {getDuplicataTitle(currentExam.diplomeType, target)}
                  </p>
                </Link>
              );
            })}
          </div>

          {selectedCible ? (
            <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
              <form
                action={submitDuplicataRequestAction}
                className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <h4 className="font-semibold text-slate-950">{getDuplicataTitle(currentExam.diplomeType, selectedCible)}</h4>
                  <p className="mt-1 text-sm text-slate-500">Frais a payer: 5 000 FCFA.</p>
                </div>
                <input type="hidden" name="diplomeType" value={currentExam.diplomeType} />
                <input type="hidden" name="cibleDocument" value={selectedCible} />

                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={`${user.prenom} ${user.nom}`} disabled aria-label="Nom et prenom" />
                  <Input value={user.matricule} disabled aria-label="Numero matricule" />
                  <Input value={diplomeLabels[currentExam.diplomeType]} disabled aria-label="Examen concerne" />
                  <Input
                    name="session"
                    type="number"
                    min={1950}
                    max={new Date().getFullYear()}
                    defaultValue={currentExam.anneeSession ?? new Date().getFullYear()}
                    required
                  />
                </div>

                <Input
                  name="centreExamen"
                  defaultValue={currentExam.centreExamen ?? ""}
                  placeholder="Centre d'examen"
                  required
                />
                <textarea
                  name="motif"
                  placeholder="Motif de la demande"
                  required
                  className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Input name="piecesJustificatives" type="file" />
                <select
                  name="modePaiement"
                  defaultValue="ORANGEMONEY"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                >
                  <option value="ORANGEMONEY">Orange Money</option>
                  <option value="MTNMONEY">MTN Mobile Money</option>
                  <option value="CARTEBANCAIRE">Carte bancaire</option>
                </select>
                <Button type="submit">
                  <CreditCard className="h-4 w-4" />
                  Valider et payer
                </Button>
              </form>

              <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="font-semibold text-slate-950">Statut de la demande</h4>
                {latestDuplicata ? (
                  <div className="mt-4 space-y-4">
                    <StatusBadge
                      tone={
                        getDuplicataWorkflowStatus(duplicataDocument, latestDuplicata.paiement?.statut === "EFFECTUE")
                          .tone
                      }
                    >
                      {
                        getDuplicataWorkflowStatus(duplicataDocument, latestDuplicata.paiement?.statut === "EFFECTUE")
                          .label
                      }
                    </StatusBadge>
                    {latestDuplicata.paiement?.recu[0] ? (
                      <p className="text-sm text-slate-500">Recu: {latestDuplicata.paiement.recu[0].numero}</p>
                    ) : null}
                    {duplicataDocument?.statut === "RETIRE" ? (
                      <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                        Ce duplicata a deja ete retire
                        {honoredDuplicataAppointment
                          ? ` le ${honoredDuplicataAppointment.updatedAt.toLocaleDateString("fr-FR")}`
                          : ""}
                        .
                      </div>
                    ) : duplicataDocument?.statut === "DISPONIBLE" ? (
                      <div className="space-y-3">
                        <p className="text-sm text-slate-600">Lieu de retrait: Centre OBC</p>
                        {activeDuplicataAppointment ? (
                          <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                            Rendez-vous confirme le {activeDuplicataAppointment.dateRdv.toLocaleDateString("fr-FR")} ·{" "}
                            {activeDuplicataAppointment.heureRdv}
                          </div>
                        ) : duplicataDocument ? (
                          <AppointmentDialog
                            documentId={duplicataDocument.id}
                            documentTitle={getDuplicataTitle(currentExam.diplomeType, selectedCible)}
                            disabled={false}
                          />
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-sm leading-6 text-slate-500">
                        Votre demande de duplicata a ete enregistree avec succes et est en cours de traitement.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Aucune demande de duplicata n&apos;a encore ete enregistree pour ce choix.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </DashboardShell>
  );
}
