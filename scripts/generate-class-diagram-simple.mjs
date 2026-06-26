/**
 * Diagramme de classes UML simplifié — DR-DOCSCOL
 * Couloir dédié entre colonne transactions (gauche) et Élève.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = "docs/diagrammes-images";
mkdirSync(OUT, { recursive: true });

const STROKE = "#111827";
const LINE = "#374151";
const ASSOC = "#1D4ED8";
const FILL = "#FFFFFF";
const ABSTRACT = "#EEF2FF";
const DOC = "#FFFBEB";
const TRANS = "#F0FDF4";

function esc(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function classBox(x, y, w, { name, attrs = [], methods = [], abstract = false, fill = FILL }) {
  const nameH = 28;
  const attrLines = attrs.length ? attrs : [" "];
  const methLines = methods.length ? methods : [];
  const attrH = Math.max(36, attrLines.length * 14 + 12);
  const methH = methLines.length ? methLines.length * 14 + 12 : 0;
  const h = nameH + attrH + methH;
  const bg = abstract ? ABSTRACT : fill;

  const nameStyle = abstract ? ' font-style="italic"' : "";
  const texts = [
    `<text x="${x + w / 2}" y="${y + 19}" text-anchor="middle" class="cls-name"${nameStyle}>${esc(name)}</text>`,
    `<line x1="${x}" y1="${y + nameH}" x2="${x + w}" y2="${y + nameH}" stroke="${STROKE}" stroke-width="1"/>`,
  ];

  attrLines.forEach((a, i) => {
    texts.push(`<text x="${x + 10}" y="${y + nameH + 16 + i * 14}" class="attr">${esc(a)}</text>`);
  });

  if (methLines.length) {
    const my = y + nameH + attrH;
    texts.push(`<line x1="${x}" y1="${my}" x2="${x + w}" y2="${my}" stroke="${STROKE}" stroke-width="1"/>`);
    methLines.forEach((m, i) => {
      texts.push(`<text x="${x + 10}" y="${my + 16 + i * 14}" class="meth">${esc(m)}</text>`);
    });
  }

  return {
    x, y, w, h,
    cx: x + w / 2, cy: y + h / 2,
    top: y, bottom: y + h, left: x, right: x + w,
    svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}" stroke="${STROKE}" stroke-width="1.6"/>${texts.join("")}`,
  };
}

function inheritTree(parent, children, gap = 36) {
  const barY = parent.bottom + gap;
  const minX = Math.min(...children.map((c) => c.cx));
  const maxX = Math.max(...children.map((c) => c.cx));
  const triY = barY - 14;

  const parts = [
    `<line x1="${parent.cx}" y1="${parent.bottom}" x2="${parent.cx}" y2="${barY}" stroke="${STROKE}" stroke-width="1.5"/>`,
    `<line x1="${minX}" y1="${barY}" x2="${maxX}" y2="${barY}" stroke="${STROKE}" stroke-width="1.5"/>`,
    `<polygon points="${parent.cx},${triY + 14} ${parent.cx - 11},${triY} ${parent.cx + 11},${triY}" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>`,
  ];
  for (const child of children) {
    parts.push(`<line x1="${child.cx}" y1="${barY}" x2="${child.cx}" y2="${child.top}" stroke="${STROKE}" stroke-width="1.5"/>`);
  }
  return parts.join("\n");
}

function cardinalityLabel(x, y, text, anchor = "middle", large = false) {
  const cls = large ? "card-lg" : "card";
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${esc(text)}</text>`;
}

function linkDot(x, y, color = ASSOC) {
  return `<circle cx="${x}" cy="${y}" r="3.5" fill="${color}" stroke="${FILL}" stroke-width="1.2"/>`;
}

function line(x1, y1, x2, y2, { color = LINE, width = 1.4 } = {}) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
}

function labelTag(x, y, text, anchor = "middle") {
  const len = text.length * 5.8 + 12;
  const ax = anchor === "middle" ? x - len / 2 : anchor === "end" ? x - len : x;
  return [
    `<rect x="${ax}" y="${y - 13}" width="${len}" height="16" rx="3" fill="${FILL}" stroke="#E5E7EB" stroke-width="1"/>`,
    `<text x="${x}" y="${y}" text-anchor="${anchor}" class="label">${esc(text)}</text>`,
  ].join("");
}

/** Descend sous l'acteur puis rejoint le bord supérieur de la cible (connexion visible). */
function assocToTop(from, to, label, opts = {}) {
  const {
    cardFrom = "",
    cardTo = "",
    labelPos = 0.5,
    labelOffset = { x: 0, y: -10 },
    cardToOffsetX = 16,
  } = opts;
  const yEnd = to.top;
  const xFrom = from.cx;
  const xTo = to.cx;

  const parts = [line(xFrom, from.bottom, xFrom, yEnd)];
  if (Math.abs(xFrom - xTo) > 2) {
    parts.push(line(xFrom, yEnd, xTo, yEnd));
  }
  parts.push(
    linkDot(xFrom, yEnd, LINE),
    linkDot(xTo, yEnd, LINE),
    cardFrom ? cardinalityLabel(xFrom - 16, from.bottom + 16, cardFrom, "end") : "",
    cardTo ? cardinalityLabel(xTo + cardToOffsetX, yEnd - 6, cardTo, "start") : "",
  );

  const lx = xFrom + (xTo - xFrom) * labelPos + labelOffset.x;
  const ly = yEnd + labelOffset.y;
  parts.push(labelTag(lx, ly, label));

  return parts.join("\n");
}

