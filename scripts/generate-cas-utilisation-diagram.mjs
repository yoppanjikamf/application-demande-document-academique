/**
 * Fidèle au croquis WhatsApp (admin OBC/DECC) — même éléments, même disposition.
 * Source : WhatsApp Image 2026-06-20 at 3.30.53 PM.jpeg
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const OUT_DIR = "docs/diagrammes-images";
const BASE = `${OUT_DIR}/cas utilisation`;

const W = 980;
const H = 660;
const BOX = { x: 44, y: 72, w: 892, h: 548 };
const STROKE = "#111827";
const LINE = "#374151";
const BOUNDARY = "#059669";
const FILL = "#FFFFFF";
const UC_FILL = "#F8FAFC";

function escape(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function uc(cx, cy, label) {
  const rx = Math.max(56, Math.min(128, Math.round(label.length * 4.7 + 20)));
  const ry = 21;
  return { cx, cy, rx, ry, label, left: cx - rx, right: cx + rx, top: cy - ry, bottom: cy + ry };
}

function ellipse(n) {
  return `<ellipse cx="${n.cx}" cy="${n.cy}" rx="${n.rx}" ry="${n.ry}" fill="${UC_FILL}" stroke="${STROKE}" stroke-width="1.6"/>`;
}

function ucText(n) {
  return `<text x="${n.cx}" y="${n.cy + 5}" text-anchor="middle" class="uc">${escape(n.label)}</text>`;
}

function solidLine(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${LINE}" stroke-width="1.35" stroke-linecap="round"/>`;
}

function dashedArrow(x1, y1, x2, y2, label, labelX, labelY) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ax = x2 - ux * 10;
  const ay = y2 - uy * 10;
  const px = -uy;
  const py = ux;
  return `<g>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${LINE}" stroke-width="1.2" stroke-dasharray="6 4"/>
    <polygon points="${x2},${y2} ${ax + px * 4},${ay + py * 4} ${ax - px * 4},${ay - py * 4}" fill="${LINE}"/>
    <text x="${labelX}" y="${labelY}" class="stereo">${escape(label)}</text>
  </g>`;
}

/** Fourche verticale : parent -> barre horizontale -> enfants */
function branchDown(parent, children, gap = 16) {
  const midY = parent.bottom + gap;
  const xs = children.map((c) => c.cx);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const lines = [
    solidLine(parent.cx, parent.bottom, parent.cx, midY),
    solidLine(minX, midY, maxX, midY),
  ];
  children.forEach((child) => lines.push(solidLine(child.cx, midY, child.cx, child.top)));
  return lines.join("\n");
}

/** Fourche vers la gauche : parent -> barre verticale -> enfants empilés */
function branchLeft(parent, children, gap = 18) {
  const midX = parent.left - gap;
  const ys = children.map((c) => c.cy);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const lines = [
    solidLine(parent.left, parent.cy, midX, parent.cy),
    solidLine(midX, minY, midX, maxY),
  ];
  children.forEach((child) => lines.push(solidLine(midX, child.cy, child.right, child.cy)));
  return lines.join("\n");
}

