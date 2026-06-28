#!/usr/bin/env python3
"""Remplace les images align_image*.png du docx par les PNG sources réparés."""
from __future__ import annotations

import importlib.util
import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from memoire_tamela_blocks import (  # noqa: E402
    IMG,
    ELEVE_MODULES,
    ADMIN_MODULES,
    AGENT_MODULES,
)

DOCX = ROOT / "bout aligne.docx"
ARCH_PATH = ROOT / "docs" / "diagrammes-images" / "architecture-generale-solution.png"


def collect_image_paths() -> list[Path]:
    paths: list[Path] = [ARCH_PATH]
    # Même ordre que build_ch2_prose + build_uml_blocks
    paths.append(IMG / "cas-utilisation-general.png")
    paths.append(IMG / "cas-utilisation-eleve.drawio.png")
    for mod in ELEVE_MODULES:
        paths.append(mod["activity_img"])
        paths.append(mod["sequence_img"])
        extra = mod.get("extra_sequence_img")
        if extra is not None:
            paths.append(extra)
    paths.append(IMG / "cas-utilisation-admin-obc-decc.drawio.png")
    for mod in ADMIN_MODULES:
        paths.append(mod["activity_img"])
        paths.append(mod["sequence_img"])
        extra = mod.get("extra_sequence_img")
        if extra is not None:
            paths.append(extra)
    paths.append(IMG / "cas-utilisation-agent-centre.drawio.png")
    for mod in AGENT_MODULES:
        paths.append(mod["activity_img"])
        paths.append(mod["sequence_img"])
    paths.append(IMG / "diagramme-classes-simplifie.png")
    return paths


def main() -> None:
    paths = collect_image_paths()
    backup = DOCX.with_suffix(".backup-images.docx")
    shutil.copy2(DOCX, backup)

    with zipfile.ZipFile(DOCX, "r") as zin:
        files = {name: zin.read(name) for name in zin.namelist()}

    updated = 0
    for i, src in enumerate(paths, start=1):
        if not src.exists():
            print(f"  manquant : {src}")
            continue
        ext = src.suffix.lower().lstrip(".")
        media_ext = "jpeg" if ext in ("jpg", "jpeg") else ext
        key = f"word/media/align_image{i}.{media_ext}"
        if key in files:
            files[key] = src.read_bytes()
            updated += 1
        else:
            print(f"  absent du docx : {key}")

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, data in files.items():
            zout.writestr(name, data)

    print(f"OK — {updated}/{len(paths)} images mises à jour dans {DOCX}")
    print(f"Sauvegarde : {backup}")


if __name__ == "__main__":
    main()