/** Bus vertical dans le couloir colonne ↔ Élève — cardinalités aux deux extrémités. */
function eleveLeftColumnLinks(eleve, items, { busX = 278 } = {}) {
  const minY = Math.min(...items.map((i) => i.box.cy));
  const maxY = Math.max(...items.map((i) => i.box.cy));
  const trunkDropY = eleve.bottom + 18;

  const parts = [
    line(eleve.cx, eleve.bottom, eleve.cx, trunkDropY, { color: ASSOC, width: 2.2 }),
    line(eleve.cx, trunkDropY, busX, trunkDropY, { color: ASSOC, width: 2.2 }),
    line(busX, trunkDropY, busX, maxY + 14, { color: ASSOC, width: 2.2 }),
    line(busX, minY - 14, busX, trunkDropY, { color: ASSOC, width: 2.2 }),
    linkDot(eleve.cx, eleve.bottom, ASSOC),
    linkDot(busX, trunkDropY, ASSOC),
  ];

  for (const { box, label, cardFrom = "0..*", cardTo = "1" } of items) {
    const ty = box.cy;
    parts.push(
      line(busX, ty, box.right, ty, { color: ASSOC, width: 2.2 }),
      linkDot(box.right, ty, ASSOC),
      linkDot(busX, ty, ASSOC),
      cardinalityLabel(busX - 14, ty + 4, cardFrom, "end", true),
      cardinalityLabel(box.right + 14, ty + 4, cardTo, "start", true),
      labelTag((busX + box.right) / 2, ty - 12, label),
    );
  }
  return parts.join("\n");
}

function assocToSide(from, to, label, { cardFrom = "", cardTo = "", routeY }) {
  const y = routeY;
  return [
    line(from.cx, from.bottom, from.cx, y),
    line(from.cx, y, to.left, y),
    line(to.left, y, to.left, to.top),
    linkDot(to.left, to.top, LINE),
    linkDot(from.cx, y, LINE),
    cardFrom ? cardinalityLabel(from.cx + 14, y - 8, cardFrom, "start") : "",
    cardTo ? cardinalityLabel(to.left - 14, to.top - 6, cardTo, "end") : "",
    labelTag((from.cx + to.left) / 2, y - 10, label),
  ].join("\n");
}

