/**
 * Diagrammes UC DR-DOCSCOL — diagramme général calqué sur le croquis WhatsApp
 * (WhatsApp Image 2026-06-21 at 7.22.37 PM.jpeg) :
 * 3 colonnes colorées (élève | admin | agent), cadre système unique,
 * acteurs hors du cadre, titre à l'intérieur du cadre.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = "docs/diagrammes-images";
mkdirSync(OUT, { recursive: true });

const STROKE = "#111827";
const LINE = "#374151";
const BOUNDARY = "#059669";
const FILL = "#FFFFFF";
const UC_FILL = "#1a4a4a";
const UC_TEXT = "#FFFFFF";

function esc(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function uc(cx, cy, label, rx = null, ry = 22) {
  const autoRx = Math.max(58, Math.min(155, Math.round(label.length * 4.9 + 24)));
  const rxi = rx ?? autoRx;
  return {
    cx, cy, rx: rxi, ry, label,
    lines: [label],
    fontSize: 11,
    lineHeight: 13,
    left: cx - rxi, right: cx + rxi, top: cy - ry, bottom: cy + ry,
  };
}

/** Cas d'utilisation dont l'ovale englobe le texte (retour ligne si besoin). */
function ucFit(cx, cy, label, opts = {}) {
  const fontSize = opts.fontSize ?? 20;
  const lineHeight = opts.lineHeight ?? Math.round(fontSize * 1.2);
  const charWidth = fontSize * 0.52;
  const maxLineChars = opts.maxLineChars ?? 14;
  const padX = opts.padX ?? 18;
  const padY = opts.padY ?? 12;

  const lines = wrapLabel(label, maxLineChars);
  const maxLineLen = Math.max(...lines.map((l) => l.length), 1);
  const rx = Math.max(72, Math.round(maxLineLen * charWidth + padX));
  const ry = Math.max(24, Math.round((lines.length * lineHeight + padY) / 2));

  return {
    cx, cy, rx, ry, label, lines, fontSize, lineHeight,
    left: cx - rx, right: cx + rx, top: cy - ry, bottom: cy + ry,
  };
}

function wrapLabel(label, maxChars) {
  if (label.length <= maxChars) return [label];

  if (label.includes(" ")) {
    const words = label.split(/\s+/);
    const lines = [];
    let cur = "";
    for (const w of words) {
      const chunks = w.length > maxChars ? wrapHyphenated(w, maxChars) : [w];
      for (const chunk of chunks) {
        const test = cur ? `${cur} ${chunk}` : chunk;
        if (test.length <= maxChars) cur = test;
        else {
          if (cur) lines.push(cur);
          cur = chunk;
        }
      }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [label];
  }

  return wrapHyphenated(label, maxChars);
}

function wrapHyphenated(label, maxChars) {
  if (label.length <= maxChars) return [label];
  const parts = label.split(/(?<=-)/);
  const lines = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + p).length <= maxChars) {
      cur += p;
      continue;
    }
    if (cur) lines.push(cur);
    if (p.length <= maxChars) {
      cur = p;
    } else {
      lines.push(p.slice(0, maxChars));
      cur = p.slice(maxChars);
      while (cur.length > maxChars) {
        lines.push(cur.slice(0, maxChars));
        cur = cur.slice(maxChars);
      }
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [label];
}

function scaleUcPos(scale) {
  return (cx, cy, label, rx = null) => {
    const node = ucFit(cx * scale, cy * scale, label, { fontSize: 24, maxLineChars: 12, padX: 20, padY: 14 });
    if (rx != null) {
      const minRx = rx * scale;
      if (node.rx < minRx) {
        node.rx = minRx;
        node.left = node.cx - minRx;
        node.right = node.cx + minRx;
      }
    }
    return node;
  };
}

function shiftNode(n, dx, dy) {
  return {
    ...n,
    cx: n.cx + dx,
    cy: n.cy + dy,
    left: n.left + dx,
    right: n.right + dx,
    top: n.top + dy,
    bottom: n.bottom + dy,
  };
}

