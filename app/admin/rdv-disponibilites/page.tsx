import { updateAdminQuotaAction } from "@/app/admin/actions";
import { OBC_SETTINGS_ID, formatDateKey, getActiveTimeSlots } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminDisponibilitesPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin/rdv-disponibilites");

  const [settings, slots] = await Promise.all([
    prisma.parametreRendezVous.findUnique({ where: { id: OBC_SETTINGS_ID } }),
    getActiveTimeSlots(),
  ]);
  const quota = settings?.quotaJournalier ?? 200;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const rendezVous = await prisma.rendezVous.findMany({
    where: {
      dateRdv: { gte: monthStart, lte: monthEnd },
      statut: { in: ["PLANIFIE", "CONFIRME"] },
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
      userName={`${user.prenom} ${user.nom}`}
      activePath="/admin/rdv-disponibilites"
      title="Disponibilites RDV"
      subtitle="Definissez le quota journalier global du centre et consultez les jours reserves."
    >
      <form action={updateAdminQuotaAction} className="max-w-xl space-y-3 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
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
        <Button type="submit">Mettre a jour le quota</Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">Creneaux actifs</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {slots.map((slot) => (
            <div key={slot.id} className="rounded-md border border-slate-200 bg-white p-4 text-sm shadow-sm">
              {slot.heureDebut} - {slot.heureFin}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">Reservations du mois</h2>
        {[...countByDay.entries()].length === 0 ? (
          <p className="text-slate-500">Aucune reservation ce mois.</p>
        ) : (
          <div className="space-y-3">
            {[...countByDay.entries()].map(([date, count]) => (
              <div key={date} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">{date}</div>
                <div className="text-sm">Reservations: {count} / {quota}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
