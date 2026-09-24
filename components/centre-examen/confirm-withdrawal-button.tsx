"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useI18n } from "@/components/i18n/locale-provider";
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
  const { t } = useI18n();
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
        toast.error(data?.error ?? t("dashboard.centre.confirmError"));
        return;
      }

      toast.success(t("dashboard.centre.confirmSuccess"));
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
          {t("dashboard.centre.confirmButton")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.centre.confirmTitle")}</DialogTitle>
          <DialogDescription>{t("dashboard.centre.confirmDescription")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={pending}>
              {t("dashboard.centre.cancel")}
            </Button>
          </DialogClose>
          <Button type="button" onClick={confirmWithdrawal} disabled={pending}>
            {pending ? t("dashboard.centre.confirming") : t("dashboard.centre.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
