"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ConfirmWithdrawalButton({
  appointmentId,
  onConfirmed,
}: {
  appointmentId: string;
  onConfirmed?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function confirmWithdrawal() {
    startTransition(async () => {
      const response = await fetch(
        `/api/centre-examen/appointments/${appointmentId}/confirm-withdrawal`,
        { method: "PATCH" },
      );
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        toast.error(data?.error ?? "Confirmation impossible.");
        return;
      }

      toast.success("Retrait confirmé.");
      setOpen(false);
      onConfirmed?.();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Confirmer retrait
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer le retrait</DialogTitle>
          <DialogDescription>
            Confirmez-vous que l&apos;élève a effectivement retiré son document ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={pending}>
              Annuler
            </Button>
          </DialogClose>
          <Button type="button" onClick={confirmWithdrawal} disabled={pending}>
            {pending ? "Confirmation..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
