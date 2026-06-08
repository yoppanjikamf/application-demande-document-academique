import Link from "next/link";
import { CreditCard, Eye, FileCheck2, FileText, GraduationCap, RotateCcw } from "lucide-react";

import { submitDuplicataRequestAction } from "@/app/dashboard/actions";
import { PendingDocumentRequestForm } from "@/components/documents/pending-document-request-form";
import {
  ACTIVE_RENDEZ_VOUS_STATUSES,
  getPickupLocation,
  getStudentDocumentStatusLabel,
  hasStudentDocumentRequest,
} from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { isDocumentRequestAllowed, resolveDocumentRoute } from "@/lib/document-routing";
import {
  getDuplicataFee,
  getDuplicataRequestAvailability,
  parseDuplicataInstruction,
} from "@/lib/duplicata-service";
import { DUPLICATA_REQUIRED_PIECES } from "@/lib/duplicata-storage";
import { prisma } from "@/lib/prisma";
import type {
  DiplomePrincipal,
  DocumentAcademique,
  Duplicata,
  Paiement,
  Recu,
  RendezVous,
  TypeDocument,
} from "@/lib/generated/prisma/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge, documentTone } from "@/components/dashboard/status-badge";
import { AppointmentDialog } from "@/components/documents/appointment-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DocumentsPageProps = {
  searchParams?: Promise<{
    exam?: string;
  }>;
};

type DocumentWithAppointments = DocumentAcademique & {
  rendezVous: RendezVous[];
};

type DuplicataWithPayment = Duplicata & {
  paiement: (Paiement & { recu: Recu[] }) | null;
};

type DuplicataTarget = Extract<TypeDocument, "ORIGINAL" | "RELEVE_NOTES">;

const diplomeLabels: Record<DiplomePrincipal, string> = {
  BEPC: "BEPC",
  PROBATOIRE: "Probatoire",
  BACCALAUREAT: "Baccalauréat",
};

const optionLabels: Record<"ORIGINAL" | "RELEVE_NOTES" | "DUPLICATA", string> = {
  ORIGINAL: "Original du diplôme",
  RELEVE_NOTES: "Relevé de notes",
  DUPLICATA: "Duplicata",
};

const documentSummaries: Record<"ORIGINAL" | "RELEVE_NOTES" | "DUPLICATA", string> = {
  ORIGINAL: "Suivi du diplôme original et du rendez-vous de retrait.",
  RELEVE_NOTES: "Suivi du relevé et demande de mise à disposition.",
  DUPLICATA: "Demande, paiement et suivi du retrait du duplicata.",
};

