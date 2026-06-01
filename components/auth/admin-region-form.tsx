"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { unlockAdminRegionAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminRegionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;

  const [accessKey, setAccessKey] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await unlockAdminRegionAction({ accessKey, next });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Region admin validee.");
      router.push(result.redirectTo);
      router.refresh();
    });
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="accessKey">
          Cle unique de la region
        </label>
        <Input
          id="accessKey"
          name="accessKey"
          type="password"
          placeholder="Ex: OBC-CENTRE-2026"
          autoComplete="off"
          value={accessKey}
          onChange={(event) => setAccessKey(event.target.value)}
        />
      </div>

      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? "Validation..." : "Valider ma region"}
      </Button>
    </form>
  );
}
