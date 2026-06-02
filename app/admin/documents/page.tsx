import Link from "next/link";

import { updateDocumentStatusAction } from "@/app/admin/actions";
import type { StatutDocument } from "@/lib/generated/prisma/client";
import { getDocumentTitle, getStatusLabel } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope, getAdminScopeLabel } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
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
      subtitle="Verification physique, changement de statut et suivi des rendez-vous des documents scolaires."
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

      <div className="overflow-hidden rounded-md border border-[var(--border-token)] bg-surface-0 shadow-card">
        <div className="grid grid-cols-[1fr_auto] border-b border-[var(--border-token)] bg-surface-1 px-4 py-3 text-sm font-medium text-text-3">
          <span>Demande</span>
          <span>Statut</span>
        </div>
        {documents.map((document) => (
          <div key={document.id} className="space-y-3 border-b px-4 py-4 last:border-0">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-text-1">
                    {getDocumentTitle(document)}
                  </p>
                  <StatusBadge tone={documentTone(document.statut)}>
                    {getStatusLabel(document.statut)}
                  </StatusBadge>
                </div>
                <p className="text-sm text-text-3">
                  {document.eleve.prenom} {document.eleve.nom} · {document.eleve.matricule}
                </p>
                <p className="text-sm text-text-3">
                  {document.organisme?.nom ?? "Organisme non defini"}
                  {document.antenneRegionale ? ` · ${document.antenneRegionale.nom}` : ""}
                </p>
                <p className="text-sm text-text-3">
                  {document.rendezVous[0]
                    ? `RDV: ${document.rendezVous[0].dateRdv.toLocaleDateString("fr-FR")} ${document.rendezVous[0].heureRdv}`
                    : "Aucun rendez-vous actif"}
                </p>
              </div>
              <form
                action={updateDocumentStatusAction}
                className="flex flex-wrap items-center gap-2"
              >
                <input type="hidden" name="documentId" value={document.id} />
                <select
                  name="statut"
                  defaultValue={document.statut}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {STATUSES.map((item) => (
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
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
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
      </div>
    </DashboardShell>
  );
}
