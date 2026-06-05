"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type ActivationStep = {
  title: string;
  text: string;
  image: string;
};

export function ActivationSteps({
  steps,
  intervalMs = 5000,
}: {
  steps: ActivationStep[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (reduced.current) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!paused) {
        setProgress((p) => Math.min(1, p + dt / intervalMs));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, intervalMs]);

  useEffect(() => {
    if (progress >= 1) {
      setActive((a) => (a + 1) % steps.length);
      setProgress(0);
    }
  }, [progress, steps.length]);

  const goTo = (index: number) => {
    setActive(index);
    setProgress(0);
  };

  const current = steps[active];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[var(--border-token)] shadow-card sm:aspect-[16/9]">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              index === active ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={index === active ? undefined : true}
          >
            <Image
              src={step.image}
              alt=""
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-obc-900/95 via-obc-900/78 to-obc-900/55"
              aria-hidden="true"
            />
          </div>
        ))}

        <div className="relative flex h-full flex-col justify-end p-6 sm:p-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400 text-lg font-bold text-obc-900 shadow-card">
            {active + 1}
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
            Étape {active + 1} sur {steps.length}
          </p>
          <h3 className="mt-1 font-display text-2xl text-white sm:text-3xl">{current.title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-7 text-white/85 sm:text-base">{current.text}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {steps.map((step, index) => (
          <button
            key={step.title}
            type="button"
            onClick={() => goTo(index)}
            aria-current={index === active ? "step" : undefined}
            className={cn(
              "group rounded-xl border p-3 text-left transition-[var(--transition-base)]",
              index === active
                ? "border-obc-300 bg-surface-0 shadow-card"
                : "border-[var(--border-token)] bg-surface-1 hover:border-obc-200 hover:bg-surface-0",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  index === active ? "bg-obc-800 text-white" : "bg-surface-2 text-text-3",
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "truncate text-sm font-semibold",
                  index === active ? "text-text-1" : "text-text-3",
                )}
              >
                {step.title}
              </span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gold-400 transition-[width] duration-150 ease-linear"
                style={{ width: index === active ? `${Math.round(progress * 100)}%` : "0%" }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
