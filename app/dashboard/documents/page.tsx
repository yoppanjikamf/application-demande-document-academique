import Link from "next/link";
import { CreditCard, Eye, FileCheck2, FileText, GraduationCap, RotateCcw } from "lucide-react";

import { submitDuplicataRequestAction } from "@/app/dashboard/actions";
import { PendingDocumentRequestForm } from "@/components/documents/pending-document-request-form";
import {
  ACTIVE_RENDEZ_VOUS_STATUSES,
  getPickupLocation,
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
import {
  AppointmentBookedNotice,
  DiplomaName,
  DocumentStatusText,
  RetiredSummary,
  T,
  DiplomaValueInput,
  NextRequestNotice,
  PickupAt,
  TAria,
  TDiploma,
  TPlaceholderInput,
  TPlaceholderTextarea,
  TSelectValue,
} from "@/components/i18n/ui";
import type { TranslationKey } from "@/lib/i18n/translate";
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

function formatAmount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function getDuplicataTitleKey(target: DuplicataTarget): TranslationKey {
  return target === "ORIGINAL"
    ? "dashboard.documents.duplicateOriginalTitle"
    : "dashboard.documents.duplicateTranscriptTitle";
}

type DuplicataWorkflowStatus =
  | { status: "DISPONIBLE" | "RETIRE"; tone: "green" | "blue" }
  | { key: "dashboard.documents.processing" | "dashboard.documents.notRequested"; tone: "amber" | "slate" };

function DuplicataWorkflowBadge({ workflow }: { workflow: DuplicataWorkflowStatus }) {
  if ("key" in workflow) {
    return (
      <StatusBadge tone={workflow.tone}>
        <T k={workflow.key} />
      </StatusBadge>
    );
  }

  return <StatusBadge tone={workflow.tone} status={workflow.status} />;
}

function getDuplicataWorkflowStatus(
  document: DocumentAcademique | null,
  duplicataStatus: Duplicata["statut"] | null,
  hasPaidRequest: boolean,
): DuplicataWorkflowStatus {
  const status = duplicataStatus ?? document?.statut ?? null;
  if (status === "DISPONIBLE") {
    return { status: "DISPONIBLE" as const, tone: "green" as const };
  }
  if (status === "RETIRE") {
    return { status: "RETIRE" as const, tone: "blue" as const };
  }
  if (hasPaidRequest) {
    return { key: "dashboard.documents.processing" as const, tone: "amber" as const };
  }
  return { key: "dashboard.documents.notRequested" as const, tone: "slate" as const };
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

const actionColumnHeadClassName =
  "sticky right-0 z-10 min-w-[6.5rem] bg-surface-1 px-4 text-right shadow-[-6px_0_10px_-6px_rgba(15,23,42,0.12)]";
const actionColumnCellClassName =
  "sticky right-0 z-10 min-w-[6.5rem] bg-surface-0 px-4 text-right shadow-[-6px_0_10px_-6px_rgba(15,23,42,0.12)] group-hover:bg-muted/50";

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
      titleKey="dashboard.studentDocumentsTitle"
      subtitleKey="dashboard.studentDocumentsSubtitle"
    >
      {exams.length === 0 || !currentExam ? (
        <p className="rounded-md border border-[var(--border-token)] bg-surface-0 p-5 text-text-3 shadow-card">
          <T k="dashboard.documents.noExam" />
        </p>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-1">
                  <T k="dashboard.documents.examsTitle" />
                </h2>
                <p className="mt-1 text-sm text-text-3">
                  <T k="dashboard.documents.examsHint" />
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
                        <span className="truncate">
                          <DiplomaName type={exam.diplomeType} />
                        </span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 rounded-md border border-[var(--border-token)] bg-surface-0 p-4 text-sm shadow-card md:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-text-muted">
                  <T k="dashboard.documents.exam" />
                </p>
                <p className="mt-1 font-semibold text-text-1">
                  <DiplomaName type={currentExam.diplomeType} />
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-text-muted">
                  <T k="dashboard.documents.session" />
                </p>
                <p className="mt-1 text-text-2">
                  {currentExam.anneeSession ?? <T k="dashboard.documents.sessionUnknown" />}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-text-muted">
                  <T k="dashboard.documents.centre" />
                </p>
                <p className="mt-1 truncate text-text-2">
                  {currentExam.centreExamen ?? <T k="dashboard.documents.centreUnknown" />}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-text-1">
                <TDiploma k="dashboard.documents.documentsOf" type={currentExam.diplomeType} />
              </h2>
              <p className="mt-1 text-sm text-text-3">
                <T k="dashboard.documents.documentsHint" />
              </p>
              <p className="mt-2 text-xs text-text-muted md:hidden">
                <T k="dashboard.documents.swipeHint" />
              </p>
            </div>

            {currentExam.diplomeType === "PROBATOIRE" ? (
              <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
                <T k="dashboard.documents.probatoireNote" />
              </p>
            ) : null}

            <div className="rounded-md border border-[var(--border-token)] bg-surface-0 shadow-card">
              <Table className="min-w-[640px]">
                <TableHeader className="bg-surface-1">
                  <TableRow>
                    <TableHead className="w-[34%] px-4">
                      <T k="dashboard.documents.columnDocument" />
                    </TableHead>
                    <TableHead className="hidden px-4 md:table-cell">
                      <T k="dashboard.documents.columnPickup" />
                    </TableHead>
                    <TableHead className="px-4">
                      <T k="dashboard.documents.columnStatus" />
                    </TableHead>
                    <TableHead className={actionColumnHeadClassName}>
                      <T k="dashboard.documents.columnAction" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDocumentRequestAllowed(currentExam.diplomeType, "ORIGINAL") ? (
                    <TableRow className="group">
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                          <FileCheck2 className="h-5 w-5 text-obc-800" />
                          <div>
                            <p className="font-medium text-text-1">
                              <TDiploma
                                k="dashboard.documents.originalTitle"
                                type={currentExam.diplomeType}
                              />
                            </p>
                            <p className="text-xs text-text-3">
                              <T k="dashboard.documents.originalSummary" />
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden px-4 text-sm text-text-3 md:table-cell">
                        {currentExam.diplomeType === "BACCALAUREAT" ? (
                          <T k="dashboard.documents.pickupObc" />
                        ) : (
                          <T k="dashboard.documents.pickupCentre" />
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <StatusBadge
                          tone={
                            hasOriginalRequest && originalDocument
                              ? documentTone(originalDocument.statut)
                              : "slate"
                          }
                        >
                          <DocumentStatusText
                            requested={hasOriginalRequest}
                            statut={originalDocument?.statut}
                          />
                        </StatusBadge>
                      </TableCell>
                      <TableCell className={actionColumnCellClassName}>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                              <T k="dashboard.documents.details" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                            <SheetHeader>
                              <SheetTitle>
                                <TDiploma
                                  k="dashboard.documents.originalTitle"
                                  type={currentExam.diplomeType}
                                />
                              </SheetTitle>
                              <SheetDescription>
                                {currentExam.diplomeType === "BACCALAUREAT" ? (
                                  <T k="dashboard.documents.originalDescBac" />
                                ) : (
                                  <T k="dashboard.documents.originalDescOther" />
                                )}
                              </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                              {!hasOriginalRequest ? (
                                <>
                                  <p className="rounded-md bg-surface-1 p-3 text-sm text-text-3">
                                    <T k="dashboard.documents.registerOriginal" />
                                  </p>
                                  <PendingDocumentRequestForm
                                    diplomeType={currentExam.diplomeType}
                                    type="ORIGINAL"
                                  />
                                </>
                              ) : (
                                <>
                                  <StatusBadge tone={documentTone(originalDocument!.statut)}>
                                    <DocumentStatusText
                                      requested={hasOriginalRequest}
                                      statut={originalDocument?.statut}
                                    />
                                  </StatusBadge>

                                  {originalDocument?.statut === "RETIRE" ? (
                                    <RetiredSummary
                                      date={honoredOriginalAppointment?.updatedAt}
                                      labelKey="dashboard.documents.schoolDocumentLabel"
                                    />
                                  ) : originalDocument?.statut === "DISPONIBLE" ? (
                                    <div className="space-y-4">
                                      <p className="text-sm text-text-3">
                                        <PickupAt place={originalPickupLocation} />
                                      </p>
                                      {originalRoute?.requiresAppointment &&
                                      activeOriginalAppointment ? (
                                        <AppointmentBookedNotice
                                          date={activeOriginalAppointment.dateRdv}
                                          time={activeOriginalAppointment.heureRdv}
                                        />
                                      ) : originalRoute?.requiresAppointment ? (
                                        <AppointmentDialog
                                          documentId={originalDocument.id}
                                          documentTitleKey="dashboard.documents.originalTitle"
                                          diplomeType={currentExam.diplomeType}
                                          disabled={false}
                                        />
                                      ) : (
                                        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                                          <T
                                            k="dashboard.documents.originalReady"
                                            vars={{ place: originalPickupLocation ?? "" }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                                      <T k="dashboard.documents.originalPending" />
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

                  <TableRow className="group">
                    <TableCell className="px-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-obc-800" />
                        <div>
                          <p className="font-medium text-text-1">
                            <TDiploma
                              k="dashboard.documents.transcriptTitle"
                              type={currentExam.diplomeType}
                            />
                          </p>
                          <p className="text-xs text-text-3">
                            <T k="dashboard.documents.transcriptSummary" />
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-4 text-sm text-text-3 md:table-cell">
                      <T k="dashboard.documents.pickupCentre" />
                    </TableCell>
                    <TableCell className="px-4">
                      <StatusBadge
                        tone={
                          hasReleveRequest && releveDocument
                            ? documentTone(releveDocument.statut)
                            : "slate"
                        }
                      >
                        <DocumentStatusText
                          requested={hasReleveRequest}
                          statut={releveDocument?.statut}
                        />
                      </StatusBadge>
                    </TableCell>
                    <TableCell className={actionColumnCellClassName}>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                            <T k="dashboard.documents.details" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                          <SheetHeader>
                            <SheetTitle>
                              <TDiploma
                                k="dashboard.documents.transcriptTitle"
                                type={currentExam.diplomeType}
                              />
                            </SheetTitle>
                            <SheetDescription>
                              <T k="dashboard.documents.transcriptDesc" />
                            </SheetDescription>
                          </SheetHeader>
                          <div className="mt-6 space-y-4">
                            {!hasReleveRequest ? (
                              <>
                                <p className="rounded-md bg-surface-1 p-3 text-sm text-text-3">
                                  <T k="dashboard.documents.registerTranscript" />
                                </p>
                                <PendingDocumentRequestForm
                                  diplomeType={currentExam.diplomeType}
                                  type="RELEVE_NOTES"
                                />
                              </>
                            ) : (
                              <>
                                <StatusBadge tone={documentTone(releveDocument!.statut)}>
                                  <DocumentStatusText
                                    requested={hasReleveRequest}
                                    statut={releveDocument?.statut}
                                  />
                                </StatusBadge>

                                {releveDocument?.statut === "RETIRE" ? (
                                  <RetiredSummary
                                    date={honoredReleveAppointment?.updatedAt}
                                    labelKey="dashboard.documents.transcriptItemLabel"
                                  />
                                ) : releveDocument?.statut === "DISPONIBLE" ? (
                                  <div className="space-y-4">
                                    <p className="text-sm text-text-3">
                                      <PickupAt place={relevePickupLocation} />
                                    </p>
                                    {releveRoute?.requiresAppointment && activeReleveAppointment ? (
                                      <AppointmentBookedNotice
                                        date={activeReleveAppointment.dateRdv}
                                        time={activeReleveAppointment.heureRdv}
                                      />
                                    ) : releveRoute?.requiresAppointment ? (
                                      <AppointmentDialog
                                        documentId={releveDocument.id}
                                        documentTitleKey="dashboard.documents.transcriptTitle"
                                        diplomeType={currentExam.diplomeType}
                                        disabled={false}
                                      />
                                    ) : (
                                      <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                                        <T
                                          k="dashboard.documents.transcriptReady"
                                          vars={{ place: relevePickupLocation ?? "" }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                                    <T k="dashboard.documents.transcriptPending" />
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
                        <TableRow key={target} className="group">
                          <TableCell className="px-4">
                            <div className="flex items-center gap-3">
                              <RotateCcw className="h-5 w-5 text-obc-800" />
                              <div>
                                <p className="font-medium text-text-1">
                                  <TDiploma
                                    k={getDuplicataTitleKey(target)}
                                    type={currentExam.diplomeType}
                                  />
                                </p>
                                <p className="text-xs text-text-3">
                                  <T k="dashboard.documents.duplicateSummary" />
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden px-4 text-sm text-text-3 md:table-cell">
                            {duplicataRoute.location ?? <T k="dashboard.documents.pickupService" />}
                          </TableCell>
                          <TableCell className="px-4">
                            <DuplicataWorkflowBadge workflow={context.workflowStatus} />
                          </TableCell>
                          <TableCell className={actionColumnCellClassName}>
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                  <T k="dashboard.documents.details" />
                                </Button>
                              </SheetTrigger>
                              <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                                <SheetHeader>
                                  <SheetTitle>
                                    <TDiploma
                                      k={getDuplicataTitleKey(target)}
                                      type={currentExam.diplomeType}
                                    />
                                  </SheetTitle>
                                  <SheetDescription>
                                    <T
                                      k="dashboard.documents.fee"
                                      vars={{ amount: formatAmount(getDuplicataFee(target)) }}
                                    />
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
                                        <TAria
                                          k="dashboard.documents.fullName"
                                          value={`${user.prenom} ${user.nom}`}
                                          disabled
                                        />
                                        <TAria
                                          k="dashboard.documents.studentId"
                                          value={user.matricule}
                                          disabled
                                        />
                                        <DiplomaValueInput
                                          type={currentExam.diplomeType}
                                          disabled
                                          aria-label="exam"
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

                                      <TPlaceholderInput
                                        k="dashboard.documents.examCentrePlaceholder"
                                        name="centreExamen"
                                        defaultValue={currentExam.centreExamen ?? ""}
                                        required
                                      />
                                      <TPlaceholderTextarea
                                        k="dashboard.documents.reasonPlaceholder"
                                        name="motif"
                                        required
                                      />
                                      <div className="rounded-md border border-[var(--border-token)] bg-surface-1 p-4">
                                        <h4 className="font-semibold text-text-1">
                                          <T k="dashboard.documents.requiredPieces" />
                                        </h4>
                                        <p className="mt-1 text-xs text-text-3">
                                          <T k="dashboard.documents.fileHint" />
                                        </p>
                                        <div className="mt-4 space-y-4">
                                          {DUPLICATA_REQUIRED_PIECES.map((piece) => (
                                            <div key={piece.type} className="space-y-2">
                                              <label className="text-sm font-medium text-text-1">
                                                <T
                                                  k={
                                                    `dashboard.documents.pieces.${piece.type}.label` as TranslationKey
                                                  }
                                                />
                                              </label>
                                              <Input
                                                name={piece.type}
                                                type="file"
                                                accept="application/pdf,image/jpeg,image/png,image/webp"
                                                required
                                              />
                                              <p className="text-xs text-text-3">
                                                <T
                                                  k={
                                                    `dashboard.documents.pieces.${piece.type}.description` as TranslationKey
                                                  }
                                                />
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
                                          <TSelectValue k="dashboard.documents.paymentMode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="ORANGEMONEY">
                                            <T k="dashboard.payments.ORANGEMONEY" />
                                          </SelectItem>
                                          <SelectItem value="MTNMONEY">
                                            <T k="dashboard.payments.MTNMONEY" />
                                          </SelectItem>
                                          <SelectItem value="CARTEBANCAIRE">
                                            <T k="dashboard.payments.CARTEBANCAIRE" />
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button type="submit" className="w-full">
                                        <CreditCard className="h-4 w-4" />
                                        <T k="dashboard.documents.pay" />
                                      </Button>
                                    </form>
                                  ) : context.activeDifferentDuplicataRequest ? (
                                    <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                                      <T k="dashboard.documents.otherDuplicateActive" />
                                    </p>
                                  ) : !context.duplicataAvailability.allowed &&
                                    context.duplicataAvailability.nextAllowedAt ? (
                                    <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                                      <NextRequestNotice
                                        date={context.duplicataAvailability.nextAllowedAt}
                                      />
                                    </p>
                                  ) : null}

                                  <div className="rounded-md border border-[var(--border-token)] bg-surface-1 p-4">
                                    <h4 className="font-semibold text-text-1">
                                      <T k="dashboard.documents.requestStatus" />
                                    </h4>
                                    {context.latestDuplicata ? (
                                      <div className="mt-4 space-y-4">
                                        <DuplicataWorkflowBadge workflow={context.workflowStatus} />
                                        {context.latestDuplicata.paiement?.recu[0] ? (
                                          <p className="text-sm text-text-3">
                                            <T
                                              k="dashboard.documents.receipt"
                                              vars={{
                                                numero:
                                                  context.latestDuplicata.paiement.recu[0].numero,
                                              }}
                                            />
                                          </p>
                                        ) : null}
                                        {context.latestDuplicata.statutValidation === "REJETEE" ? (
                                          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                                            <T
                                              k="dashboard.documents.rejected"
                                              vars={{
                                                reason: context.latestDuplicata.motifRejet
                                                  ? ` : ${context.latestDuplicata.motifRejet}`
                                                  : ".",
                                              }}
                                            />
                                          </div>
                                        ) : context.latestDuplicata.statut === "RETIRE" ? (
                                          <RetiredSummary
                                            date={honoredDuplicataAppointment?.updatedAt}
                                            labelKey="dashboard.documents.duplicateItemLabel"
                                          />
                                        ) : context.latestDuplicata.statut === "DISPONIBLE" ? (
                                          <div className="space-y-3">
                                            <p className="text-sm text-text-3">
                                              <PickupAt place={duplicataRoute.location} />
                                            </p>
                                            {duplicataRoute.requiresAppointment &&
                                            activeDuplicataAppointment ? (
                                              <AppointmentBookedNotice
                                                date={activeDuplicataAppointment.dateRdv}
                                                time={activeDuplicataAppointment.heureRdv}
                                              />
                                            ) : duplicataRoute.requiresAppointment &&
                                              duplicataDocument ? (
                                              <AppointmentDialog
                                                documentId={duplicataDocument.id}
                                                documentTitleKey={getDuplicataTitleKey(target)}
                                                diplomeType={currentExam.diplomeType}
                                                disabled={false}
                                              />
                                            ) : (
                                              <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                                                <T k="dashboard.documents.duplicateReady" />
                                              </div>
                                            )}
                                          </div>
                                        ) : context.latestDuplicata.statutValidation ===
                                          "VALIDEE" ? (
                                          <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                                            <T k="dashboard.documents.dossierValidated" />
                                          </div>
                                        ) : (
                                          <p className="text-sm leading-6 text-text-3">
                                            <T k="dashboard.documents.duplicateProcessing" />
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="mt-4 text-sm leading-6 text-text-3">
                                        <T k="dashboard.documents.noDuplicateYet" />
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
