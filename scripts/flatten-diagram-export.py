#!/usr/bin/env python3
"""Flatten Kroki Mermaid exports onto a white background (PNG + SVG)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

from PIL import Image


def flatten_png(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    background = Image.new("RGBA", image.size, (255, 255, 255, 255))
    flattened = Image.alpha_composite(background, image).convert("RGB")
    flattened.save(path, "PNG", optimize=True)


def flatten_svg(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if "diagram-bg-white" in text:
        return

    match = re.search(r'<svg[^>]*viewBox="([^"]+)"', text)
    if match:
        x, y, width, height = match.group(1).split()
        rect = (
            f'<rect class="diagram-bg-white" x="{x}" y="{y}" '
            f'width="{width}" height="{height}" fill="#ffffff"/>'
        )
    else:
        rect = '<rect class="diagram-bg-white" width="100%" height="100%" fill="#ffffff"/>'

    path.write_text(re.sub(r"(<svg[^>]*>)", r"\1" + rect, text, count=1), encoding="utf-8")


def main(argv: list[str]) -> int:
    for arg in argv:
        path = Path(arg)
        if path.suffix == ".png":
            flatten_png(path)
        elif path.suffix == ".svg":
            flatten_svg(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
