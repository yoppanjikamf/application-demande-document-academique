import Link from "next/link";
import { Mail, Search } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope, getAdminScopeLabel } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminStudentsPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function AdminStudentsPage({ searchParams }: AdminStudentsPageProps) {
  const user = await requireRole("ADMINISTRATEUR", "/admin/students");
  const params = await searchParams;
  const q = params?.q?.trim();
  const searchTerms = q?.split(/\s+/).filter(Boolean) ?? [];
  const documentScope = getAdminDocumentScope(user);
  const scopeLabel = getAdminScopeLabel(user);
  const where = {
    role: "ELEVE" as const,
    documentsAcademique: { some: documentScope },
    ...(searchTerms.length > 0
      ? {
          AND: searchTerms.map((term) => ({
            OR: [
              { matricule: { contains: term, mode: "insensitive" as const } },
              { email: { contains: term, mode: "insensitive" as const } },
              { nom: { contains: term, mode: "insensitive" as const } },
              { prenom: { contains: term, mode: "insensitive" as const } },
            ],
          })),
        }
      : {}),
  };

  const students = await prisma.user.findMany({
    where,
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      matricule: true,
      email: true,
      nom: true,
      prenom: true,
      dateNaissance: true,
      _count: {
        select: {
          documentsAcademique: { where: documentScope },
          eleveRendezVous: { where: { document: { is: documentScope } } },
        },
      },
    },
  });

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      organismeId={user.organismeId}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      scopeLabel={scopeLabel}
      activePath="/admin/students"
      title="Élèves"
      subtitle="Recherche et suivi des comptes élèves rattachés aux documents scolaires."
    >
      <form className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <label htmlFor="admin-student-search" className="text-sm font-medium text-[#111827]">
          Recherche élève
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              id="admin-student-search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Matricule, nom, prénom ou email"
              className="pl-9"
            />
          </div>
          <Button type="submit">Rechercher</Button>
          {q ? (
            <Button asChild variant="outline">
              <Link href="/admin/students">Réinitialiser</Link>
            </Button>
          ) : null}
        </div>
        {q ? (
          <p className="mt-3 text-sm text-[#6B7280]">
            {students.length} résultat{students.length > 1 ? "s" : ""} pour “{q}”.
          </p>
        ) : null}
      </form>

      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="grid grid-cols-[1.2fr_1fr_auto] gap-4 border-b border-[#E5E7EB] bg-[#F8F9FA] px-5 py-3 text-sm font-medium text-[#6B7280]">
          <span>Élève</span>
          <span className="hidden md:block">Contact</span>
          <span>Dossier</span>
        </div>
        <div className="divide-y divide-[#E8EEF6]">
          {students.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[#6B7280]">Aucun élève trouvé.</p>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className="grid gap-4 px-5 py-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center"
              >
                <div>
                  <p className="font-medium text-[#111827]">
                    {student.prenom} {student.nom}
                  </p>
                  <p className="text-sm text-[#6B7280]">{student.matricule}</p>
                </div>
                <p className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {student._count.documentsAcademique} documents scolaires ·{" "}
                  {student._count.eleveRendezVous} RDV
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
