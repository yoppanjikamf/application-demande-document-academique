"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { signInSchema } from "@/lib/validations";
import { signInAction } from "@/app/auth/actions";
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
import { Input } from "@/components/ui/input";

type Values = z.infer<typeof signInSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const form = useForm<Values>({
    resolver: zodResolver(signInSchema),
    defaultValues: { matricule: "", email: "", password: "" },
  });

  const [pending, startTransition] = React.useTransition();

  const onSubmit = (values: Values) => {
    startTransition(async () => {
      const res = await signInAction({ ...values, next });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Connexion reussie !");
      router.push(res.redirectTo);
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="matricule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matricule</FormLabel>
              <FormControl>
                <Input placeholder="OBC20260001" autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="vous@example.com" type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? "Connexion..." : "Se connecter"}
        </Button>

        <p className="text-sm text-muted-foreground">
          Pas encore inscrit ?{" "}
          <Link href="/auth/register" className="text-foreground underline underline-offset-4">
            Activer mon compte
          </Link>
          .
        </p>
      </form>
    </Form>
  );
}
