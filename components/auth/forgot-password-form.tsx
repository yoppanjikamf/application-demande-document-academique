"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { passwordForgotSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Values = z.infer<typeof passwordForgotSchema>;

type PasswordApiResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

export function ForgotPasswordForm() {
  const form = useForm<Values>({
    resolver: zodResolver(passwordForgotSchema),
    defaultValues: { email: "" },
  });
  const [pending, startTransition] = React.useTransition();

  const onSubmit = (values: Values) => {
    startTransition(async () => {
      const response = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as PasswordApiResponse;

      if (!response.ok) {
        toast.error(payload.error ?? "Impossible d'envoyer le lien.");
        return;
      }

      toast.success(payload.message ?? "Lien de réinitialisation envoyé.");
      form.reset();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="vous@example.com"
                  type="email"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? "Envoi..." : "Envoyer le lien"}
        </Button>

        <p className="text-sm text-muted-foreground">
          Vous avez déjà votre mot de passe ?{" "}
          <Link href="/auth/login" className="text-foreground underline underline-offset-4">
            Se connecter
          </Link>
          .
        </p>
      </form>
    </Form>
  );
}
