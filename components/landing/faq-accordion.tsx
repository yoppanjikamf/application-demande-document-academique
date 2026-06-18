"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { useI18n } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FaqItem = {
  q: string;
  a: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
  initialVisibleCount?: number;
};

export function FaqAccordion({ items, initialVisibleCount = 4 }: FaqAccordionProps) {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(items.length <= initialVisibleCount);

  const visibleItems = showAll ? items : items.slice(0, initialVisibleCount);
  const hiddenCount = items.length - initialVisibleCount;

  function toggleItem(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <div className="space-y-3">
      {visibleItems.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={item.q}
            className={cn(
              "overflow-hidden rounded-xl border border-[var(--border-token)] bg-surface-1 shadow-card transition-[var(--transition-base)]",
              isOpen && "border-obc-200 shadow-hover",
            )}
          >
            <button
              type="button"
              id={`faq-question-${index}`}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
              onClick={() => toggleItem(index)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-text-1"
            >
              <span>{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-text-3 transition-transform duration-300",
                  isOpen && "rotate-180 text-obc-700",
                )}
                aria-hidden="true"
              />
            </button>
            <div
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="border-t border-[var(--border-token)] px-5 pb-4 pt-3 text-sm leading-7 text-text-3">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {!showAll && hiddenCount > 0 ? (
        <div className="pt-2 text-center">
          <Button type="button" variant="outline" onClick={() => setShowAll(true)}>
            {t("landing.faqSection.showAll").replace("{count}", String(items.length))}
          </Button>
        </div>
      ) : null}

      {showAll && items.length > initialVisibleCount ? (
        <div className="pt-2 text-center">
          <Button
            type="button"
            variant="ghost"
            className="text-text-3"
            onClick={() => {
              setShowAll(false);
              setOpenIndex(null);
            }}
          >
            {t("landing.faqSection.showLess")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
