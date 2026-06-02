import Link from "next/link";
import { CreditCard } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope, getAdminScopeLabel } from "@/lib/document-routing";
import { Prisma, type StatutPaiement } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge, paymentTone } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 20;
const STATUSES = ["EN_ATTENTE", "EFFECTUE", "ANNULE"] as const;

type AdminPaymentsPageProps = {
  searchParams?: Promise<{
    q?: string;
    statut?: string;
    page?: string;
  }>;
};

function buildPageHref(page: number, q?: string, statut?: StatutPaiement) {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }
  if (statut) {
    params.set("statut", statut);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return `/admin/payments${query ? `?${query}` : ""}`;
}

export default async function AdminPaymentsPage({ searchParams }: AdminPaymentsPageProps) {
  const user = await requireRole("ADMINISTRATEUR", "/admin/payments");
  const params = await searchParams;
  const q = params?.q?.trim();
  const statut = STATUSES.find((value) => value === params?.statut);
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const documentScope = getAdminDocumentScope(user);
  const scopeLabel = getAdminScopeLabel(user);
  const where: Prisma.PaiementWhereInput = {
    OR: [{ documentAcademique: { is: documentScope } }, { duplicata: { is: documentScope } }],
    ...(statut ? { statut } : {}),
    ...(q
      ? {
          AND: [
            {
              OR: [
                { duplicata: { nomDuplicata: { contains: q, mode: "insensitive" } } },
                { duplicata: { eleve: { matricule: { contains: q, mode: "insensitive" } } } },
                { duplicata: { eleve: { email: { contains: q, mode: "insensitive" } } } },
                {
                  documentAcademique: {
                    eleve: { matricule: { contains: q, mode: "insensitive" } },
                  },
                },
                { documentAcademique: { eleve: { email: { contains: q, mode: "insensitive" } } } },
              ],
            },
          ],
        }
      : {}),
  };

  const [payments, total] = await Promise.all([
    prisma.paiement.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        duplicata: { include: { eleve: true } },
        documentAcademique: { include: { eleve: true } },
        recu: true,
      },
    }),
    prisma.paiement.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      organismeId={user.organismeId}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      scopeLabel={scopeLabel}
      activePath="/admin/payments"
      title="Paiements"
      subtitle="Suivi des paiements de duplicata, reçus et annulations."
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form className="w-full max-w-xl">
          {statut ? <input type="hidden" name="statut" value={statut} /> : null}
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Matricule, email ou document scolaire"
          />
        </form>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant={!statut ? "default" : "outline"}>
            <Link href={buildPageHref(1, q)}>Tous</Link>
          </Button>
          {STATUSES.map((item) => (
            <Button key={item} asChild size="sm" variant={statut === item ? "default" : "outline"}>
              <Link href={buildPageHref(1, q, item)}>{item}</Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_auto] border-b border-[#E5E7EB] bg-[#F8F9FA] px-5 py-3 text-sm font-medium text-[#6B7280]">
          <span>Paiement</span>
          <span>Statut</span>
        </div>
        <div className="divide-y divide-[#E8EEF6]">
          {payments.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-[#9CA3AF]" />
              <p className="mt-3 text-sm text-[#6B7280]">Aucun paiement trouvé.</p>
            </div>
          ) : (
            payments.map((payment) => {
              const eleve = payment.duplicata.eleve ?? payment.documentAcademique?.eleve;
              const documentTitle = payment.duplicata.nomDuplicata;

              return (
                <div
                  key={payment.id}
                  className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-medium text-[#111827]">{documentTitle}</p>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {eleve
                        ? `${eleve.prenom} ${eleve.nom} · ${eleve.matricule}`
                        : "Élève introuvable"}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {payment.modePaiment} · {payment.createdAt.toLocaleDateString("fr-FR")}
                      {payment.recu[0] ? ` · Reçu ${payment.recu[0].numero}` : ""}
                    </p>
                  </div>
                  <StatusBadge tone={paymentTone(payment.statut)}>{payment.statut}</StatusBadge>
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
            <Link href={buildPageHref(Math.max(1, page - 1), q, statut)}>Précédent</Link>
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
            <Link href={buildPageHref(Math.min(totalPages, page + 1), q, statut)}>Suivant</Link>
          </Button>
        )}
      </div>
    </DashboardShell>
  );
}
