#!/usr/bin/env python3
"""Échange ch.4 (technique) et ch.5 (données/classes) — classes après les UC détaillés."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "docs" / "cahier_conception.md"

text = PATH.read_text(encoding="utf-8")

m4 = re.search(r"^## 4\. CONCEPTION TECHNIQUE\n", text, re.M)
m5 = re.search(r"^## 5\. CONCEPTION DU MODÈLE DE DONNÉES\n", text, re.M)
m6 = re.search(r"^## 6\. CONCEPTION DE L'INTERFACE UTILISATEUR\n", text, re.M)
if not (m4 and m5 and m6):
    raise SystemExit("Marqueurs de chapitres introuvables")

ch4 = text[m4.start() : m5.start()]
ch5 = text[m5.start() : m6.start()]

# Renommer ch5 (données) -> ch4
new_ch4 = ch5.replace("## 5. CONCEPTION DU MODÈLE DE DONNÉES", "## 4. CONCEPTION DU MODÈLE DE DONNÉES")
new_ch4 = re.sub(r"^### 5\.", "### 4.", new_ch4, flags=re.M)
new_ch4 = new_ch4.replace("**Figure 5.1 —", "**Figure 4.1 —")
new_ch4 = new_ch4.replace("![Figure 5.1 —", "![Figure 4.1 —")
new_ch4 = new_ch4.replace("**Tableau 5.1 —", "**Tableau 4.1 —")
new_ch4 = new_ch4.replace("Figure 5.1)", "Figure 4.1)")
new_ch4 = new_ch4.replace("au §5.1", "au §4.1")

# Renommer ch4 (technique) -> ch5
new_ch5 = ch4.replace("## 4. CONCEPTION TECHNIQUE", "## 5. CONCEPTION TECHNIQUE")
new_ch5 = re.sub(r"^### 4\.", "### 5.", new_ch5, flags=re.M)

head = text[: m4.start()]
tail = text[m6.start() :]

PATH.write_text(head + new_ch4 + new_ch5 + tail, encoding="utf-8")
print(f"OK — chapitres 4/5 échangés dans {PATH}")
