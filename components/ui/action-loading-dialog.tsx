"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionLoadingDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  hint?: string;
};

export function ActionLoadingDialog({
  open,
  title = "Traitement en cours",
  description = "Veuillez patienter. Une action est en cours en arrière-plan.",
  hint = "Ne fermez pas cette fenêtre tant que l'opération n'est pas terminée.",
}: ActionLoadingDialogProps) {
  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-obc-900/55 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%]",
            "rounded-md border border-[var(--border-token)] bg-surface-0 p-6 shadow-modal",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          aria-busy={open}
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-obc-100">
              <Loader2 className="h-7 w-7 animate-spin text-obc-800" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <DialogPrimitive.Title className="font-display text-xl text-text-1">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm leading-6 text-text-3">
                {description}
              </DialogPrimitive.Description>
              <p className="text-xs text-text-muted">{hint}</p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

type PendingFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  pendingTitle?: string;
  pendingDescription?: string;
  pendingHint?: string;
};

export function PendingForm({
  action,
  children,
  className,
  pendingTitle,
  pendingDescription,
  pendingHint,
}: PendingFormProps) {
  return (
    <form action={action} className={className}>
      <PendingFormFeedback
        pendingTitle={pendingTitle}
        pendingDescription={pendingDescription}
        pendingHint={pendingHint}
      />
      {children}
    </form>
  );
}

function PendingFormFeedback({
  pendingTitle,
  pendingDescription,
  pendingHint,
}: Pick<PendingFormProps, "pendingTitle" | "pendingDescription" | "pendingHint">) {
  const { pending } = useFormStatus();

  return (
    <ActionLoadingDialog
      open={pending}
      title={pendingTitle}
      description={pendingDescription}
      hint={pendingHint}
    />
  );
}

type PendingSubmitButtonProps = React.ComponentProps<typeof Button> & {
  pendingLabel?: string;
};

export function PendingSubmitButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending ? (pendingLabel ?? "Traitement...") : children}
    </Button>
  );
}

type PendingNavigationFormProps = {
  children: React.ReactNode;
  className?: string;
  pendingTitle?: string;
  pendingDescription?: string;
  buildHref: (formData: FormData) => string;
};

export function PendingNavigationForm({
  children,
  className,
  pendingTitle,
  pendingDescription,
  buildHref,
}: PendingNavigationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  return (
    <>
      <ActionLoadingDialog
        open={isPending}
        title={pendingTitle ?? "Chargement en cours"}
        description={
          pendingDescription ??
          "Veuillez patienter pendant la mise à jour de la page."
        }
        hint="La liste sera actualisée automatiquement."
      />
      <form
        className={className}
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const href = buildHref(formData);

          startTransition(() => {
            router.push(href);
          });
        }}
      >
        {children}
      </form>
    </>
  );
}
