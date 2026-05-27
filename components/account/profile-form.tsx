"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { profileUpdateSchema } from "@/lib/validations";
import { updateProfileAction } from "@/app/account/actions";
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

type Values = z.infer<typeof profileUpdateSchema>;

type ProfileFormProps = {
  role: "ADMINISTRATEUR" | "ELEVE";
  email: string;
  defaultValues: Values;
};

export function ProfileForm({ role, email, defaultValues }: ProfileFormProps) {
  const form = useForm<Values>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues,
  });

  const [pending, startTransition] = React.useTransition();

  const onSubmit = (values: Values) => {
    startTransition(async () => {
      const res = await updateProfileAction(values);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Informations mises a jour.");
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input value={email} disabled />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom" autoComplete="family-name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prenom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prenom</FormLabel>
              <FormControl>
                <Input placeholder="Prenom" autoComplete="given-name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {role === "ELEVE" ? (
          <FormField
            control={form.control}
            name="dateNaissance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de naissance</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        {role === "ADMINISTRATEUR" ? (
          <FormItem>
            <FormLabel>Service</FormLabel>
            <FormControl>
              <Input value="OBC" disabled />
            </FormControl>
          </FormItem>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Mise a jour..." : "Mettre a jour"}
        </Button>
      </form>
    </Form>
  );
}