function buildSvg() {
  const W = 1320;
  const H = 920;
  const cw = 172;

  const utilisateur = classBox(520, 48, cw, {
    name: "Utilisateur",
    abstract: true,
    attrs: ["-matricule: String", "-email: String", "-nom: String", "-prenom: String"],
    fill: ABSTRACT,
  });

  // Élève décalé à droite pour laisser un couloir d'associations bien visible
  const eleve = classBox(310, 196, cw, {
    name: "Eleve",
    attrs: ["-dateNaissance: Date"],
  });

  const administrateur = classBox(520, 196, cw, {
    name: "Administrateur",
    attrs: ["-nomService: String", "-organismeId: String"],
  });

  const agent = classBox(800, 196, cw, {
    name: "AgentCentreExamen",
    attrs: ["-centreExamenId: String"],
  });

  const notification = classBox(32, 320, cw, {
    name: "Notification",
    attrs: ["-message: String", "-statut: StatutNotification", "-typeNotification: String"],
    fill: TRANS,
  });

  const paiement = classBox(32, 450, cw, {
    name: "Paiement",
    attrs: ["-montant: Float", "-statut: StatutPaiement", "-modePaiement: String"],
    fill: TRANS,
  });

  const recu = classBox(32, 580, cw, {
    name: "Recu",
    attrs: ["-numero: String", "-montant: Float", "-dateEmission: DateTime"],
    fill: TRANS,
  });

  const rdv = classBox(32, 710, cw, {
    name: "RendezVous",
    attrs: ["-dateRdv: DateTime", "-heureRdv: String", "-statut: StatutRendezVous", "-lieu: String"],
    fill: TRANS,
  });

  const doc = classBox(508, 430, cw + 24, {
    name: "DocumentScolaire",
    abstract: true,
    attrs: ["-statut: StatutDocument", "-typeDocument: TypeDocument", "-diplomeType: String"],
    methods: ["+changerStatut()", "+mettreADisponible()"],
    fill: DOC,
  });

  const original = classBox(340, 640, cw, {
    name: "OriginalDiplome",
    attrs: ["-centreExamen: String"],
    fill: DOC,
  });

  const releve = classBox(528, 640, cw, {
    name: "ReleveNote",
    attrs: ["-regionComposition: String"],
    fill: DOC,
  });

  const duplicata = classBox(980, 640, cw, {
    name: "Duplicata",
    attrs: ["-statutValidation: String", "-motifRejet: String"],
    fill: DOC,
  });

  const boxes = [
    utilisateur, eleve, administrateur, agent,
    notification, paiement, recu, rdv,
    doc, original, releve, duplicata,
  ];

  const links = [
    inheritTree(utilisateur, [eleve, administrateur, agent]),
    inheritTree(doc, [original, releve]),

    assocToTop(administrateur, doc, "met à jour", {
      cardFrom: "*",
      cardTo: "*",
    }),
    assocToTop(agent, doc, "confirme retrait", {
      cardFrom: "*",
      cardTo: "*",
      labelPos: 0.68,
      labelOffset: { x: -72, y: -10 },
      cardToOffsetX: 28,
    }),

    assocToSide(doc, duplicata, "peut être", {
      cardFrom: "0..1",
      cardTo: "1",
      routeY: 580,
    }),

    eleveLeftColumnLinks(eleve, [
      { box: notification, label: "reçoit", cardFrom: "0..*", cardTo: "1" },
      { box: paiement, label: "effectue", cardFrom: "0..*", cardTo: "1" },
      { box: recu, label: "télécharge", cardFrom: "0..*", cardTo: "0..1" },
      { box: rdv, label: "prend RDV", cardFrom: "0..*", cardTo: "1" },
    ], { busX: 278 }),
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <style>
        .title { fill: #1F2937; font: 700 17px Arial, Helvetica, sans-serif; }
        .note { fill: #64748B; font: 11px Arial, Helvetica, sans-serif; }
        .cls-name { fill: ${STROKE}; font: 700 13px Arial, Helvetica, sans-serif; }
        .attr { fill: ${STROKE}; font: 11px Consolas, monospace; }
        .meth { fill: ${STROKE}; font: 11px Consolas, monospace; }
        .label { fill: #1E3A8A; font: 700 11px Arial, Helvetica, sans-serif; font-style: italic; }
        .card { fill: #B45309; font: 700 11px Arial, Helvetica, sans-serif; }
        .card-lg { fill: #B45309; font: 800 13px Arial, Helvetica, sans-serif; }
      </style>
    </defs>
    <rect width="${W}" height="${H}" fill="${FILL}"/>
    <text x="${W / 2}" y="28" text-anchor="middle" class="title">${esc("Figure 5.1 — Diagramme de classes (vue simplifiée)")}</text>
    <text x="${W / 2}" y="44" text-anchor="middle" class="note">${esc("Héritage △ — associations avec cardinalités — DR-DOCSCOL")}</text>
    ${boxes.map((b) => b.svg).join("\n")}
    ${links.join("\n")}
  </svg>`;
}

const svg = buildSvg();
const base = join(OUT, "diagramme-classes-simplifie");
writeFileSync(`${base}.svg`, svg);
const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(`${base}.png`, png);

const alias = join(OUT, "diagramme-classes-uml-complet");
writeFileSync(`${alias}.svg`, svg);
writeFileSync(`${alias}.png`, png);

console.log(`Generated:\n  ${base}.svg\n  ${base}.png\n  ${alias}.png`);
