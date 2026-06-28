#!/usr/bin/env python3
"""Met à jour les bytes des ch2_figure_*.png depuis docs/diagrammes-images."""
from __future__ import annotations

import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from memoire_tamela_blocks import ELEVE_MODULES, ADMIN_MODULES, AGENT_MODULES, IMG  # noqa: E402

DOCX = ROOT / "bout aligne.docx"
IMG_ROOT = ROOT / "docs" / "diagrammes-images"


def collect_paths() -> list[Path]:
    paths = [
        IMG_ROOT / "architecture-generale-solution.png",
        IMG / "cas-utilisation-general.png",
        IMG / "cas-utilisation-eleve.drawio.png",
    ]
    for mod in ELEVE_MODULES:
        paths += [mod["activity_img"], mod["sequence_img"]]
        if mod.get("extra_sequence_img"):
            paths.append(mod["extra_sequence_img"])
    paths.append(IMG / "cas-utilisation-admin-obc-decc.drawio.png")
    for mod in ADMIN_MODULES:
        paths += [mod["activity_img"], mod["sequence_img"]]
        if mod.get("extra_sequence_img"):
            paths.append(mod["extra_sequence_img"])
    paths.append(IMG / "cas-utilisation-agent-centre.drawio.png")
    for mod in AGENT_MODULES:
        paths += [mod["activity_img"], mod["sequence_img"]]
    paths.append(IMG / "diagramme-classes-simplifie.png")
    return paths


def main() -> None:
    paths = collect_paths()
    with zipfile.ZipFile(DOCX) as z:
        files = {n: z.read(n) for n in z.namelist()}

    n = 0
    for i, src in enumerate(paths, start=1):
        key = f"word/media/ch2_figure_{i}.png"
        if key in files and src.exists():
            files[key] = src.read_bytes()
            n += 1

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)
    print(f"OK — {n} fichiers ch2_figure mis à jour")


if __name__ == "__main__":
    main()
