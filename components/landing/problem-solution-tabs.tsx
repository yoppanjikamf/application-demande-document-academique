"use client";

import { useState } from "react";
import Image from "next/image";

import { useI18n } from "@/components/i18n/locale-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProblemData = {
  withoutTitle: string;
  withoutSubtitle: string;
  withoutBullets: string[];
  withTitle: string;
  withSubtitle: string;
  withBullets: string[];
  problemImageAlt: string;
  solutionImageAlt: string;
};

export function ProblemSolutionTabs({ problem }: { problem: ProblemData }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"without" | "with">("without");

  const tabs = [
    { id: "without" as const, label: t("landing.problemTabs.without") },
    { id: "with" as const, label: t("landing.problemTabs.with") },
  ];

  return (
    <div>
      <div
        className="inline-flex rounded-full border border-[var(--border-token)] bg-surface-1 p-1 shadow-card"
        role="tablist"
        aria-label={t("landing.problem.eyebrow")}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`problem-panel-${tab.id}`}
            id={`problem-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? tab.id === "without"
                  ? "bg-red-100 text-red-900"
                  : "bg-obc-800 text-white"
                : "text-text-3 hover:text-text-1",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative mt-8 min-h-[420px]">
        <div
          id="problem-panel-without"
          role="tabpanel"
          aria-labelledby="problem-tab-without"
          hidden={activeTab !== "without"}
          className={cn(
            "transition-opacity duration-300",
            activeTab === "without" ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
          )}
        >
          <Card className="overflow-hidden border-red-200/60 bg-red-50/40">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src="/images/landing/probleme-file.png"
                alt={problem.problemImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-red-950/40 to-transparent"
                aria-hidden="true"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-red-900">{problem.withoutTitle}</CardTitle>
              <CardDescription className="text-red-800/80">{problem.withoutSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-red-900/90">
              {problem.withoutBullets.map((line) => (
                <p key={line}>• {line}</p>
              ))}
            </CardContent>
          </Card>
        </div>

        <div
          id="problem-panel-with"
          role="tabpanel"
          aria-labelledby="problem-tab-with"
          hidden={activeTab !== "with"}
          className={cn(
            "transition-opacity duration-300",
            activeTab === "with" ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
          )}
        >
          <Card className="bg-obc-50/50 overflow-hidden border-obc-200">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src="/images/landing/solution-portail.png"
                alt={problem.solutionImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
              <div
                className="from-obc-900/40 absolute inset-0 bg-gradient-to-t to-transparent"
                aria-hidden="true"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-obc-900">{problem.withTitle}</CardTitle>
              <CardDescription className="text-obc-700">{problem.withSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="text-obc-900/90 space-y-3 text-sm leading-6">
              {problem.withBullets.map((line) => (
                <p key={line}>• {line}</p>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
