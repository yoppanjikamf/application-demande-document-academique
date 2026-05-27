"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { SidebarProvider } from "@/components/dashboard/sidebar-context";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <SidebarProvider>{children}</SidebarProvider>
    </NextThemesProvider>
  );
}
