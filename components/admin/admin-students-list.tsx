import { Mail } from "lucide-react";

import type { AuthenticatedUser } from "@/lib/auth";
import { getAdminStudentsWhere } from "@/lib/admin-student-import";
import { getAdminDocumentScope } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";

type AdminStudentsListProps = {
  user: AuthenticatedUser;
  query?: string;
};

export async function AdminStudentsList({ user, query }: AdminStudentsListProps) {
  const searchTerms = query?.split(/\s+/).filter(Boolean) ?? [];
  const documentScope = getAdminDocumentScope(user);
  const scopeWhere = await getAdminStudentsWhere(user);
  const where = {
    ...scopeWhere,
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
      _count: {
        select: {
          documentsAcademique: { where: documentScope },
          eleveRendezVous: { where: { document: { is: documentScope } } },
        },
      },
    },
  });

  return (
    <div className="space-y-3">
      {query ? (
        <p className="text-sm text-text-3">
          {students.length} résultat{students.length > 1 ? "s" : ""} pour “{query}”.
        </p>
      ) : null}
      <div className="overflow-hidden rounded-md border border-[var(--border-token)] bg-surface-0 shadow-card">
        <div className="hidden grid-cols-[1.2fr_1fr_auto] gap-4 border-b border-[var(--border-token)] bg-surface-1 px-5 py-3 text-sm font-medium text-text-3 md:grid">
          <span>Élève</span>
          <span>Contact</span>
          <span>Dossier</span>
        </div>
        <div className="divide-y divide-[#E8EEF6]">
          {students.length === 0 ? (
            <p className="px-5 py-6 text-sm text-text-3">Aucun élève trouvé.</p>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-text-1">
                    {student.prenom} {student.nom}
                  </p>
                  <p className="text-sm text-text-3">{student.matricule}</p>
                </div>
                <p className="flex min-w-0 items-center gap-2 text-sm text-text-3">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{student.email}</span>
                </p>
                <p className="text-sm text-text-3">
                  {student._count.documentsAcademique} documents scolaires ·{" "}
                  {student._count.eleveRendezVous} RDV
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