function buildDiagram() {
  const actor = { x: 490, y: 38, label: "Administrateur (OBC/DECC)" };

  // Rangée principale (gauche -> droite, comme le croquis)
  const quota = uc(108, 148, "définir le quota journalier");
  const paiement = uc(278, 148, "consulter paiement");
  const imports = uc(448, 148, "effectuer les import");
  const auth = uc(618, 148, "Authentifier");
  const audit = uc(788, 148, "consulter le journal audit");

  // Gauche : extensions du quota
  const joursFeries = uc(72, 248, "définir les jours feriés");
  const nbRdv = uc(72, 328, "consulter le nombre de rendez vous");

  // Centre : spécialisations import
  const importDispo = uc(398, 252, "import disponibilité");
  const importEleve = uc(558, 252, "import ajout élève");

  // Droite : Ajout élève + chaîne mise à jour
  const ajoutEleve = uc(792, 248, "Ajout élève");
  const maj = uc(618, 332, "mettre à jour");

  // Sous mettre à jour : duplicata (gauche), diplôme (centre), relevé (droite)
  const duplicata = uc(498, 438, "duplicata");
  const diplome = uc(618, 438, "diplôme");
  const releve = uc(738, 438, "relevé");

  const traiter = uc(498, 528, "traiter la demande");

  // Issue à gauche, empilées (valide haut, rejeton bas)
  const valide = uc(288, 498, "valide");
  const rejeton = uc(288, 568, "rejeton");

  const nodes = [
    quota,
    paiement,
    imports,
    auth,
    audit,
    joursFeries,
    nbRdv,
    importDispo,
    importEleve,
    ajoutEleve,
    maj,
    duplicata,
    diplome,
    releve,
    traiter,
    valide,
    rejeton,
  ];

  const actorLinks = [quota, paiement, imports, auth, audit].map((node) =>
    solidLine(actor.x, actor.y + 26, node.cx, node.top),
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <style>
        .boundaryLabel { fill: ${BOUNDARY}; font: 700 14px Arial, Helvetica, sans-serif; }
        .uc { fill: ${STROKE}; font: 12px Arial, Helvetica, sans-serif; }
        .actor { fill: ${STROKE}; font: 600 12px Arial, Helvetica, sans-serif; text-anchor: middle; }
        .stereo { fill: ${LINE}; font: 10px Arial, Helvetica, sans-serif; font-style: italic; }
      </style>
    </defs>

    <rect width="${W}" height="${H}" fill="${FILL}"/>

    <g transform="translate(${actor.x} ${actor.y})">
      <circle cx="0" cy="-16" r="9" fill="${FILL}" stroke="${STROKE}" stroke-width="1.6"/>
      <line x1="0" y1="-7" x2="0" y2="8" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="-14" y1="0" x2="14" y2="0" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="0" y1="8" x2="-11" y2="24" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="0" y1="8" x2="11" y2="24" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round"/>
      <text x="0" y="42" class="actor">${escape(actor.label)}</text>
    </g>

    <rect x="${BOX.x}" y="${BOX.y}" width="${BOX.w}" height="${BOX.h}" rx="2" fill="none" stroke="${BOUNDARY}" stroke-width="2"/>
    <text class="boundaryLabel" transform="translate(${BOX.x + BOX.w - 8} ${BOX.y + BOX.h / 2}) rotate(-90)" text-anchor="middle">Système DR-DOCSCOL</text>

    ${actorLinks.join("\n")}

    ${dashedArrow(joursFeries.right, joursFeries.cy, quota.left, quota.cy - 4, "<<extend>>", 92, 228)}
    ${dashedArrow(nbRdv.right, nbRdv.cy - 2, quota.left, quota.cy + 6, "<<extend>>", 88, 308)}
    ${dashedArrow(ajoutEleve.left, ajoutEleve.cy, auth.right, auth.cy, "<<extend>>", 748, 228)}
    ${dashedArrow(auth.cx, auth.bottom, maj.cx, maj.top, "<<include>>", 632, 278)}
    ${dashedArrow(duplicata.cx, duplicata.bottom, traiter.cx, traiter.top, "<<include>>", 518, 492)}

    ${branchDown(imports, [importDispo, importEleve])}
    ${branchDown(maj, [duplicata, diplome, releve])}
    ${branchLeft(traiter, [valide, rejeton])}

    ${nodes.map((n) => ellipse(n)).join("\n")}
    ${nodes.map((n) => ucText(n)).join("\n")}
  </svg>`;
}

async function writeOutputs() {
  const svg = buildDiagram();
  writeFileSync(`${BASE}.svg`, svg);

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(`${BASE}.png`, pngBuffer);

  const jpegBuffer = await sharp(pngBuffer).jpeg({ quality: 96, mozjpeg: true }).toBuffer();
  writeFileSync(`${BASE}.jpeg`, jpegBuffer);

  console.log(`Generated (v2 fidèle WhatsApp):\n  ${BASE}.svg\n  ${BASE}.png\n  ${BASE}.jpeg`);
}

await writeOutputs();
