import Link from "next/link";

import {
  rejectDuplicataRequestAction,
  updateDocumentStatusAction,
  updateDuplicataPieceReviewAction,
  validateDuplicataRequestAction,
} from "@/app/admin/actions";
import type { StatutDocument } from "@/lib/generated/prisma/client";
import { getDocumentTitle, getStatusLabel } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import {
  getAdminDocumentScope,
  getAdminScopeLabel,
  resolveDocumentRoute,
} from "@/lib/document-routing";
import { createDuplicataSignedUrl, DUPLICATA_REQUIRED_PIECES } from "@/lib/duplicata-storage";
import { parseDuplicataInstruction } from "@/lib/duplicata-service";
import { prisma } from "@/lib/prisma";
import {
  DashboardListPanel,
  DashboardListPanelHeader,
  DashboardPaginationBar,
} from "@/components/dashboard/dashboard-list-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge, documentTone } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 20;
const STATUSES = ["PAS_DISPONIBLE", "DISPONIBLE", "RETIRE"] as const;

type AdminDocumentsPageProps = {
  searchParams?: Promise<{
    statut?: string;
    page?: string;
    q?: string;
  }>;
};

function buildPageHref(page: number, status?: StatutDocument, q?: string) {
  const params = new URLSearchParams();
  if (status) {
    params.set("statut", status);
  }
  if (q) {
    params.set("q", q);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return `/admin/documents${query ? `?${query}` : ""}`;
}

function duplicataKey(eleveId: string, diplomeType: string) {
  return `${eleveId}:${diplomeType}`;
}

function duplicataValidationTone(status: string) {
  if (status === "VALIDEE") {
    return "green" as const;
  }
  if (status === "REJETEE") {
    return "red" as const;
  }
  if (status === "EN_ANALYSE") {
    return "amber" as const;
  }

  return "blue" as const;
}

export default async function AdminDocumentsPage({ searchParams }: AdminDocumentsPageProps) {
  const user = await requireRole("ADMINISTRATEUR", "/admin/documents");
  const params = await searchParams;
  const status = STATUSES.find((value) => value === params?.statut);
  const q = params?.q?.trim();
  const searchTerms = q?.split(/\s+/).filter(Boolean) ?? [];
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const scopeLabel = getAdminScopeLabel(user);

  const where = {
    ...getAdminDocumentScope(user),
    ...(status ? { statut: status } : { statut: { not: "RETIRE" as StatutDocument } }),
    ...(searchTerms.length > 0
      ? {
          AND: searchTerms.map((term) => ({
            OR: [
              { eleve: { matricule: { contains: term, mode: "insensitive" as const } } },
              { eleve: { nom: { contains: term, mode: "insensitive" as const } } },
              { eleve: { prenom: { contains: term, mode: "insensitive" as const } } },
              { eleve: { email: { contains: term, mode: "insensitive" as const } } },
            ],
          })),
        }
      : {}),
  };
  const [documents, total] = await Promise.all([
    prisma.documentAcademique.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { updatedAt: "desc" },
      include: {
        eleve: true,
        organisme: true,
        antenneRegionale: true,
        rendezVous: {
          where: { statut: { in: ["PLANIFIE", "CONFIRME"] } },
          orderBy: { dateRdv: "asc" },
          take: 1,
        },
      },
    }),
    prisma.documentAcademique.count({ where }),
  ]);

  const duplicataDocuments = documents.filter((document) => document.typeDocument === "DUPLICATA");
  const duplicatas =
    duplicataDocuments.length > 0
      ? await prisma.duplicata.findMany({
          where: {
            ...{
              ...(user.organismeId ? { organismeId: user.organismeId } : {}),
              ...(user.antenneRegionaleId ? { antenneRegionaleId: user.antenneRegionaleId } : {}),
            },
            OR: duplicataDocuments.map((document) => ({
              eleveId: document.eleveId,
              intruction: { contains: `"diplomeType":"${document.diplomeType}"` },
            })),
          },
          include: {
            pieces: { orderBy: { createdAt: "asc" } },
          },
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        })
      : [];
  const duplicataReviews = await Promise.all(
    duplicatas.map(async (duplicata) => ({
      ...duplicata,
      pieces: await Promise.all(
        duplicata.pieces.map(async (piece) => ({
          ...piece,
          signedUrl: await createDuplicataSignedUrl(piece.path).catch(() => null),
        })),
      ),
    })),
  );
  const duplicataByDocument = new Map(
    duplicataReviews.map((duplicata) => {
      const meta = parseDuplicataInstruction(duplicata.intruction);
      return [duplicataKey(duplicata.eleveId, meta.diplomeType ?? ""), duplicata];
    }),
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      organismeId={user.organismeId}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      scopeLabel={scopeLabel}
      activePath="/admin/documents"
      title="Documents scolaires"
      subtitle="Vérification physique, mise à jour des statuts et suivi des rendez-vous des documents scolaires."
    >
      <form className="rounded-md border border-[var(--border-token)] bg-surface-0 p-4 shadow-card">
        <label htmlFor="admin-document-search" className="text-sm font-medium text-text-1">
          Recherche par élève
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input
            id="admin-document-search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Matricule, nom, prénom ou email"
            className="flex-1"
          />
          {status ? <input type="hidden" name="statut" value={status} /> : null}
          <Button type="submit">Rechercher</Button>
          {q ? (
            <Button asChild variant="outline">
              <Link href={buildPageHref(1, status)}>Réinitialiser</Link>
            </Button>
          ) : null}
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant={!status ? "default" : "outline"}>
          <Link href={buildPageHref(1, undefined, q)}>Tous</Link>
        </Button>
        {STATUSES.map((item) => (
          <Button key={item} asChild size="sm" variant={status === item ? "default" : "outline"}>
            <Link href={buildPageHref(1, item, q)}>{getStatusLabel(item)}</Link>
          </Button>
        ))}
      </div>

      <DashboardListPanel>
        <DashboardListPanelHeader left="Demande" right="Statut" />
        {documents.map((document) => (
          <div key={document.id} className="space-y-4 border-b px-4 py-4 last:border-0 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-text-1">{getDocumentTitle(document)}</p>
                  <StatusBadge tone={documentTone(document.statut)}>
                    {getStatusLabel(document.statut)}
                  </StatusBadge>
                </div>
                <p className="break-words text-sm text-text-3">
                  {document.eleve.prenom} {document.eleve.nom} · {document.eleve.matricule}
                </p>
                <p className="break-words text-sm text-text-3">
                  {document.organisme?.nom ?? "Organisme non defini"}
                  {document.antenneRegionale ? ` · ${document.antenneRegionale.nom}` : ""}
                </p>
                <p className="break-words text-sm text-text-3">
                  {document.rendezVous[0]
                    ? `RDV: ${document.rendezVous[0].dateRdv.toLocaleDateString("fr-FR")} ${document.rendezVous[0].heureRdv}`
                    : "Aucun rendez-vous actif"}
                </p>
              </div>
              <form
                action={updateDocumentStatusAction}
                className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto"
              >
                <input type="hidden" name="documentId" value={document.id} />
                <select
                  name="statut"
                  defaultValue={document.statut}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm sm:w-auto"
                >
                  {STATUSES.filter(
                    (item) =>
                      item !== "RETIRE" ||
                      document.statut === "RETIRE" ||
                      resolveDocumentRoute(document).pickupType === "ANTENNE_REGIONALE",
                  ).map((item) => (
                    <option key={item} value={item}>
                      {getStatusLabel(item)}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm">
                  Modifier
                </Button>
              </form>
            </div>
            {document.typeDocument === "DUPLICATA" ? (
              <div className="rounded-md border border-[var(--border-token)] bg-surface-1 p-4">
                {(() => {
                  const duplicata = duplicataByDocument.get(
                    duplicataKey(document.eleveId, document.diplomeType),
                  );

                  if (!duplicata) {
                    return (
                      <p className="text-sm text-text-3">
                        Aucun dossier de pièces justificatives rattaché à ce duplicata.
                      </p>
                    );
                  }

                  const piecesByType = new Map(
                    duplicata.pieces.map((piece) => [piece.typePiece, piece]),
                  );
                  const allPiecesValidated = DUPLICATA_REQUIRED_PIECES.every(
                    (piece) => piecesByType.get(piece.type)?.statut === "VALIDEE",
                  );

                  return (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-text-1">Analyse du dossier OBC</h3>
                          <p className="mt-1 text-sm text-text-3">
                            Frais officiels : relevé 10.000 F CFA, diplôme 15.000 F CFA.
                          </p>
                        </div>
                        <StatusBadge tone={duplicataValidationTone(duplicata.statutValidation)}>
                          {duplicata.statutValidation}
                        </StatusBadge>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-2">
                        {DUPLICATA_REQUIRED_PIECES.map((requiredPiece) => {
                          const piece = piecesByType.get(requiredPiece.type);

                          return (
                            <div
                              key={requiredPiece.type}
                              className="rounded-md border border-[var(--border-token)] bg-surface-0 p-3"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium text-text-1">{requiredPiece.label}</p>
                                  <p className="mt-1 text-xs text-text-3">
                                    {requiredPiece.description}
                                  </p>
                                </div>
                                <StatusBadge
                                  tone={
                                    piece?.statut === "VALIDEE"
                                      ? "green"
                                      : piece?.statut === "REJETEE"
                                        ? "red"
                                        : "amber"
                                  }
                                >
                                  {piece?.statut ?? "MANQUANTE"}
                                </StatusBadge>
                              </div>
                              {piece ? (
                                <>
                                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                    {piece.signedUrl ? (
                                      <Button asChild size="sm" variant="outline">
                                        <a href={piece.signedUrl} target="_blank" rel="noreferrer">
                                          Ouvrir le fichier
                                        </a>
                                      </Button>
                                    ) : (
                                      <span className="text-red-700">
                                        Lien fichier indisponible
                                      </span>
                                    )}
                                    <span className="text-text-3">
                                      {piece.fileName} · {(piece.size / 1024 / 1024).toFixed(2)} Mo
                                    </span>
                                  </div>
                                  <form
                                    action={updateDuplicataPieceReviewAction}
                                    className="mt-3 space-y-2"
                                  >
                                    <input type="hidden" name="pieceId" value={piece.id} />
                                    <div className="flex flex-wrap gap-2">
                                      <select
                                        name="statut"
                                        defaultValue={piece.statut}
                                        className="h-9 rounded-md border bg-background px-3 text-sm"
                                      >
                                        <option value="VALIDEE">Valider</option>
                                        <option value="REJETEE">Rejeter</option>
                                      </select>
                                      <Input
                                        name="commentaire"
                                        defaultValue={piece.commentaire ?? ""}
                                        placeholder="Commentaire d'analyse"
                                      />
                                      <Button type="submit" size="sm">
                                        Enregistrer
                                      </Button>
                                    </div>
                                  </form>
                                </>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      {duplicata.motifRejet ? (
                        <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                          Motif de rejet : {duplicata.motifRejet}
                        </p>
                      ) : null}

                      <div className="flex flex-col gap-3 border-t border-[var(--border-token)] pt-4 lg:flex-row">
                        <form action={validateDuplicataRequestAction}>
                          <input type="hidden" name="duplicataId" value={duplicata.id} />
                          <Button type="submit" size="sm" disabled={!allPiecesValidated}>
                            Valider le dossier
                          </Button>
                        </form>
                        <form
                          action={rejectDuplicataRequestAction}
                          className="flex flex-1 flex-col gap-2 sm:flex-row"
                        >
                          <input type="hidden" name="duplicataId" value={duplicata.id} />
                          <Input
                            name="motifRejet"
                            placeholder="Motif de rejet du dossier"
                            className="flex-1"
                          />
                          <Button type="submit" size="sm" variant="outline">
                            Rejeter le dossier
                          </Button>
                        </form>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </div>
        ))}
      </DashboardListPanel>

      <DashboardPaginationBar>
        {page <= 1 ? (
          <Button variant="outline" disabled>
            Précédent
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={buildPageHref(Math.max(1, page - 1), status, q)}>Précédent</Link>
          </Button>
        )}
        <p className="text-sm text-muted-foreground">
          Page {page} / {totalPages}
        </p>
        {page >= totalPages ? (
          <Button variant="outline" disabled>
            Suivant
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={buildPageHref(Math.min(totalPages, page + 1), status, q)}>Suivant</Link>
          </Button>
        )}
      </DashboardPaginationBar>
    </DashboardShell>
  );
}