function parseDiplome(value?: string): DiplomePrincipal | null {
  if (value === "BEPC" || value === "PROBATOIRE" || value === "BACCALAUREAT") {
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
  return (
    document?.rendezVous.find((appointment) => isActiveAppointment(appointment.statut)) ?? null
  );
}

function getHonoredAppointment(document: DocumentWithAppointments | null) {
  return document?.rendezVous.find((appointment) => appointment.statut === "HONORE") ?? null;
}

function getDuplicataTitle(diplomeType: DiplomePrincipal, target: DuplicataTarget) {
  return target === "ORIGINAL"
    ? `Duplicata du diplôme original du ${diplomeLabels[diplomeType]}`
    : `Duplicata du relevé de notes du ${diplomeLabels[diplomeType]}`;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function getDuplicataWorkflowStatus(
  document: DocumentAcademique | null,
  duplicataStatus: Duplicata["statut"] | null,
  hasPaidRequest: boolean,
) {
  const status = duplicataStatus ?? document?.statut ?? null;
  if (status === "DISPONIBLE") {
    return { label: "Disponible", tone: "green" as const };
  }
  if (status === "RETIRE") {
    return { label: "Retiré", tone: "blue" as const };
  }
  if (hasPaidRequest) {
    return { label: "En cours de traitement", tone: "amber" as const };
  }
  return { label: "Demande non effectuée", tone: "slate" as const };
}

function getDuplicataContext(
  duplicatas: DuplicataWithPayment[],
  diplomeType: DiplomePrincipal,
  target: DuplicataTarget,
  duplicataDocument: DocumentWithAppointments | null,
) {
  const targetDuplicatas = duplicatas.filter((duplicata) => {
    const meta = parseDuplicataInstruction(duplicata.intruction);
    return meta.diplomeType === diplomeType && meta.cibleDocument === target;
  });
  const latestDuplicata = targetDuplicatas[0] ?? null;
  const activeDuplicataRequest =
    targetDuplicatas.find(
      (duplicata) => duplicata.statut !== "RETIRE" && duplicata.statutValidation !== "REJETEE",
    ) ?? null;
  const activeDuplicataForCurrentExam =
    duplicatas.find((duplicata) => {
      const meta = parseDuplicataInstruction(duplicata.intruction);
      return (
        meta.diplomeType === diplomeType &&
        duplicata.statut !== "RETIRE" &&
        duplicata.statutValidation !== "REJETEE"
      );
    }) ?? null;
  const activeDifferentDuplicataRequest =
    activeDuplicataForCurrentExam && activeDuplicataForCurrentExam.id !== activeDuplicataRequest?.id
      ? activeDuplicataForCurrentExam
      : null;
  const lastRetiredDuplicata =
    targetDuplicatas.find((duplicata) => duplicata.statut === "RETIRE") ?? null;
  const duplicataAvailability = getDuplicataRequestAvailability(
    lastRetiredDuplicata?.updatedAt ?? null,
  );
  const canSubmitDuplicataRequest = Boolean(
    !activeDifferentDuplicataRequest && !activeDuplicataRequest && duplicataAvailability.allowed,
  );
  const workflowStatus = getDuplicataWorkflowStatus(
    duplicataDocument,
    latestDuplicata?.statut ?? null,
    latestDuplicata?.paiement?.statut === "EFFECTUE",
  );

  return {
    activeDifferentDuplicataRequest,
    activeDuplicataRequest,
    canSubmitDuplicataRequest,
    duplicataAvailability,
    latestDuplicata,
    workflowStatus,
  };
}

function AppointmentSummary({ appointment }: { appointment: RendezVous }) {
  return (
    <div className="rounded-md bg-obc-100 p-3 text-sm text-obc-800">
      Rendez-vous planifié le {appointment.dateRdv.toLocaleDateString("fr-FR")} ·{" "}
      {appointment.heureRdv}
    </div>
  );
}

function RetiredSummary({ appointment, label }: { appointment: RendezVous | null; label: string }) {
  return (
    <div className="rounded-md bg-obc-100 p-3 text-sm text-obc-800">
      {label} a déjà été retiré
      {appointment ? ` le ${appointment.updatedAt.toLocaleDateString("fr-FR")}` : ""}.
    </div>
  );
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const user = await requireRole("ELEVE", "/dashboard/documents");
  const params = await searchParams;

  const exams = await prisma.examenValide.findMany({
    where: { eleveId: user.id },
    orderBy: { createdAt: "asc" },
  });
  const selectedExam = parseDiplome(params?.exam);
  const currentExam = exams.find((exam) => exam.diplomeType === selectedExam) ?? exams[0] ?? null;

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
  const activeDuplicataAppointment = getActiveAppointment(duplicataDocument);
  const activeOriginalAppointment = getActiveAppointment(originalDocument);
  const activeReleveAppointment = getActiveAppointment(releveDocument);
  const honoredDuplicataAppointment = getHonoredAppointment(duplicataDocument);
  const honoredOriginalAppointment = getHonoredAppointment(originalDocument);
  const honoredReleveAppointment = getHonoredAppointment(releveDocument);
  const originalRoute = originalDocument ? resolveDocumentRoute(originalDocument) : null;
  const originalPickupLocation = originalDocument
    ? await getPickupLocation(originalDocument)
    : null;
  const releveRoute = releveDocument ? resolveDocumentRoute(releveDocument) : null;
  const relevePickupLocation = releveDocument ? await getPickupLocation(releveDocument) : null;
  const hasOriginalRequest = hasStudentDocumentRequest(originalDocument);
  const hasReleveRequest = hasStudentDocumentRequest(releveDocument);

  return (
    <DashboardShell
      role="ELEVE"
      userId={user.id}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      activePath="/dashboard/documents"
      title="Mes documents scolaires"
      subtitle="Suivez le statut de chaque document et lancez vos demandes en quelques clics."
    >
      {exams.length === 0 || !currentExam ? (
        <p className="rounded-md border border-[var(--border-token)] bg-surface-0 p-5 text-text-3 shadow-card">
          Aucun examen composé n&apos;est rattaché à votre matricule.
        </p>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-1">Examens déjà composés</h2>
                <p className="mt-1 text-sm text-text-3">
                  Les examens non composés ne sont pas affichés.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 md:w-auto md:min-w-0 lg:min-w-[520px]">
                {exams.map((exam) => {
                  const isActive = exam.diplomeType === currentExam.diplomeType;
                  return (
                    <Button
                      key={exam.id}
                      asChild
                      variant={isActive ? "default" : "outline"}
                      className="h-auto justify-start px-3 py-2"
                    >
                      <Link href={`/dashboard/documents?exam=${exam.diplomeType}`}>
                        <GraduationCap className="h-4 w-4" />
                        <span className="truncate">{diplomeLabels[exam.diplomeType]}</span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 rounded-md border border-[var(--border-token)] bg-surface-0 p-4 text-sm shadow-card md:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-text-muted">Examen</p>
                <p className="mt-1 font-semibold text-text-1">
                  {diplomeLabels[currentExam.diplomeType]}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-text-muted">Session</p>
                <p className="mt-1 text-text-2">{currentExam.anneeSession ?? "Non renseignée"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-text-muted">Centre</p>
                <p className="mt-1 truncate text-text-2">
                  {currentExam.centreExamen ?? "Centre non renseigné"}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-text-1">
                Documents du {diplomeLabels[currentExam.diplomeType]}
              </h2>
              <p className="mt-1 text-sm text-text-3">
                Enregistrez d&apos;abord votre demande, puis suivez le statut et prenez rendez-vous
                lorsque le document est disponible.
              </p>
            </div>

            {currentExam.diplomeType === "PROBATOIRE" ? (
              <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
                Le Probatoire ne donne pas lieu à la délivrance d&apos;un diplôme. Seul le relevé de
                notes est disponible.
              </p>
            ) : null}

            <div className="overflow-hidden rounded-md border border-[var(--border-token)] bg-surface-0 shadow-card">
              <Table>
                <TableHeader className="bg-surface-1">
                  <TableRow>
                    <TableHead className="w-[34%] px-4">Document</TableHead>
                    <TableHead className="hidden px-4 md:table-cell">Retrait</TableHead>
                    <TableHead className="px-4">Statut</TableHead>
                    <TableHead className="px-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDocumentRequestAllowed(currentExam.diplomeType, "ORIGINAL") ? (
                    <TableRow>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                          <FileCheck2 className="h-5 w-5 text-obc-800" />
                          <div>
                            <p className="font-medium text-text-1">
                              {optionLabels.ORIGINAL} du {diplomeLabels[currentExam.diplomeType]}
                            </p>
                            <p className="text-xs text-text-3">{documentSummaries.ORIGINAL}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden px-4 text-sm text-text-3 md:table-cell">
                        {currentExam.diplomeType === "BACCALAUREAT"
                          ? "Antenne régionale OBC"
                          : "Centre d'examen"}
                      </TableCell>
                      <TableCell className="px-4">
                        <StatusBadge
                          tone={
                            hasOriginalRequest && originalDocument
                              ? documentTone(originalDocument.statut)
                              : "slate"
                          }
                        >
                          {getStudentDocumentStatusLabel(originalDocument)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                              Détails
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                            <SheetHeader>
                              <SheetTitle>
                                Original du diplôme du {diplomeLabels[currentExam.diplomeType]}
                              </SheetTitle>
                              <SheetDescription>
                                {currentExam.diplomeType === "BACCALAUREAT"
                                  ? "Retrait à l'antenne régionale OBC avec rendez-vous."
                                  : "Retrait au centre d'examen avec rendez-vous."}
                              </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                              {!hasOriginalRequest ? (
                                <>
                                  <p className="rounded-md bg-surface-1 p-3 text-sm text-text-3">
                                    Enregistrez votre demande pour suivre le traitement de votre
                                    diplôme original.
                                  </p>
                                  <PendingDocumentRequestForm
                                    diplomeType={currentExam.diplomeType}
                                    type="ORIGINAL"
                                  />
                                </>
                              ) : (
                                <>
                                  <StatusBadge tone={documentTone(originalDocument!.statut)}>
                                    {getStudentDocumentStatusLabel(originalDocument)}
                                  </StatusBadge>

                                  {originalDocument?.statut === "RETIRE" ? (
                                    <RetiredSummary
                                      appointment={honoredOriginalAppointment}
                                      label="Ce document scolaire"
                                    />
                                  ) : originalDocument?.statut === "DISPONIBLE" ? (
                                    <div className="space-y-4">
                                      <p className="text-sm text-text-3">
                                        Lieu de retrait : {originalPickupLocation}
                                      </p>
                                      {originalRoute?.requiresAppointment &&
                                      activeOriginalAppointment ? (
                                        <AppointmentSummary
                                          appointment={activeOriginalAppointment}
                                        />
                                      ) : originalRoute?.requiresAppointment ? (
                                        <AppointmentDialog
                                          documentId={originalDocument.id}
                                          documentTitle={`Original du diplôme du ${diplomeLabels[currentExam.diplomeType]}`}
                                          disabled={false}
                                        />
                                      ) : (
                                        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                                          Votre diplôme est disponible. Suivez les instructions de
                                          retrait : {originalPickupLocation}.
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                                      Votre demande a été enregistrée. Votre diplôme n&apos;est pas
                                      encore disponible : vous serez notifié dès qu&apos;il le sera.
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ) : null}

                  <TableRow>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-obc-800" />
                        <div>
                          <p className="font-medium text-text-1">
                            {optionLabels.RELEVE_NOTES} du {diplomeLabels[currentExam.diplomeType]}
                          </p>
                          <p className="text-xs text-text-3">{documentSummaries.RELEVE_NOTES}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-4 text-sm text-text-3 md:table-cell">
                      Centre d&apos;examen
                    </TableCell>
                    <TableCell className="px-4">
                      <StatusBadge
                        tone={
                          hasReleveRequest && releveDocument
                            ? documentTone(releveDocument.statut)
                            : "slate"
                        }
                      >
                        {getStudentDocumentStatusLabel(releveDocument)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                            Détails
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                          <SheetHeader>
                            <SheetTitle>
                              Relevé de notes du {diplomeLabels[currentExam.diplomeType]}
                            </SheetTitle>
                            <SheetDescription>
                              Le relevé se retire au centre d&apos;examen après prise de
                              rendez-vous.
                            </SheetDescription>
                          </SheetHeader>
                          <div className="mt-6 space-y-4">
                            {!hasReleveRequest ? (
                              <>
                                <p className="rounded-md bg-surface-1 p-3 text-sm text-text-3">
                                  Enregistrez votre demande de relevé pour suivre son traitement.
                                </p>
                                <PendingDocumentRequestForm
                                  diplomeType={currentExam.diplomeType}
                                  type="RELEVE_NOTES"
                                />
                              </>
                            ) : (
                              <>
                                <StatusBadge tone={documentTone(releveDocument!.statut)}>
                                  {getStudentDocumentStatusLabel(releveDocument)}
                                </StatusBadge>

                                {releveDocument?.statut === "RETIRE" ? (
                                  <RetiredSummary
                                    appointment={honoredReleveAppointment}
                                    label="Ce relevé de notes"
                                  />
                                ) : releveDocument?.statut === "DISPONIBLE" ? (
                                  <div className="space-y-4">
                                    <p className="text-sm text-text-3">
                                      Lieu de retrait : {relevePickupLocation ?? "Centre d'examen"}
                                    </p>
                                    {releveRoute?.requiresAppointment && activeReleveAppointment ? (
                                      <AppointmentSummary appointment={activeReleveAppointment} />
                                    ) : releveRoute?.requiresAppointment ? (
                                      <AppointmentDialog
                                        documentId={releveDocument.id}
                                        documentTitle={`Relevé de notes du ${diplomeLabels[currentExam.diplomeType]}`}
                                        disabled={false}
                                      />
                                    ) : (
                                      <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                                        Votre relevé de notes est disponible :{" "}
                                        {relevePickupLocation}.
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                                    Votre demande a été enregistrée. Votre relevé n&apos;est pas
                                    encore disponible : vous serez notifié dès qu&apos;il le sera.
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>

                  {(["RELEVE_NOTES", "ORIGINAL"] as const)
                    .filter((target) =>
                      isDocumentRequestAllowed(currentExam.diplomeType, "DUPLICATA", target),
                    )
                    .map((target) => {
                      const context = getDuplicataContext(
                        duplicatas,
                        currentExam.diplomeType,
                        target,
                        duplicataDocument,
                      );
                      const duplicataRoute = resolveDocumentRoute({
                        diplomeType: currentExam.diplomeType,
                        typeDocument: target,
                        centreExamen: currentExam.centreExamen,
                        regionComposition: currentExam.regionComposition,
                      });

                      return (
                        <TableRow key={target}>
                          <TableCell className="px-4">
                            <div className="flex items-center gap-3">
                              <RotateCcw className="h-5 w-5 text-obc-800" />
                              <div>
                                <p className="font-medium text-text-1">
                                  {getDuplicataTitle(currentExam.diplomeType, target)}
                                </p>
                                <p className="text-xs text-text-3">{documentSummaries.DUPLICATA}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden px-4 text-sm text-text-3 md:table-cell">
                            {duplicataRoute.location ?? "Service concerné"}
                          </TableCell>
                          <TableCell className="px-4">
                            <StatusBadge tone={context.workflowStatus.tone}>
                              {context.workflowStatus.label}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="px-4 text-right">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                  Détails
                                </Button>
                              </SheetTrigger>
                              <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                                <SheetHeader>
                                  <SheetTitle>
                                    {getDuplicataTitle(currentExam.diplomeType, target)}
                                  </SheetTitle>
                                  <SheetDescription>
                                    Frais de demande : {formatAmount(getDuplicataFee(target))} FCFA.
                                  </SheetDescription>
                                </SheetHeader>
                                <div className="mt-6 space-y-5">
                                  {context.canSubmitDuplicataRequest ? (
                                    <form
                                      action={submitDuplicataRequestAction}
                                      className="space-y-4"
                                    >
                                      <input
                                        type="hidden"
                                        name="diplomeType"
                                        value={currentExam.diplomeType}
                                      />
                                      <input type="hidden" name="cibleDocument" value={target} />

                                      <div className="grid gap-3 md:grid-cols-2">
                                        <Input
                                          value={`${user.prenom} ${user.nom}`}
                                          disabled
                                          aria-label="Nom et prénom"
                                        />
                                        <Input
                                          value={user.matricule}
                                          disabled
                                          aria-label="Numéro matricule"
                                        />
                                        <Input
                                          value={diplomeLabels[currentExam.diplomeType]}
                                          disabled
                                          aria-label="Examen concerné"
                                        />
                                        <Input
                                          name="session"
                                          type="number"
                                          min={1950}
                                          max={new Date().getFullYear()}
                                          defaultValue={
                                            currentExam.anneeSession ?? new Date().getFullYear()
                                          }
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
                                        className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-card outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                      />
                                      <div className="rounded-md border border-[var(--border-token)] bg-surface-1 p-4">
                                        <h4 className="font-semibold text-text-1">
                                          Pièces obligatoires OBC
                                        </h4>
                                        <p className="mt-1 text-xs text-text-3">
                                          Formats acceptés : PDF, JPG, PNG ou WEBP. Taille maximale
                                          : 10 Mo par fichier.
                                        </p>
                                        <div className="mt-4 space-y-4">
                                          {DUPLICATA_REQUIRED_PIECES.map((piece) => (
                                            <div key={piece.type} className="space-y-2">
                                              <label className="text-sm font-medium text-text-1">
                                                {piece.label}
                                              </label>
                                              <Input
                                                name={piece.type}
                                                type="file"
                                                accept="application/pdf,image/jpeg,image/png,image/webp"
                                                required
                                              />
                                              <p className="text-xs text-text-3">
                                                {piece.description}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <Select
                                        name="modePaiement"
                                        defaultValue="ORANGEMONEY"
                                        required
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Mode de paiement" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="ORANGEMONEY">Orange Money</SelectItem>
                                          <SelectItem value="MTNMONEY">MTN Mobile Money</SelectItem>
                                          <SelectItem value="CARTEBANCAIRE">
                                            Carte bancaire
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button type="submit" className="w-full">
                                        <CreditCard className="h-4 w-4" />
                                        Valider et payer
                                      </Button>
                                    </form>
                                  ) : context.activeDifferentDuplicataRequest ? (
                                    <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                                      Une autre demande de duplicata est déjà en cours pour cet
                                      examen.
                                    </p>
                                  ) : !context.duplicataAvailability.allowed &&
                                    context.duplicataAvailability.nextAllowedAt ? (
                                    <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                                      Une nouvelle demande sera possible à partir du{" "}
                                      {context.duplicataAvailability.nextAllowedAt.toLocaleDateString(
                                        "fr-FR",
                                      )}
                                      .
                                    </p>
                                  ) : null}

                                  <div className="rounded-md border border-[var(--border-token)] bg-surface-1 p-4">
                                    <h4 className="font-semibold text-text-1">
                                      Statut de la demande
                                    </h4>
                                    {context.latestDuplicata ? (
                                      <div className="mt-4 space-y-4">
                                        <StatusBadge tone={context.workflowStatus.tone}>
                                          {context.workflowStatus.label}
                                        </StatusBadge>
                                        {context.latestDuplicata.paiement?.recu[0] ? (
                                          <p className="text-sm text-text-3">
                                            Reçu : {context.latestDuplicata.paiement.recu[0].numero}
                                          </p>
                                        ) : null}
                                        {context.latestDuplicata.statutValidation === "REJETEE" ? (
                                          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                                            Votre dossier a été rejeté
                                            {context.latestDuplicata.motifRejet
                                              ? ` : ${context.latestDuplicata.motifRejet}`
                                              : "."}
                                          </div>
                                        ) : context.latestDuplicata.statut === "RETIRE" ? (
                                          <RetiredSummary
                                            appointment={honoredDuplicataAppointment}
                                            label="Ce duplicata"
                                          />
                                        ) : context.latestDuplicata.statut === "DISPONIBLE" ? (
                                          <div className="space-y-3">
                                            <p className="text-sm text-text-3">
                                              Lieu de retrait :{" "}
                                              {duplicataRoute.location ?? "Centre d'examen"}
                                            </p>
                                            {duplicataRoute.requiresAppointment &&
                                            activeDuplicataAppointment ? (
                                              <AppointmentSummary
                                                appointment={activeDuplicataAppointment}
                                              />
                                            ) : duplicataRoute.requiresAppointment &&
                                              duplicataDocument ? (
                                              <AppointmentDialog
                                                documentId={duplicataDocument.id}
                                                documentTitle={getDuplicataTitle(
                                                  currentExam.diplomeType,
                                                  target,
                                                )}
                                                disabled={false}
                                              />
                                            ) : (
                                              <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                                                Votre duplicata est prêt. Aucun rendez-vous
                                                n&apos;est requis.
                                              </div>
                                            )}
                                          </div>
                                        ) : context.latestDuplicata.statutValidation ===
                                          "VALIDEE" ? (
                                          <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                                            Votre dossier OBC est validé. Vous serez notifié lorsque
                                            le duplicata sera prêt.
                                          </div>
                                        ) : (
                                          <p className="text-sm leading-6 text-text-3">
                                            Votre demande de duplicata est en cours de traitement.
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="mt-4 text-sm leading-6 text-text-3">
                                        Aucune demande de duplicata n&apos;a encore été enregistrée
                                        pour ce choix.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </SheetContent>
                            </Sheet>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </section>
        </>
      )}
    </DashboardShell>
  );
}
