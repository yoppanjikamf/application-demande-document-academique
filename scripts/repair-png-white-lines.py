#!/usr/bin/env python3
"""Supprime les traits blancs horizontaux dans les PNG (artefacts d'export, max 15 px)."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT = [
    ROOT / "docs" / "diagrammes-images",
    ROOT / "docs" / "memoire-screenshots",
]

MAX_GAP = 15
WHITE = 252  # pixels >= this on all channels count as white


def row_stats(px, w: int, y: int, step: int = 2) -> float:
    xs = range(0, w, step)
    white = sum(1 for x in xs if all(c >= WHITE for c in px[x, y][:3]))
    return white / len(list(xs))


def repair(path: Path) -> int:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    fixed = 0
    y = 1
    while y < h - 1:
        if row_stats(px, w, y) < 0.995:
            y += 1
            continue
        start = y
        while y < h - 1 and row_stats(px, w, y) >= 0.995:
            y += 1
        end = y
        gap = end - start
        if gap <= MAX_GAP and start > 0 and end < h:
            if row_stats(px, w, start - 1) < 0.995 and row_stats(px, w, end) < 0.995:
                for gy in range(start, end):
                    for x in range(w):
                        c1 = px[x, start - 1]
                        c2 = px[x, end]
                        px[x, gy] = tuple((a + b) // 2 for a, b in zip(c1, c2))
                fixed += gap
    if fixed:
        im.save(path, "PNG", optimize=True)
    return fixed


def main(argv: list[str]) -> int:
    targets: list[Path] = [Path(a) for a in argv] if argv else []
    if not targets:
        for d in DEFAULT:
            targets.extend(sorted(d.rglob("*.png")))

    total = touched = 0
    for path in targets:
        if not path.exists():
            continue
        n = repair(path)
        if n:
            touched += 1
            total += n
            print(f"  {path.relative_to(ROOT)} — {n} ligne(s)")
    print(f"OK — {touched} fichier(s), {total} ligne(s) corrigée(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
