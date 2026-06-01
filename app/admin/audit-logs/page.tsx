import Link from "next/link";
import { ScrollText } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope, getAdminScopeLabel } from "@/lib/document-routing";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 25;

type AdminAuditLogsPageProps = {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
};

function buildPageHref(page: number, q?: string) {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return `/admin/audit-logs${query ? `?${query}` : ""}`;
}

function formatDetails(details: string | null) {
  if (!details) {
    return null;
  }

  try {
    return JSON.stringify(JSON.parse(details), null, 2);
  } catch {
    return details;
  }
}

export default async function AdminAuditLogsPage({ searchParams }: AdminAuditLogsPageProps) {
  const user = await requireRole("ADMINISTRATEUR", "/admin/audit-logs");
  const params = await searchParams;
  const q = params?.q?.trim();
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const documentScope = getAdminDocumentScope(user);
  const scopeLabel = getAdminScopeLabel(user);
  const scopedDocuments = await prisma.documentAcademique.findMany({
    where: documentScope,
    select: { id: true, eleveId: true },
  });
  const scopedDocumentIds = scopedDocuments.map((document) => document.id);
  const scopedStudentIds = [...new Set(scopedDocuments.map((document) => document.eleveId))];
  const searchWhere: Prisma.AuditLogWhereInput = q
    ? {
        OR: [
          { action: { contains: q, mode: "insensitive" } },
          { resource: { contains: q, mode: "insensitive" } },
          { resourceId: { contains: q, mode: "insensitive" } },
          { details: { contains: q, mode: "insensitive" } },
          { user: { email: { contains: q, mode: "insensitive" } } },
          { user: { matricule: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};
  const scopeWhere: Prisma.AuditLogWhereInput = {
    OR: [
      { resourceId: { in: scopedDocumentIds } },
      { userId: { in: scopedStudentIds } },
      {
        user: {
          organismeId: user.organismeId,
          ...(user.antenneRegionaleId ? { antenneRegionaleId: user.antenneRegionaleId } : {}),
        },
      },
    ],
  };
  const where: Prisma.AuditLogWhereInput = { AND: [scopeWhere, searchWhere] };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            matricule: true,
            nom: true,
            prenom: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      organismeId={user.organismeId}
      userName={`${user.prenom} ${user.nom}`}
      scopeLabel={scopeLabel}
      activePath="/admin/audit-logs"
      title="Journaux d'audit"
      subtitle="Historique des actions sensibles sur les comptes, documents, paiements et rendez-vous."
    >
      <form className="max-w-xl">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Action, ressource, matricule ou email"
        />
      </form>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_auto] border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500">
          <span>Action</span>
          <span>Date</span>
        </div>
        <div className="divide-y divide-slate-100">
          {logs.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ScrollText className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm text-slate-500">Aucun journal trouvé.</p>
            </div>
          ) : (
            logs.map((log) => {
              const details = formatDetails(log.details);

              return (
                <div key={log.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-950">{log.action}</p>
                      <StatusBadge>{log.resource}</StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Ressource {log.resourceId}
                      {log.user
                        ? ` · ${log.user.prenom} ${log.user.nom} · ${log.user.matricule}`
                        : " · Utilisateur système"}
                    </p>
                    {details ? (
                      <details className="mt-3 text-sm text-slate-600">
                        <summary className="cursor-pointer font-medium text-slate-700">
                          Détails
                        </summary>
                        <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                          {details}
                        </pre>
                      </details>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-500">{log.createdAt.toLocaleString("fr-FR")}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {page <= 1 ? (
          <Button variant="outline" disabled>
            Précédent
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={buildPageHref(Math.max(1, page - 1), q)}>Précédent</Link>
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
            <Link href={buildPageHref(Math.min(totalPages, page + 1), q)}>Suivant</Link>
          </Button>
        )}
      </div>
    </DashboardShell>
  );
}
