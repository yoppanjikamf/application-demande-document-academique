#!/usr/bin/env python3
"""Supprime les traits blancs horizontaux (artefacts d'export) dans les PNG de diagrammes."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DIRS = [
    ROOT / "docs" / "diagrammes-images" / "activites",
    ROOT / "docs" / "diagrammes-images" / "sequences" / "eleve",
    ROOT / "docs" / "diagrammes-images" / "sequences" / "admin",
    ROOT / "docs" / "diagrammes-images" / "sequences" / "agent",
]


def row_mostly_white(px, w: int, y: int, step: int = 4) -> bool:
    white = sum(1 for x in range(0, w, step) if px[x, y] == (255, 255, 255))
    samples = len(range(0, w, step))
    return white / samples > 0.995


def repair_gaps(path: Path, max_gap: int = 4) -> int:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    fixed = 0
    y = 1
    while y < h - 1:
        if not row_mostly_white(px, w, y):
            y += 1
            continue
        gap_start = y
        while y < h - 1 and row_mostly_white(px, w, y):
            y += 1
        gap_end = y
        gap_h = gap_end - gap_start
        if gap_h <= max_gap and gap_start > 0 and gap_end < h:
            if not row_mostly_white(px, w, gap_start - 1) and not row_mostly_white(px, w, gap_end):
                for gy in range(gap_start, gap_end):
                    for x in range(w):
                        c1 = px[x, gap_start - 1]
                        c2 = px[x, gap_end]
                        px[x, gy] = tuple((a + b) // 2 for a, b in zip(c1, c2))
                fixed += gap_h
    if fixed:
        im.save(path, "PNG", optimize=True)
    return fixed


def main(argv: list[str]) -> int:
    targets: list[Path] = []
    if argv:
        targets = [Path(a) for a in argv]
    else:
        for d in DEFAULT_DIRS:
            targets.extend(sorted(d.glob("*.png")))

    total_rows = 0
    touched = 0
    for path in targets:
        if not path.exists():
            continue
        n = repair_gaps(path)
        if n:
            touched += 1
            total_rows += n
            print(f"  {path} — {n} ligne(s) corrigée(s)")
    print(f"OK — {touched} fichier(s), {total_rows} ligne(s) au total")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
