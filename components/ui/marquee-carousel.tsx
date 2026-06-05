"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type MarqueeCarouselProps = {
  items: React.ReactNode[];
  /** Durée d'un cycle complet en secondes (plus grand = plus lent). */
  durationSeconds?: number;
  itemClassName?: string;
  className?: string;
  ariaLabel?: string;
};

/**
 * Carrousel à défilement automatique et continu (droite -> gauche).
 * Les éléments sont dupliqués pour une boucle sans couture ; l'animation
 * se met en pause au survol et se désactive si l'utilisateur préfère
 * réduire les animations (accessibilité).
 */
export function MarqueeCarousel({
  items,
  durationSeconds = 42,
  itemClassName,
  className,
  ariaLabel,
}: MarqueeCarouselProps) {
  const loopItems = [...items, ...items];

  return (
    <div className={cn("dr-marquee", className)} role="region" aria-label={ariaLabel}>
      <div
        className="dr-marquee-track gap-6 py-2"
        style={{ "--dr-marquee-duration": `${durationSeconds}s` } as React.CSSProperties}
      >
        {loopItems.map((item, index) => (
          <div
            key={index}
            aria-hidden={index >= items.length}
            className={cn("shrink-0", itemClassName)}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
