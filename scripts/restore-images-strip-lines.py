#!/usr/bin/env python3
"""Restaure les images + supprime interligne Ch.2 sans toucher aux dimensions."""
from __future__ import annotations

import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "bout aligne.docx"
SOURCE = ROOT / "bout aligne.backup-fix-blancs.docx"
BACKUP = ROOT / "bout aligne.backup-restore-images.docx"


def strip_ch2_line_spacing(xml: str) -> str:
    start = xml.find("2.1 DÉMARCHE MÉTHODOLOGIQUE")
    end = xml.find("2.5 DÉVELOPPEMENT ET IMPLÉMENTATION")
    if start == -1 or end == -1 or end <= start:
        raise SystemExit("Limites Ch.2 introuvables.")

    before, mid, after = xml[:start], xml[start:end], xml[end:]
    mid = re.sub(r'\s*w:line="[^"]*"', "", mid)
    mid = re.sub(r'\s*w:lineRule="[^"]*"', "", mid)
    return before + mid + after


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Sauvegarde introuvable : {SOURCE}")

    shutil.copy2(DOCX, BACKUP)
    shutil.copy2(SOURCE, DOCX)

    with zipfile.ZipFile(DOCX) as z:
        files = {n: z.read(n) for n in z.namelist()}

    xml = files["word/document.xml"].decode("utf-8")
    files["word/document.xml"] = strip_ch2_line_spacing(xml).encode("utf-8")

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — images restaurées + interligne Ch.2 supprimé : {DOCX}")


if __name__ == "__main__":
    main()
