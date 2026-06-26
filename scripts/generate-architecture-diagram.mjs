/**
 * Architecture générale DR-DOCSCOL — schéma logique sans technologies.
 * Rendu vectoriel soigné (SVG + PNG), style aligné sur les diagrammes d'activité.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = "docs/diagrammes-images";
mkdirSync(OUT, { recursive: true });

const STROKE = "#111827";
const LINE = "#374151";
const FILL = "#FFFFFF";
const BOX = "#F8FAFC";
const ACCENT = "#059669";
const MVC = ["#EEF2FF", "#FDF2F8", "#FFFBEB", "#F0FDF4"];

function esc(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function box(x, y, w, h, label, fill = BOX, rx = 12) {
  const lines = label.split("\n");
  const lh = 15;
  const ty = y + h / 2 - ((lines.length - 1) * lh) / 2 + 5;
  const texts = lines
    .map((l, i) => `<text x="${x + w / 2}" y="${ty + i * lh}" text-anchor="middle" class="lbl">${esc(l)}</text>`)
    .join("");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${STROKE}" stroke-width="1.6"/>${texts}`;
}

function actor(x, y, label) {
  return `<g transform="translate(${x},${y})">
    <circle cx="0" cy="-14" r="9" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>
    <line x1="0" y1="-5" x2="0" y2="8" stroke="${STROKE}" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="-12" y1="0" x2="12" y2="0" stroke="${STROKE}" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="0" y1="8" x2="-10" y2="22" stroke="${STROKE}" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="0" y1="8" x2="10" y2="22" stroke="${STROKE}" stroke-width="1.5" stroke-linecap="round"/>
    <text x="0" y="38" text-anchor="middle" class="actor">${esc(label)}</text>
  </g>`;
}

function arrow(x1, y1, x2, y2, label = "") {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const lbl = label
    ? `<text x="${midX + 6}" y="${midY - 4}" class="guard">${esc(label)}</text>`
    : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${LINE}" stroke-width="1.4" marker-end="url(#arr)"/>${lbl}`;
}

function buildSvg() {
  const W = 820;
  const H = 720;
  const cx = W / 2;

  const actors = [
    actor(120, 58, "Élève"),
    actor(280, 58, "Admin\nOBC / DECC"),
    actor(540, 58, "Agent\ncentre"),
    actor(700, 58, "Visiteur"),
  ];

  const ui = box(cx - 160, 118, 320, 44, "Interface web\n(navigateur)", "#ECFDF5");

  const sysX = 80;
  const sysY = 200;
  const sysW = 660;
  const sysH = 280;
  const sysBorder = `<rect x="${sysX}" y="${sysY}" width="${sysW}" height="${sysH}" rx="6" fill="none" stroke="${ACCENT}" stroke-width="2"/>
    <text x="${sysX + sysW - 12}" y="${sysY + sysH / 2}" transform="rotate(-90 ${sysX + sysW - 12} ${sysY + sysH / 2})" text-anchor="middle" class="sys">${esc("Système DR-DOCSCOL")}</text>`;

  const layerW = 600;
  const layerX = cx - layerW / 2;
  const layers = [
    { y: 220, h: 48, t: "Couche présentation (Vue)", c: MVC[0] },
    { y: 278, h: 48, t: "Couche contrôle (Contrôleur)", c: MVC[1] },
    { y: 336, h: 48, t: "Couche métier (Services)", c: MVC[2] },
    { y: 394, h: 48, t: "Couche accès aux données (Modèle)", c: MVC[3] },
  ].map((l) => box(layerX, l.y, layerW, l.h, l.t, l.c, 10));

  const extY = 520;
  const ext = [
    box(60, extY, 150, 52, "Service\nd'authentification", "#FEF3C7"),
    box(240, extY, 150, 52, "Base de\ndonnées", "#FEF3C7"),
    box(420, extY, 150, 52, "Service de\ncourriel", "#FEF3C7"),
    box(600, extY, 150, 52, "Stockage\npièces jointes", "#FEF3C7"),
  ];

  const arrows = [
    arrow(120, 96, cx - 80, 118),
    arrow(280, 96, cx - 40, 118),
    arrow(540, 96, cx + 40, 118),
    arrow(700, 96, cx + 80, 118),
    arrow(cx, 162, cx, 200, "requêtes / réponses"),
    arrow(cx, 480, cx, 518, "persistance"),
    arrow(layerX + 80, 442, 135, extY),
    arrow(layerX + 240, 442, 315, extY),
    arrow(layerX + 400, 442, 495, extY),
    arrow(layerX + 520, 442, 675, extY),
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <style>
        .title { fill: #1F2937; font: 700 17px Arial, Helvetica, sans-serif; }
        .note { fill: #64748B; font: 11px Arial, Helvetica, sans-serif; }
        .lbl { fill: ${STROKE}; font: 12px Arial, Helvetica, sans-serif; }
        .actor { fill: ${STROKE}; font: 11px Arial, Helvetica, sans-serif; }
        .sys { fill: ${ACCENT}; font: 700 13px Arial, Helvetica, sans-serif; }
        .guard { fill: ${LINE}; font: 10px Arial, Helvetica, sans-serif; font-style: italic; }
      </style>
      <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <polygon points="0,0 8,4 0,8" fill="${LINE}"/>
      </marker>
    </defs>
    <rect width="${W}" height="${H}" fill="${FILL}"/>
    <text x="${cx}" y="28" text-anchor="middle" class="title">${esc("Architecture générale de la solution — vue logique")}</text>
    <text x="${cx}" y="46" text-anchor="middle" class="note">${esc("Sans spécification de technologies — pattern MVC et architecture en couches")}</text>
    ${actors.join("\n")}
    ${ui}
    ${sysBorder}
    ${layers.join("\n")}
    ${ext.join("\n")}
    ${arrows.join("\n")}
  </svg>`;
}

const svg = buildSvg();
const base = join(OUT, "architecture-generale-solution");
writeFileSync(`${base}.svg`, svg);
const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(`${base}.png`, png);
console.log(`Generated:\n  ${base}.svg\n  ${base}.png`);
