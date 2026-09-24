import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope, getAdminScopeLabel, ORGANISME_IDS } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { AdminHomeView } from "@/components/dashboard/admin-home-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildThirtyDaySeries() {
  const today = startOfDay();

  return Array.from({ length: 30 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - 29 + index);

    return {
      key: dateKey(day),
      label: day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      value: 0,
    };
  });
}

export default async function AdminPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin");
  const documentScope = getAdminDocumentScope(user);
  const scopeLabel = getAdminScopeLabel(user);
  const canManageAppointments =
    user.organismeId === ORGANISME_IDS.OBC || user.organismeId === ORGANISME_IDS.DECC;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(startOfDay());
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const series = buildThirtyDaySeries();
  const duplicataPaymentScope = {
    ...(user.organismeId ? { organismeId: user.organismeId } : {}),
    ...(user.antenneRegionaleId ? { antenneRegionaleId: user.antenneRegionaleId } : {}),
  };

  const [
    elevesCount,
    documentsEnAttente,
    rendezVousTodayCount,
    paiementsMoisCount,
    recentDocuments,
    todayAppointments,
    honoredAppointments,
    adminSettings,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "ELEVE", documentsAcademique: { some: documentScope } } }),
    prisma.documentAcademique.count({ where: { ...documentScope, statut: "PAS_DISPONIBLE" } }),
    prisma.rendezVous.count({
      where: {
        statut: { in: ["PLANIFIE", "CONFIRME"] },
        dateRdv: { gte: startOfDay(), lte: endOfDay() },
        document: { is: documentScope },
      },
    }),
    prisma.paiement.count({
      where: {
        statut: "EFFECTUE",
        createdAt: { gte: monthStart },
        OR: [
          { documentAcademique: { is: documentScope } },
          { duplicata: { is: duplicataPaymentScope } },
        ],
      },
    }),
    prisma.documentAcademique.findMany({
      where: documentScope,
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { eleve: true, organisme: true },
    }),
    prisma.rendezVous.findMany({
      where: {
        statut: { in: ["PLANIFIE", "CONFIRME"] },
        dateRdv: { gte: startOfDay(), lte: endOfDay() },
        document: { is: documentScope },
      },
      take: 8,
      orderBy: [{ heureRdv: "asc" }],
      include: { eleve: true, document: true },
    }),
    prisma.rendezVous.findMany({
      where: {
        statut: "HONORE",
        retraitConfirmeAt: { gte: thirtyDaysAgo },
        document: { is: documentScope },
      },
      select: { retraitConfirmeAt: true },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { maxRdvParJour: true },
    }),
  ]);

  const countsByDay = new Map(series.map((item) => [item.key, 0]));
  honoredAppointments.forEach((appointment) => {
    if (appointment.retraitConfirmeAt) {
      const key = dateKey(appointment.retraitConfirmeAt);
      countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
    }
  });
  const chartSeries = series.map((item) => ({
    ...item,
    value: countsByDay.get(item.key) ?? 0,
  }));
  const chartValues = chartSeries.map((item) => item.value);
  const quota = adminSettings?.maxRdvParJour ?? 10;
  const quotaRatio = quota > 0 ? rendezVousTodayCount / quota : 0;
  const quotaAlmostReached = quotaRatio >= 0.8;

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      organismeId={user.organismeId}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      scopeLabel={scopeLabel}
      activePath="/admin"
      titleKey="dashboard.adminHomeTitle"
      titleVars={{ service: user.nomService ?? "" }}
      subtitleKey="dashboard.adminHomeSubtitle"
      subtitleVars={{ scope: scopeLabel ?? "—" }}
    >
      <AdminHomeView
        userName={`${user.prenom} ${user.nom}`}
        scopeLabel={scopeLabel ?? null}
        elevesCount={elevesCount}
        documentsEnAttente={documentsEnAttente}
        rendezVousTodayCount={rendezVousTodayCount}
        paiementsMoisCount={paiementsMoisCount}
        quota={quota}
        quotaAlmostReached={quotaAlmostReached}
        withdrawalsCount={honoredAppointments.length}
        chartValues={chartValues}
        recentDocuments={recentDocuments.map((document) => ({
          id: document.id,
          statut: document.statut,
          diplomeType: document.diplomeType,
          typeDocument: document.typeDocument,
          eleve: {
            prenom: document.eleve.prenom,
            nom: document.eleve.nom,
            matricule: document.eleve.matricule,
          },
          organismeNom: document.organisme?.nom ?? null,
        }))}
        todayAppointments={todayAppointments.map((rdv) => ({
          id: rdv.id,
          heureRdv: rdv.heureRdv,
          statut: rdv.statut,
          matricule: rdv.eleve.matricule,
          diplomeType: rdv.document?.diplomeType ?? null,
          typeDocument: rdv.document?.typeDocument ?? null,
        }))}
        canManageAppointments={canManageAppointments}
      />
    </DashboardShell>
  );
}
