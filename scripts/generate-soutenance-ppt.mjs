#!/usr/bin/env node
/**
 * Génère un aperçu PowerPoint de soutenance DR-DOCSCOL.
 * Usage: node scripts/generate-soutenance-ppt.mjs
 */
import PptxGenJS from "pptxgenjs";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "docs", "demo");
const OUT_FILE = join(OUT_DIR, "DR-DOCSCOL_SOUTENANCE_APERCU.pptx");

const COLORS = {
  obc900: "0F172A",
  obc800: "1E293B",
  obc700: "334155",
  obc100: "F1F5F9",
  gold500: "F59E0B",
  gold400: "FBBF24",
  edu500: "3B82F6",
  white: "FFFFFF",
};

function addTitleSlide(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.obc900 };
  slide.addText("DR-DOCSCOL", {
    x: 0.6,
    y: 1.4,
    w: 8.8,
    h: 1.2,
    fontSize: 44,
    bold: true,
    color: COLORS.white,
    fontFace: "Calibri",
  });
  slide.addText(
    "Portail unifié OBC / DECC\nDemandes et retraits de documents scolaires",
    {
      x: 0.6,
      y: 2.7,
      w: 8.8,
      h: 1.4,
      fontSize: 22,
      color: COLORS.gold400,
      fontFace: "Calibri",
    },
  );
  slide.addText("Soutenance — Aperçu de présentation", {
    x: 0.6,
    y: 5.6,
    w: 8.8,
    h: 0.5,
    fontSize: 14,
    color: COLORS.obc100,
    fontFace: "Calibri",
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6,
    y: 4.9,
    w: 2.2,
    h: 0.08,
    fill: { color: COLORS.gold500 },
    line: { color: COLORS.gold500 },
  });
}

function addSectionSlide(pptx, title, subtitle) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.obc800 };
  slide.addText(title, {
    x: 0.6,
    y: 2.2,
    w: 8.8,
    h: 1.2,
    fontSize: 36,
    bold: true,
    color: COLORS.white,
    fontFace: "Calibri",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6,
      y: 3.5,
      w: 8.8,
      h: 0.8,
      fontSize: 18,
      color: COLORS.gold400,
      fontFace: "Calibri",
    });
  }
}

function addBulletSlide(pptx, title, bullets, opts = {}) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.12,
    fill: { color: COLORS.obc800 },
    line: { color: COLORS.obc800 },
  });
  slide.addText(title, {
    x: 0.5,
    y: 0.35,
    w: 9,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: COLORS.obc800,
    fontFace: "Calibri",
  });
  slide.addText(
    bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
    {
      x: 0.55,
      y: 1.2,
      w: 8.9,
      h: 4.8,
      fontSize: opts.fontSize ?? 18,
      color: COLORS.obc700,
      fontFace: "Calibri",
      paraSpaceAfter: 10,
    },
  );
}

function addTableSlide(pptx, title, headers, rows) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.12,
    fill: { color: COLORS.obc800 },
    line: { color: COLORS.obc800 },
  });
  slide.addText(title, {
    x: 0.5,
    y: 0.35,
    w: 9,
    h: 0.7,
    fontSize: 26,
    bold: true,
    color: COLORS.obc800,
    fontFace: "Calibri",
  });
  const tableRows = [
    headers.map((h) => ({
      text: h,
      options: {
        bold: true,
        color: COLORS.white,
        fill: { color: COLORS.obc800 },
        fontSize: 12,
      },
    })),
    ...rows.map((row) =>
      row.map((cell) => ({
        text: cell,
        options: { fontSize: 11, color: COLORS.obc700 },
      })),
    ),
  ];
  const colCount = headers.length;
  const colW =
    colCount === 3
      ? [3.8, 1.4, 4.0]
      : [2.2, 2.5, 2.5, 2];
  slide.addTable(tableRows, {
    x: 0.4,
    y: 1.15,
    w: 9.2,
    colW,
    border: { type: "solid", color: COLORS.obc100, pt: 1 },
    autoPage: false,
  });
}

function addFlowSlide(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.obc100 };
  slide.addText("Parcours complet de la démo", {
    x: 0.5,
    y: 0.35,
    w: 9,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: COLORS.obc800,
    fontFace: "Calibri",
  });
  const steps = [
    { n: "1", label: "Consultation\npublique", color: COLORS.edu500 },
    { n: "2", label: "Activation\n& demande", color: COLORS.obc700 },
    { n: "3", label: "Import A/B\nAdmin OBC", color: COLORS.gold500 },
    { n: "4", label: "Rendez-vous\nélève", color: COLORS.edu500 },
    { n: "5", label: "Retrait\nagent CE", color: COLORS.obc800 },
  ];
  const startX = 0.35;
  const boxW = 1.65;
  const gap = 0.2;
  steps.forEach((step, i) => {
    const x = startX + i * (boxW + gap);
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 1.5,
      w: boxW,
      h: 2.4,
      fill: { color: step.color },
      line: { color: step.color },
      rectRadius: 0.08,
    });
    slide.addText(step.n, {
      x,
      y: 1.65,
      w: boxW,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: COLORS.white,
      align: "center",
      fontFace: "Calibri",
    });
    slide.addText(step.label, {
      x,
      y: 2.3,
      w: boxW,
      h: 1.2,
      fontSize: 13,
      color: COLORS.white,
      align: "center",
      fontFace: "Calibri",
    });
    if (i < steps.length - 1) {
      slide.addText("→", {
        x: x + boxW + 0.02,
        y: 2.3,
        w: gap,
        h: 0.5,
        fontSize: 18,
        color: COLORS.obc700,
        align: "center",
      });
    }
  });
  slide.addText(
    "Matricule démo : DEMO2026002 (Faïssa NJIKAM) — Relevé Probatoire → retrait au centre d'examen",
    {
      x: 0.5,
      y: 4.5,
      w: 9,
      h: 0.8,
      fontSize: 14,
      italic: true,
      color: COLORS.obc700,
      fontFace: "Calibri",
    },
  );
}

