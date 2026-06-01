import {
  updateAdminQuotaAction,
  upsertHolidayAction,
  deleteHolidayAction,
  toggleWeekendBookingsAction,
} from "@/app/admin/actions";
import { OBC_SETTINGS_ID, formatDateKey, getActiveTimeSlots } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope, getAdminScopeLabel, ORGANISME_IDS } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";

export default async function AdminDisponibilitesPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin/rdv-disponibilites");
  if (user.organismeId === ORGANISME_IDS.DECC) {
    redirect("/admin");
  }
  const documentScope = getAdminDocumentScope(user);
  const scopeLabel = getAdminScopeLabel(user);

  const [settings, slots] = await Promise.all([
    prisma.parametreRendezVous.findUnique({ where: { id: OBC_SETTINGS_ID } }),
    getActiveTimeSlots(),
  ]);
  const quota = settings?.quotaJournalier ?? 200;
  const allowWeekend = settings?.allowWeekendBookings ?? false;

  const holidays = await prisma.jourFerie.findMany({ orderBy: { date: "asc" } });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const rendezVous = await prisma.rendezVous.findMany({
    where: {
      dateRdv: { gte: monthStart, lte: monthEnd },
      statut: { in: ["PLANIFIE", "CONFIRME"] },
      document: { is: documentScope },
    },
    select: { dateRdv: true },
  });

  const countByDay = new Map<string, number>();
  rendezVous.forEach((rdv) => {
    const key = formatDateKey(rdv.dateRdv);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  });

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      organismeId={user.organismeId}
      userName={`${user.prenom} ${user.nom}`}
      scopeLabel={scopeLabel}
      activePath="/admin/rdv-disponibilites"
      title="Disponibilités RDV"
      subtitle="Définissez le quota journalier global du centre et consultez les jours réservés."
    >
      <form
        action={updateAdminQuotaAction}
        className="max-w-xl space-y-3 rounded-md border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label className="text-sm font-medium" htmlFor="quotaJournalier">
          Quota journalier global
        </label>
        <Input
          id="quotaJournalier"
          name="quotaJournalier"
          type="number"
          min={1}
          max={1000}
          defaultValue={quota}
        />
        <Button type="submit">Mettre à jour le quota</Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">Créneaux actifs</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="rounded-md border border-slate-200 bg-white p-4 text-sm shadow-sm"
            >
              {slot.heureDebut} - {slot.heureFin}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">Réservations du mois</h2>
        {[...countByDay.entries()].length === 0 ? (
          <p className="text-slate-500">Aucune réservation ce mois.</p>
        ) : (
          <div className="space-y-3">
            {[...countByDay.entries()].map(([date, count]) => (
              <div key={date} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">{date}</div>
                <div className="text-sm">
                  Réservations : {count} / {quota}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">Paramètres RDV</h2>
        <form action={toggleWeekendBookingsAction} className="flex items-center gap-3">
          <input type="hidden" name="allow" value={String(!allowWeekend)} />
          <div className="text-sm">Autoriser prises de RDV le weekend</div>
          <Button type="submit">{allowWeekend ? "Désactiver" : "Activer"}</Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">Jours fériés</h2>
        <form
          action={upsertHolidayAction}
          className="flex max-w-xl items-end gap-3 rounded-md border border-slate-200 bg-white p-4"
        >
          <div>
            <label className="block text-sm">Date</label>
            <Input id="date" name="date" type="date" />
          </div>
          <div>
            <label className="block text-sm">Nom</label>
            <Input id="nom" name="nom" type="text" />
          </div>
          <Button type="submit">Ajouter / Mettre à jour</Button>
        </form>

        {holidays.length === 0 ? (
          <p className="text-slate-500">Aucun jour férié défini.</p>
        ) : (
          <div className="space-y-2">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3"
              >
                <div>
                  <div className="text-sm text-slate-500">{h.date.toISOString().slice(0, 10)}</div>
                  <div className="font-medium">{h.nom}</div>
                </div>
                <form action={deleteHolidayAction}>
                  <input type="hidden" name="date" value={h.date.toISOString().slice(0, 10)} />
                  <Button type="submit" variant="destructive">
                    Supprimer
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
