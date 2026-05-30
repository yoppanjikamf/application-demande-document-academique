"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { passwordResetSchema } from "@/lib/validations";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Values = z.infer<typeof passwordResetSchema>;

type PasswordApiResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

export function ResetPasswordForm({ email, token }: { email?: string; token?: string }) {
  const router = useRouter();
  const form = useForm<Values>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email,
      token,
      newPassword: "",
      confirmPassword: "",
    },
  });
  const [pending, startTransition] = React.useTransition();

  const onSubmit = (values: Values) => {
    startTransition(async () => {
      const body = {
        ...(email && token ? { email, token } : {}),
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };

      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as PasswordApiResponse;

      if (!response.ok) {
        toast.error(payload.error ?? "Impossible de changer le mot de passe.");
        return;
      }

      toast.success(payload.message ?? "Mot de passe mis à jour.");
      router.push("/auth/login");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouveau mot de passe</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? "Mise à jour..." : "Changer le mot de passe"}
        </Button>
      </form>
    </Form>
  );
}