function addClosingSlide(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.obc900 };
  slide.addText("Merci", {
    x: 0.6,
    y: 2.0,
    w: 8.8,
    h: 1,
    fontSize: 48,
    bold: true,
    color: COLORS.white,
    align: "center",
    fontFace: "Calibri",
  });
  slide.addText("Questions ?", {
    x: 0.6,
    y: 3.2,
    w: 8.8,
    h: 0.6,
    fontSize: 24,
    color: COLORS.gold400,
    align: "center",
    fontFace: "Calibri",
  });
  slide.addText(
    "application-demande-document-academ.vercel.app\nScénario vidéo : docs/demo/SCENARIO_VIDEO_SOUTENANCE.md",
    {
      x: 0.6,
      y: 4.8,
      w: 8.8,
      h: 0.9,
      fontSize: 12,
      color: COLORS.obc100,
      align: "center",
      fontFace: "Calibri",
    },
  );
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "DR-DOCSCOL";
  pptx.title = "DR-DOCSCOL — Soutenance (aperçu)";
  pptx.subject = "Démonstration portail documents scolaires OBC/DECC";

  addTitleSlide(pptx);

  addBulletSlide(pptx, "Contexte & problématique", [
    "Files d'attente et déplacements multiples pour les documents scolaires",
    "Organismes multiples : OBC (régional), DECC (diplômes), centres d'examen",
    "Manque de visibilité sur l'état des dossiers pour les élèves",
    "Besoin d'un portail unifié, traçable et accessible",
  ]);

  addBulletSlide(pptx, "Solution : DR-DOCSCOL", [
    "Consultation publique par matricule (sans compte)",
    "Espace élève : demandes, notifications, rendez-vous, paiements",
    "Administration OBC régionale : imports CSV, gestion des statuts",
    "Agent centre d'examen : confirmation des retraits physiques",
    "Stack : Next.js 15, Supabase Auth, Prisma / PostgreSQL",
  ]);

  addSectionSlide(
    pptx,
    "Démonstration",
    "Parcours élève → admin → rendez-vous → retrait",
  );

  addFlowSlide(pptx);

  addTableSlide(
    pptx,
    "Comptes de démonstration (région Centre)",
    ["Rôle", "Connexion", "Identifiant", "Mot de passe"],
    [
      ["Élève", "/auth/login", "faissayoppanjikam@gmail.com", "(activation)"],
      ["Admin OBC", "/auth/login/obc", "ADM-02-CENTRE", "AdminCentre2026!"],
      [
        "Agent CE",
        "/auth/login/centre-examen",
        "AGENT-CE-02-CENTRE",
        "AgentCentre2026!",
      ],
    ],
  );

  addBulletSlide(pptx, "1. Consultation publique (~3 min)", [
    "Landing page → /consultation",
    "Saisir le matricule DEMO2026002",
    "Affichage des examens (BEPC, Probatoire, Bac) et statuts",
    "Pas de compte requis — incite à l'activation pour demander",
  ]);

  addBulletSlide(pptx, "2. Espace élève (~4 min)", [
    "Activation /auth/register avec matricule + email",
    "Dashboard documents : Faire une demande (relevé Probatoire)",
    "Statut « Pas disponible » = demande enregistrée",
    "Notifications in-app pour les changements importants",
  ]);

  addBulletSlide(pptx, "3. Administration OBC (~5 min)", [
    "Import B : fiches documents initiales (Pas disponible)",
    "Import A : disponibilisation ciblée (relevé Probatoire 2021)",
    "Alternative : changement manuel de statut sur /admin/documents",
    "Périmètre régional : l'admin ne voit que sa région",
  ]);

  addBulletSlide(pptx, "4. Rendez-vous & retrait (~3 min)", [
    "Document Disponible → Prendre rendez-vous (centre d'examen)",
    "Créneaux selon quotas admin (/admin/rdv-disponibilites)",
    "Agent CE confirme le retrait → statut Retiré, RDV Honoré",
    "Consultation publique reflète le statut final",
  ]);

  addTableSlide(
    pptx,
    "Fichiers CSV de la démo",
    ["Fichier", "Import", "Usage"],
    [
      [
        "import-documents-eleves-demo-existants.csv",
        "Import B",
        "Documents DEMO2026001–005",
      ],
      [
        "import-disponibilisation-session-2024.csv",
        "Import A",
        "Disponibiliser relevé Probatoire DEMO2026002",
      ],
      [
        "import-nouveaux-eleves-demo-2025.csv",
        "Import B",
        "Nouveaux élèves ELEVE9001–9005 (optionnel)",
      ],
    ],
  );

  addBulletSlide(pptx, "Points techniques clés", [
    "25 pages, 39 route handlers, authentification multi-rôles",
    "Routing document : OBC vs DECC vs centre selon type",
    "RLS Supabase + contrôles applicatifs par région",
    "Emails optionnels (SMTP) ; notifications toujours en base",
  ], { fontSize: 16 });

  addClosingSlide(pptx);

  await pptx.writeFile({ fileName: OUT_FILE });
  console.log(`Présentation générée : ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
