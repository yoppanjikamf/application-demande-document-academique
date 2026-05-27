import Link from "next/link";

import { updateDocumentStatusAction } from "@/app/admin/actions";
import { getDocumentTitle, getStatusLabel } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge, documentTone } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;
const STATUSES = ["PAS_DISPONIBLE", "DISPONIBLE", "RETIRE"] as const;

type AdminDocumentsPageProps = {
  searchParams?: Promise<{
    statut?: string;
    page?: string;
  }>;
};

export default async function AdminDocumentsPage({ searchParams }: AdminDocumentsPageProps) {
  const user = await requireRole("ADMINISTRATEUR", "/admin/documents");
  const params = await searchParams;
  const status = STATUSES.find((value) => value === params?.statut);
  const page = Math.max(1, Number(params?.page ?? "1") || 1);

  const where = status ? { statut: status } : {};
  const [documents, total] = await Promise.all([
    prisma.documentAcademique.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { updatedAt: "desc" },
      include: {
        eleve: true,
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
      userName={`${user.prenom} ${user.nom}`}
      activePath="/admin/documents"
      title="Documents academiques"
      subtitle="Verification physique, changement de statut et suivi des rendez-vous."
    >
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant={!status ? "default" : "outline"}>
          <Link href="/admin/documents">Tous</Link>
        </Button>
        {STATUSES.map((item) => (
          <Button key={item} asChild size="sm" variant={status === item ? "default" : "outline"}>
            <Link href={`/admin/documents?statut=${item}`}>{getStatusLabel(item)}</Link>
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_auto] border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
          <span>Demande</span>
          <span>Statut</span>
        </div>
        {documents.map((document) => (
          <div key={document.id} className="space-y-3 border-b px-4 py-4 last:border-0">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-slate-950">{getDocumentTitle(document)}</p>
                  <StatusBadge tone={documentTone(document.statut)}>{getStatusLabel(document.statut)}</StatusBadge>
                </div>
                <p className="text-sm text-slate-500">
                  {document.eleve.prenom} {document.eleve.nom} · {document.eleve.matricule}
                </p>
                <p className="text-sm text-slate-500">
                  {document.rendezVous[0]
                    ? `RDV: ${document.rendezVous[0].dateRdv.toLocaleDateString("fr-FR")} ${document.rendezVous[0].heureRdv}`
                    : "Aucun rendez-vous actif"}
                </p>
              </div>
              <form action={updateDocumentStatusAction} className="flex flex-wrap items-center gap-2">
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
            Precedent
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link
              href={`/admin/documents?page=${Math.max(1, page - 1)}${status ? `&statut=${status}` : ""}`}
            >
              Precedent
            </Link>
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
            <Link
              href={`/admin/documents?page=${Math.min(totalPages, page + 1)}${status ? `&statut=${status}` : ""}`}
            >
              Suivant
            </Link>
          </Button>
        )}
      </div>
    </DashboardShell>
  );
}