function ellipse(n, fill = UC_FILL) {
  return `<ellipse cx="${n.cx}" cy="${n.cy}" rx="${n.rx}" ry="${n.ry}" fill="${fill}" stroke="${fill}" stroke-width="1.2"/>`;
}

function sectionZone(box, fill, stroke) {
  return `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
}

function ucText(n, textClass = "ucw") {
  const lines = n.lines ?? [n.label];
  const lh = n.lineHeight ?? (textClass === "ucw-lg" ? 29 : 13);
  const fs = n.fontSize ?? (textClass === "ucw-lg" ? 24 : 11);
  const startY = n.cy - ((lines.length - 1) * lh) / 2;
  return lines
    .map((line, i) => {
      const y = startY + i * lh + fs * 0.35;
      if (textClass === "ucw-lg") {
        return `<text x="${n.cx}" y="${y}" text-anchor="middle" class="${textClass}" font-size="${fs}">${esc(line)}</text>`;
      }
      return `<text x="${n.cx}" y="${y}" text-anchor="middle" class="${textClass}">${esc(line)}</text>`;
    })
    .join("\n");
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
  const ax = x2 - ux * 11;
  const ay = y2 - uy * 11;
  const px = -uy;
  const py = ux;
  return `<g>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${LINE}" stroke-width="1.2" stroke-dasharray="6 4"/>
    <polygon points="${x2},${y2} ${ax + px * 4},${ay + py * 4} ${ax - px * 4},${ay - py * 4}" fill="${LINE}"/>
    <text x="${labelX}" y="${labelY}" class="stereo">${esc(label)}</text>
  </g>`;
}

function branchDown(parent, children, gap = 36) {
  const midY = parent.bottom + gap;
  const xs = children.map((c) => c.cx);
  const lines = [
    solidLine(parent.cx, parent.bottom, parent.cx, midY),
    solidLine(Math.min(...xs), midY, Math.max(...xs), midY),
  ];
  children.forEach((child) => lines.push(solidLine(child.cx, midY, child.cx, child.top)));
  return lines.join("\n");
}

/** Branche vers le haut (ex. verifier-disponibilite → original/relevé/duplicata). */
function branchUp(parent, children, gap = 36) {
  const midY = parent.top - gap;
  const xs = children.map((c) => c.cx);
  const lines = [
    solidLine(parent.cx, parent.top, parent.cx, midY),
    solidLine(Math.min(...xs), midY, Math.max(...xs), midY),
  ];
  children.forEach((child) => lines.push(solidLine(child.cx, midY, child.cx, child.bottom)));
  return lines.join("\n");
}

function branchLeft(parent, children, gap = 36) {
  const midX = parent.left - gap;
  const ys = children.map((c) => c.cy);
  const lines = [
    solidLine(parent.left, parent.cy, midX, parent.cy),
    solidLine(midX, Math.min(...ys), midX, Math.max(...ys)),
  ];
  children.forEach((child) => lines.push(solidLine(midX, child.cy, child.right, child.cy)));
  return lines.join("\n");
}

/** Bus en T : acteur à gauche → colonne verticale → chaque cas (sans chevauchement). */
function actorLinksFromLeft(actorX, actorY, targets, spineX) {
  if (!targets.length) return "";
  const attachX = actorX + 26;
  const attachY = actorY + 6;
  const ys = targets.map((t) => t.cy);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const lines = [solidLine(attachX, attachY, spineX, attachY)];
  if (attachY <= yMin) lines.push(solidLine(spineX, attachY, spineX, yMax));
  else if (attachY >= yMax) lines.push(solidLine(spineX, yMin, spineX, attachY));
  else lines.push(solidLine(spineX, yMin, spineX, yMax));
  targets.forEach((t) => lines.push(solidLine(spineX, t.cy, t.left, t.cy)));
  return lines.join("\n");
}

/** Bus en T : acteur à droite → colonne verticale → chaque cas. */
function actorLinksFromRight(actorX, actorY, targets, spineX) {
  if (!targets.length) return "";
  const attachX = actorX - 26;
  const attachY = actorY + 6;
  const ys = targets.map((t) => t.cy);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const lines = [solidLine(attachX, attachY, spineX, attachY)];
  if (attachY <= yMin) lines.push(solidLine(spineX, attachY, spineX, yMax));
  else if (attachY >= yMax) lines.push(solidLine(spineX, yMin, spineX, attachY));
  else lines.push(solidLine(spineX, yMin, spineX, yMax));
  targets.forEach((t) => lines.push(solidLine(spineX, t.cy, t.right, t.cy)));
  return lines.join("\n");
}

/** Bus en T : acteur au-dessus → rail horizontal → chute verticale par cas. */
function actorLinksFromTop(actorX, actorY, targets, railY) {
  if (!targets.length) return "";
  const trunkY = actorY + 52;
  const lines = [solidLine(actorX, trunkY, actorX, railY)];
  const xs = targets.map((t) => t.cx);
  lines.push(solidLine(Math.min(actorX, ...xs), railY, Math.max(actorX, ...xs), railY));
  targets.forEach((t) => lines.push(solidLine(t.cx, railY, t.cx, t.top)));
  return lines.join("\n");
}

/** @deprecated préférer actorLinksFromLeft/Right/Top */
function actorLink(actorX, actorY, target, busX) {
  const startX = actorX + 26;
  const startY = actorY + 6;
  return `${solidLine(startX, startY, busX, startY)}\n${solidLine(busX, startY, busX, target.cy)}\n${solidLine(busX, target.cy, target.left, target.cy)}`;
}

function actor(x, y, label, variant = "default") {
  const lines = label.split("\n");
  const scale = variant === "general" ? 1.6 : 1;
  const r = 9 * scale;
  const ty = (40 + (lines.length > 1 ? 4 : 0)) * scale;
  const lh = 14 * scale;
  const fs = variant === "general" ? 22 : 12;
  const texts = lines
    .map((l, i) => `<text x="0" y="${ty + i * lh}" text-anchor="middle" class="actor" font-size="${fs}">${esc(l)}</text>`)
    .join("");
  return `<g transform="translate(${x},${y})">
    <circle cx="0" cy="${-16 * scale}" r="${r}" fill="${FILL}" stroke="${STROKE}" stroke-width="1.6"/>
    <line x1="0" y1="${-7 * scale}" x2="0" y2="${8 * scale}" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="${-14 * scale}" y1="0" x2="${14 * scale}" y2="0" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="0" y1="${8 * scale}" x2="${-11 * scale}" y2="${24 * scale}" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="0" y1="${8 * scale}" x2="${11 * scale}" y2="${24 * scale}" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round"/>
    ${texts}
  </g>`;
}

function boundary(box, label = "Système DR-DOCSCOL") {
  return `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="2" fill="none" stroke="${BOUNDARY}" stroke-width="2"/>
    <text class="boundaryLabel" transform="translate(${box.x + box.w - 10} ${box.y + box.h / 2}) rotate(-90)" text-anchor="middle">${esc(label)}</text>`;
}

/** Frontière UC général : titre horizontal en haut, à l'intérieur du cadre. */
function boundaryGeneral(box, label) {
  return `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="2" fill="none" stroke="${BOUNDARY}" stroke-width="2.5"/>
    <text x="${box.x + box.w / 2}" y="${box.y + 38}" text-anchor="middle" class="boundaryTitle">${esc(label)}</text>`;
}

function styles(variant = "default") {
  if (variant === "general") {
    return `<defs><style>
    .boundaryLabel { fill: ${BOUNDARY}; font: 700 22px Arial, Helvetica, sans-serif; }
    .boundaryTitle { fill: ${BOUNDARY}; font: 700 24px Arial, Helvetica, sans-serif; }
    .ucw-lg { fill: ${UC_TEXT}; font: 600 24px Arial, Helvetica, sans-serif; }
    .actor { fill: ${STROKE}; font: 600 22px Arial, Helvetica, sans-serif; text-anchor: middle; }
    .stereo { fill: ${LINE}; font: 600 18px Arial, Helvetica, sans-serif; font-style: italic; }
    .title { fill: #1F2937; font: 700 32px Arial, Helvetica, sans-serif; }
  </style></defs>`;
  }
  return `<defs><style>
    .boundaryLabel { fill: ${BOUNDARY}; font: 700 14px Arial, Helvetica, sans-serif; }
    .ucw { fill: ${UC_TEXT}; font: 11px Arial, Helvetica, sans-serif; }
    .actor { fill: ${STROKE}; font: 600 12px Arial, Helvetica, sans-serif; text-anchor: middle; }
    .stereo { fill: ${LINE}; font: 10px Arial, Helvetica, sans-serif; font-style: italic; }
    .title { fill: #1F2937; font: 700 17px Arial, Helvetica, sans-serif; }
  </style></defs>`;
}

function wrap(W, H, title, body, variant = "default") {
  const titleY = variant === "general" ? 56 : 30;
  const titleEl = title
    ? `<text x="${W / 2}" y="${titleY}" text-anchor="middle" class="title">${esc(title)}</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${styles(variant)}
    <rect width="${W}" height="${H}" fill="${FILL}"/>
    ${titleEl}
    ${body}
  </svg>`;
}

/** Liaisons acteur en croix (admin original : haut, gauche, droite, bas). */
function actorLinksCross(actorX, actorY, { up, left, right, down }) {
  const cx = actorX + 22;
  const cy = actorY + 6;
  const lines = [];
  if (up) {
    const busY = up.bottom + 24;
    lines.push(solidLine(cx, cy, cx, busY), solidLine(cx, busY, up.cx, busY), solidLine(up.cx, busY, up.cx, up.bottom));
  }
  if (left) {
    const busX = left.right + 24;
    lines.push(solidLine(cx, cy, busX, cy), solidLine(busX, cy, busX, left.cy), solidLine(busX, left.cy, left.right, left.cy));
  }
  if (right) {
    const busX = right.left - 24;
    lines.push(solidLine(cx, cy, busX, cy), solidLine(busX, cy, busX, right.cy), solidLine(busX, right.cy, right.left, right.cy));
  }
  if (down) {
    const busY = down.top - 24;
    lines.push(solidLine(cx, cy, cx, busY), solidLine(cx, busY, down.cx, busY), solidLine(down.cx, busY, down.cx, down.top));
  }
  return lines.join("\n");
}

function buildEleveScene(ox = 0, oy = 0, layout = {}) {
  const u = layout.u ?? uc;
  const gap = layout.gap ?? 44;
  const S = (n) => shiftNode(n, ox, oy);

  // Haut : branche « vérifier disponibilité » (enfants au-dessus de verif)
  const od2 = S(u(500, 58, "original-diplome", 92));
  const rel2 = S(u(660, 58, "releve", 60));
  const dup2 = S(u(820, 58, "duplicata", 70));
  const verif = S(u(660, 168, "verifier-disponibilite", 112));

  // Colonne auth + QR
  const qr = S(u(180, 200, "consulter-via-QRcode", 112));
  const auth = S(u(180, 320, "authentifier"));

  // Demande + spécialisations
  const demande = S(u(480, 320, "effectuer-demande-retrait", 122));
  const od1 = S(u(320, 480, "original-diplome", 92));
  const rel1 = S(u(480, 480, "releve", 60));
  const dup1 = S(u(640, 480, "duplicata", 70));

  // Flux paiement duplicata (dup1) — resserré à gauche pour ne pas empiéter sur admin
  const pay = S(u(640, 600, "effectuer-payement", 102));
  const form = S(u(850, 600, "remplir-formulaire", 102));
  const recuPay = S(u(640, 720, "telecharger-recu", 102));

  // RDV (bas gauche) — reçu séparé du flux paiement
  const rdv = S(u(180, 580, "prendre-rdv"));
  const annul = S(u(180, 680, "annuler-rdv", 80));
  const recuRdv = S(u(420, 690, "telecharger-recu", 102));

  const nodes = [
    auth, qr, demande, rdv, od1, rel1, dup1, verif, od2, rel2, dup2,
    pay, form, recuPay, annul, recuRdv,
  ];
  const lines = [
    dashedArrow(auth.cx, auth.top, qr.cx, qr.bottom, "<<include>>", auth.cx + 16, auth.cy - 48),
    dashedArrow(auth.right, auth.cy, demande.left, demande.cy, "<<include>>", (auth.right + demande.left) / 2, auth.cy - 12),
    dashedArrow(demande.cx, demande.top, verif.cx, verif.bottom, "<<extend>>", demande.cx + 14, (demande.top + verif.bottom) / 2),
    dashedArrow(dup1.cx, dup1.bottom, pay.cx, pay.top, "<<include>>", dup1.cx, (dup1.bottom + pay.top) / 2),
    dashedArrow(dup1.right, dup1.cy, form.left, form.cy, "<<include>>", (dup1.right + form.left) / 2, dup1.cy + 6),
    dashedArrow(pay.cx, pay.bottom, recuPay.cx, recuPay.top, "<<include>>", pay.cx - 14, (pay.bottom + recuPay.top) / 2),
    dashedArrow(annul.cx, annul.top, rdv.cx, rdv.bottom, "<<extend>>", annul.cx + 12, (annul.top + rdv.bottom) / 2),
    dashedArrow(recuRdv.left, recuRdv.cy, rdv.right, rdv.cy, "<<extend>>", (recuRdv.left + rdv.right) / 2, recuRdv.cy - 8),
    branchDown(demande, [od1, rel1, dup1], gap),
    branchUp(verif, [od2, rel2, dup2], gap),
  ];

  return { nodes, lines, targets: [auth, demande, rdv] };
}

function buildAdminScene(ox = 0, oy = 0, layout = {}) {
  const u = layout.u ?? uc;
  const gap = layout.gap ?? 40;
  const S = (n) => shiftNode(n, ox, oy);

  const audit = S(u(480, 80, "consulter le journal audit", 122));
  const quota = S(u(300, 260, "DEFINIR-QUOTA-JOURNALIER", 122));
  const jours = S(u(300, 400, "définir les jours feriés", 112));
  const auth = S(u(520, 260, "authentifier"));
  const imports = S(u(300, 540, "effectuer les import", 102));
  const importDispo = S(u(140, 660, "import disponibilité", 112));
  const importEleve = S(u(500, 660, "import ajout élève", 102));

  const maj = S(u(740, 260, "mettre à jour", 98));
  const diplome = S(u(640, 400, "diplôme", 62));
  const releve = S(u(740, 400, "relevé", 58));
  const duplicata = S(u(840, 400, "duplicata", 72));
  const traiter = S(u(840, 540, "traiter la demande", 112));
  const valide = S(u(740, 660, "valide", 52));
  const rejeton = S(u(940, 660, "rejeton", 58));

  const nodes = [
    audit, quota, jours, auth, imports, importDispo, importEleve,
    maj, diplome, releve, duplicata, traiter, valide, rejeton,
  ];
  const lines = [
    dashedArrow(quota.cx, quota.bottom, jours.cx, jours.top, "<<include>>", quota.cx - 16, (quota.bottom + jours.top) / 2),
    dashedArrow(auth.right, auth.cy, maj.left, maj.cy, "<<include>>", (auth.right + maj.left) / 2, auth.cy - 12),
    dashedArrow(duplicata.cx, duplicata.bottom, traiter.cx, traiter.top, "<<include>>", duplicata.cx - 14, (duplicata.bottom + traiter.top) / 2),
    branchDown(imports, [importDispo, importEleve], gap),
    branchDown(maj, [diplome, releve, duplicata], gap),
    branchDown(traiter, [valide, rejeton], gap),
  ];

  return {
    nodes,
    lines,
    targets: { up: audit, left: quota, right: auth, down: imports },
  };
}

function buildAgentScene(ox = 0, oy = 0, layout = {}) {
  const u = layout.u ?? uc;
  const S = (n) => shiftNode(n, ox, oy);
  const compact = layout.compact ?? false;

  if (compact) {
    const auth = S(u(260, 100, "authentifier"));
    const consulter = S(u(260, 260, "consulter-les-rdv", 102));
    const confirmer = S(u(260, 430, "confirmer-les-retraits-effectuer", 118));
    const nodes = [auth, consulter, confirmer];
    const lines = [
      dashedArrow(auth.cx, auth.bottom, consulter.cx, consulter.top, "<<include>>", auth.cx + 14, (auth.bottom + consulter.top) / 2),
      dashedArrow(confirmer.cx, confirmer.top, consulter.cx, consulter.bottom, "<<extend>>", confirmer.cx + 16, (confirmer.top + consulter.bottom) / 2),
    ];
    return { nodes, lines, targets: [auth] };
  }

  const auth = S(u(220, 140, "authentifier"));
  const consulter = S(u(220, 300, "consulter-les-rdv", 102));
  const confirmer = S(u(560, 300, "confirmer-les-retraits-effectuer", 155));

  const nodes = [auth, consulter, confirmer];
  const lines = [
    dashedArrow(auth.cx, auth.bottom, consulter.cx, consulter.top, "<<include>>", auth.cx + 14, (auth.bottom + consulter.top) / 2),
    dashedArrow(confirmer.left, confirmer.cy, consulter.right, consulter.cy, "<<extend>>", (confirmer.left + consulter.right) / 2, confirmer.cy - 10),
  ];

  return { nodes, lines, targets: [auth] };
}

function renderPackageDiagram({ W, H, title, box, actorX, actorY, actorLabel, scene, spineX, actorLinkMode = "left", railY }) {
  const actorEl = actor(actorX, actorY, actorLabel);
  let actorLinks = "";
  if (actorLinkMode === "cross") {
    actorLinks = actorLinksCross(actorX, actorY, scene.targets);
  } else if (actorLinkMode === "top") {
    actorLinks = actorLinksFromTop(actorX, actorY, scene.targets, railY);
  } else if (actorLinkMode === "right") {
    actorLinks = actorLinksFromRight(actorX, actorY, scene.targets, spineX);
  } else {
    actorLinks = actorLinksFromLeft(actorX, actorY, scene.targets, spineX);
  }

  return wrap(W, H, title, [
    boundary(box),
    scene.nodes.map((n) => ellipse(n)).join("\n"),
    scene.lines.join("\n"),
    scene.nodes.map((n) => ucText(n)).join("\n"),
    actorEl,
    actorLinks,
  ].join("\n"));
}

function buildEleve() {
  const box = { x: 150, y: 44, w: 980, h: 760 };
  const scene = buildEleveScene(box.x, box.y + 20);
  return renderPackageDiagram({
    W: 1180,
    H: 860,
    title: "Cas d'utilisation — Élève",
    box,
    actorX: 55,
    actorY: 420,
    actorLabel: "élève",
    scene,
    spineX: box.x - 40,
  });
}

function buildAdmin() {
  const box = { x: 150, y: 44, w: 980, h: 720 };
  const scene = buildAdminScene(box.x, box.y + 20);
  return renderPackageDiagram({
    W: 1180,
    H: 820,
    title: "Cas d'utilisation — Administrateur OBC/DECC",
    box,
    actorX: 200,
    actorY: 400,
    actorLabel: "Administrateur\nOBC/DECC",
    scene,
    actorLinkMode: "cross",
  });
}

function buildAgent() {
  const box = { x: 150, y: 44, w: 720, h: 400 };
  const scene = buildAgentScene(box.x, box.y + 20);
  return renderPackageDiagram({
    W: 920,
    H: 500,
    title: "Cas d'utilisation — Agent centre d'examen",
    box,
    actorX: 55,
    actorY: 240,
    actorLabel: "Agent centre\nd'examen",
    scene,
    spineX: box.x - 35,
  });
}

function buildGeneral() {
  const frameLabel = "diagramme cas d'utilisation système DR-DOCSCOL";
  const scale = 0.68;
  const layout = { u: scaleUcPos(scale), gap: Math.round(40 * scale) };
  const innerPad = 16;
  const titleH = 46;
  const colGap = 14;
  const colW = 920;
  const colH = 780;

  const boxW = 3 * colW + 2 * colGap + 2 * innerPad;
  const boxH = colH + titleH + 2 * innerPad;
  const boxX = 108;
  const boxY = 96;
  const box = { x: boxX, y: boxY, w: boxW, h: boxH };

  const zones = [
    {
      fill: "#E8EEF7",
      stroke: "#475569",
      ucFill: "#1e3a5f",
      actor: "élève",
      build: (ox, oy) => buildEleveScene(ox, oy, layout),
      targets: (s) => s.targets,
      linkMode: "left",
    },
    {
      fill: "#E6F4F4",
      stroke: "#0f766e",
      ucFill: "#115e59",
      actor: "AdminOBC/DECC",
      build: (ox, oy) => buildAdminScene(ox, oy, layout),
      targets: (s) => [s.targets.up, s.targets.left, s.targets.right, s.targets.down],
      linkMode: "top",
    },
    {
      fill: "#FFF4EB",
      stroke: "#ea580c",
      ucFill: "#c2410c",
      actor: "Agent-centre-examen",
      build: (ox, oy) => buildAgentScene(ox, oy, { ...layout, compact: true, u: scaleUcPos(scale * 0.95) }),
      targets: (s) => s.targets,
      linkMode: "right",
    },
  ];

  const parts = [];
  let sx = box.x + innerPad;
  const sy = box.y + titleH + innerPad;

  for (const zone of zones) {
    const section = { x: sx, y: sy, w: colW, h: colH };
    const scene = zone.build(section.x + 24, section.y + 16);
    parts.push({ section, scene, zone });
    sx += colW + colGap;
  }

  const adminPart = parts[1];
  const agentPart = parts[2];

  const actorEleveX = 28;
  const actorEleveY = box.y + box.h / 2;
  const adminActorX = adminPart.section.x + adminPart.section.w / 2 - 22;
  const actorAdminY = 16;
  const actorAgentPosX = box.x + box.w + 66;
  const actorAgentY = box.y + box.h / 2;

  const eSpine = box.x - 32;
  const gSpine = box.x + box.w + 28;
  const adminRailY = box.y + titleH + 10;

  const eLinks = actorLinksFromLeft(actorEleveX, actorEleveY, parts[0].scene.targets, eSpine);
  const aLinks = actorLinksFromTop(adminActorX + 22, actorAdminY, adminPart.zone.targets(adminPart.scene), adminRailY);
  const gLinks = actorLinksFromRight(actorAgentPosX, actorAgentY, agentPart.scene.targets, gSpine);

  const W = actorAgentPosX + 130;
  const H = box.y + box.h + 48;

  return wrap(W, H, "", [
    boundaryGeneral(box, frameLabel),
    ...parts.map((p) => sectionZone(p.section, p.zone.fill, p.zone.stroke)),
    ...parts.flatMap((p) => p.scene.nodes.map((n) => ellipse(n, p.zone.ucFill))),
    ...parts.flatMap((p) => p.scene.lines),
    ...parts.flatMap((p) => p.scene.nodes.map((n) => ucText(n, "ucw-lg"))),
    eLinks,
    aLinks,
    gLinks,
    actor(actorEleveX, actorEleveY, "élève", "general"),
    actor(adminActorX, actorAdminY, "AdminOBC/DECC", "general"),
    actor(actorAgentPosX, actorAgentY, "Agent-centre-examen", "general"),
  ].join("\n"), "general");
}

async function exportDiagram(name, svg, { density = 96 } = {}) {
  const base = join(OUT, name);
  writeFileSync(`${base}.svg`, svg);
  writeFileSync(`${base}.png`, await sharp(Buffer.from(svg), { density }).png().toBuffer());
  console.log(`  ${base}.png`);
}

console.log("Génération diagrammes UC…");
await exportDiagram("cas-utilisation-general", buildGeneral(), { density: 120 });
await exportDiagram("cas-utilisation-eleve.drawio", buildEleve());
await exportDiagram("cas-utilisation-admin-obc-decc.drawio", buildAdmin());
await exportDiagram("cas-utilisation-agent-centre.drawio", buildAgent());
console.log("Terminé.");
