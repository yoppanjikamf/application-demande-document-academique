"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import { reserverDisponibiliteAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Slot = {
  value: string;
  label: string;
  remaining: number;
  disabled: boolean;
};

type AppointmentDialogProps = {
  documentId: string;
  documentTitle: string;
  disabled: boolean;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function AppointmentDialog({ documentId, documentTitle, disabled }: AppointmentDialogProps) {
  const [date, setDate] = useState(todayKey());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const minDate = useMemo(() => todayKey(), []);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`/api/appointments/slots?documentId=${encodeURIComponent(documentId)}&date=${date}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Impossible de charger les creneaux.");
        }
        return response.json() as Promise<{ slots: Slot[] }>;
      })
      .then((payload) => {
        setSlots(payload.slots);
        setSelectedSlot(payload.slots.find((slot) => !slot.disabled)?.value ?? "");
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Erreur inconnue.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [date, disabled, documentId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled} size="sm">
          <CalendarDays />
          Rendez-vous
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rendez-vous de retrait</DialogTitle>
          <DialogDescription>{documentTitle}</DialogDescription>
        </DialogHeader>

        <form action={reserverDisponibiliteAction} className="space-y-4">
          <input type="hidden" name="documentId" value={documentId} />
          <input type="hidden" name="heureRdv" value={selectedSlot} />

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`date-${documentId}`}>
              Date
            </label>
            <Input
              id={`date-${documentId}`}
              name="dateRdv"
              type="date"
              min={minDate}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Creneau horaire</p>
            {loading ? <p className="text-sm text-muted-foreground">Chargement...</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="grid gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  disabled={slot.disabled}
                  onClick={() => setSelectedSlot(slot.value)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:opacity-50 ${
                    selectedSlot === slot.value ? "border-foreground bg-accent" : "border-border"
                  }`}
                >
                  <span className="block font-medium">{slot.label}</span>
                  <span className="text-xs text-muted-foreground">{slot.remaining} places</span>
                </button>
              ))}
            </div>
          </div>

          <Input name="commentaire" placeholder="Commentaire (optionnel)" />

          <DialogFooter>
            <Button type="submit" disabled={!selectedSlot || loading}>
              OK
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
