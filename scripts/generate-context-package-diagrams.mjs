/**
 * Diagramme de contexte + diagramme de packages — DR-DOCSCOL
 * Vue logique sans technologies (alignée cahier de conception §2.1 et §2.4).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = "docs/diagrammes-images";
mkdirSync(OUT, { recursive: true });

const STROKE = "#111827";
const LINE = "#374151";
const FILL = "#FFFFFF";
const SYS = "#059669";
const PKG = "#F8FAFC";
const EXT = "#FEF3C7";

function esc(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function actor(x, y, label) {
  const lines = label.split("\n");
  const ty = 38 + (lines.length > 1 ? 6 : 0);
  const texts = lines
    .map((l, i) => `<text x="0" y="${ty + i * 12}" text-anchor="middle" class="actor">${esc(l)}</text>`)
    .join("");
  return `<g transform="translate(${x},${y})">
    <circle cx="0" cy="-14" r="9" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>
    <line x1="0" y1="-5" x2="0" y2="8" stroke="${STROKE}" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="-12" y1="0" x2="12" y2="0" stroke="${STROKE}" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="0" y1="8" x2="-10" y="22" stroke="${STROKE}" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="0" y1="8" x2="10" y2="22" stroke="${STROKE}" stroke-width="1.5" stroke-linecap="round"/>
    ${texts}
  </g>`;
}

function box(x, y, w, h, label, fill = PKG, stroke = STROKE) {
  const lines = label.split("\n");
  const lh = 14;
  const ty = y + h / 2 - ((lines.length - 1) * lh) / 2 + 5;
  const texts = lines
    .map((l, i) => `<text x="${x + w / 2}" y="${ty + i * lh}" text-anchor="middle" class="lbl">${esc(l)}</text>`)
    .join("");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ry="10" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>${texts}`;
}

function arrow(x1, y1, x2, y2, label = "", dashed = false) {
  const dash = dashed ? ' stroke-dasharray="6 4"' : "";
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const lbl = label
    ? `<text x="${midX + 4}" y="${midY - 6}" class="guard">${esc(label)}</text>`
    : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${LINE}" stroke-width="1.4" marker-end="url(#arr)"${dash}/>${lbl}`;
}

function wrapSvg(W, H, title, subtitle, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <style>
        .title { fill: #1F2937; font: 700 17px Arial, Helvetica, sans-serif; }
        .note { fill: #64748B; font: 11px Arial, Helvetica, sans-serif; }
        .lbl { fill: ${STROKE}; font: 12px Arial, Helvetica, sans-serif; }
        .actor { fill: ${STROKE}; font: 11px Arial, Helvetica, sans-serif; }
        .sys { fill: ${SYS}; font: 700 14px Arial, Helvetica, sans-serif; }
        .pkg { fill: ${SYS}; font: 700 12px Arial, Helvetica, sans-serif; }
        .guard { fill: ${LINE}; font: 10px Arial, Helvetica, sans-serif; font-style: italic; }
      </style>
      <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <polygon points="0,0 8,4 0,8" fill="${LINE}"/>
      </marker>
    </defs>
    <rect width="${W}" height="${H}" fill="${FILL}"/>
    <text x="${W / 2}" y="28" text-anchor="middle" class="title">${esc(title)}</text>
    <text x="${W / 2}" y="46" text-anchor="middle" class="note">${esc(subtitle)}</text>
    ${body}
  </svg>`;
}

function buildContext() {
  const W = 780;
  const H = 620;
  const cx = W / 2;
  const cy = 300;

  const sys = box(cx - 130, cy - 55, 260, 110, "DR-DOCSCOL\n(portail web de gestion\ndes retraits scolaires)", "#ECFDF5", SYS);

  const actors = [
    { x: 100, y: 100, l: "Élève" },
    { x: 280, y: 80, l: "Administrateur\nOBC / DECC" },
    { x: 500, y: 80, l: "Agent\ncentre d'examen" },
    { x: 680, y: 100, l: "Visiteur" },
  ];

  const ext = [
    box(40, 480, 140, 50, "Service\nd'authentification", EXT),
    box(210, 480, 140, 50, "Base de\ndonnées", EXT),
    box(430, 480, 140, 50, "Service de\ncourriel", EXT),
    box(600, 480, 140, 50, "Stockage\njustificatifs", EXT),
  ];

  const arr = [
    arrow(100, 122, cx - 90, cy - 20, "consulter, demander,\nRDV, paiement"),
    arrow(280, 108, cx - 40, cy - 40, "imports, statuts,\nduplicatas"),
    arrow(500, 108, cx + 40, cy - 40, "RDV, confirmation\nretrait"),
    arrow(680, 122, cx + 90, cy - 20, "consultation\nmatricule"),
    arrow(cx - 60, cy + 55, 110, 480, "", true),
    arrow(cx, cy + 55, 280, 480, "", true),
    arrow(cx + 40, cy + 55, 500, 480, "", true),
    arrow(cx + 80, cy + 55, 670, 480, "", true),
  ];

  return wrapSvg(
    W,
    H,
    "Diagramme de contexte — DR-DOCSCOL",
    "Frontière du système et interactions avec acteurs et services externes",
    [...actors.map((a) => actor(a.x, a.y, a.l)), sys, ...ext, ...arr].join("\n"),
  );
}

function buildPackages() {
  const W = 820;
  const H = 640;
  const cx = W / 2;

  const core = box(cx - 95, 420, 190, 64, "<<PKG-CORE>>\nServices métier transverses", "#FFFBEB", SYS);
  const auth = box(cx - 95, 300, 190, 52, "<<PKG-AUTH>>\nAuthentification & comptes");

  const pub = box(60, 140, 175, 52, "<<PKG-PUBLIC>>\nConsultation publique");
  const eleve = box(260, 120, 175, 64, "<<PKG-ELEVE>>\nEspace élève\n(dashboard)");
  const admin = box(480, 120, 175, 64, "<<PKG-ADMIN>>\nAdministration\nOBC / DECC");
  const agent = box(620, 160, 175, 52, "<<PKG-AGENT>>\nAgent centre");

  const deps = [
    arrow(147, 192, 147, 300, "«use»", true),
    arrow(347, 184, 347, 300, "«use»", true),
    arrow(567, 184, 567, 300, "«use»", true),
    arrow(707, 212, 707, 300, "«use»", true),
    arrow(147, 192, 347, 300, "", true),
    arrow(347, 184, cx - 95, 326, "", true),
    arrow(567, 184, cx + 95, 326, "", true),
    arrow(707, 212, cx + 95, 326, "", true),
    arrow(cx, 352, cx, 420, "«use»", true),
    arrow(147, 192, cx, 420, "", true),
    arrow(567, 184, cx, 420, "", true),
  ];

  const legend = `<text x="40" y="560" class="note">${esc("PKG-CORE : routage, statuts, RDV, duplicatas, imports, notifications (lib/*)")}</text>
    <text x="40" y="578" class="note">${esc("Chaque package métier s'appuie sur PKG-AUTH et PKG-CORE")}</text>`;

  return wrapSvg(
    W,
    H,
    "Diagramme de packages — DR-DOCSCOL",
    "Découpage fonctionnel aligné sur app/auth, app/dashboard, app/admin, app/centre-examen, app/consultation",
    [pub, eleve, admin, agent, auth, core, ...deps, legend].join("\n"),
  );
}

async function exportOne(name, svg) {
  const base = join(OUT, name);
  writeFileSync(`${base}.svg`, svg);
  writeFileSync(`${base}.png`, await sharp(Buffer.from(svg)).png().toBuffer());
  console.log(`  ${base}.png`);
}

console.log("Génération diagrammes contexte & packages…");
await exportOne("diagramme-contexte-dr-docscol", buildContext());
await exportOne("diagramme-packages-dr-docscol", buildPackages());
console.log("Terminé.");
