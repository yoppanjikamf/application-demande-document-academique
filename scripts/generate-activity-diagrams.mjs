/**
 * Diagrammes d'activité UML — rendu vectoriel soigné (SVG + PNG).
 * Alignés sur cahier_conception §3.3, fiches UC §3.6 et processus cahier_analyse §5.2.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT_DIR = "docs/diagrammes-images/activites";
mkdirSync(OUT_DIR, { recursive: true });

const STROKE = "#111827";
const LINE = "#374151";
const FILL = "#FFFFFF";
const ACT_FILL = "#F8FAFC";
const DECISION_FILL = "#FFFBEB";
const SWIM_FILL = "#F0FDF4";
const SWIM_STROKE = "#059669";
const TITLE_COLOR = "#1F2937";
const GAP = 32;

function esc(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrapLabel(text, maxChars = 22) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function actHeight(label, w = 200) {
  return wrapLabel(label).length * 14 + 18;
}

function svgStyles() {
  return `<defs><style>
    .title { fill: ${TITLE_COLOR}; font: 700 16px Arial, Helvetica, sans-serif; }
    .act { fill: ${STROKE}; font: 12px Arial, Helvetica, sans-serif; text-anchor: middle; }
    .dec { fill: ${STROKE}; font: 11px Arial, Helvetica, sans-serif; text-anchor: middle; }
    .guard { fill: ${LINE}; font: 10px Arial, Helvetica, sans-serif; font-style: italic; }
    .swim { fill: ${SWIM_STROKE}; font: 700 13px Arial, Helvetica, sans-serif; }
    .note { fill: #64748B; font: 10px Arial, Helvetica, sans-serif; text-anchor: middle; }
  </style></defs>`;
}

function activity(cx, cy, label, w = 200) {
  const lines = wrapLabel(label);
  const lh = 14;
  const boxH = lines.length * lh + 18;
  const top = cy - boxH / 2;
  const texts = lines
    .map((l, i) => {
      const y = cy - ((lines.length - 1) * lh) / 2 + i * lh + 4;
      return `<text x="${cx}" y="${y}" class="act">${esc(l)}</text>`;
    })
    .join("");
  return {
    cx,
    cy,
    top,
    bottom: top + boxH,
    left: cx - w / 2,
    right: cx + w / 2,
    svg: `<rect x="${cx - w / 2}" y="${top}" width="${w}" height="${boxH}" rx="10" ry="10" fill="${ACT_FILL}" stroke="${STROKE}" stroke-width="1.6"/>${texts}`,
  };
}

function decision(cx, cy, label, size = 46) {
  const lines = wrapLabel(label, 14);
  const lh = 12;
  const texts = lines
    .map((l, i) => {
      const y = cy - ((lines.length - 1) * lh) / 2 + i * lh + 4;
      return `<text x="${cx}" y="${y}" class="dec">${esc(l)}</text>`;
    })
    .join("");
  const pts = `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`;
  return {
    cx,
    cy,
    top: cy - size,
    bottom: cy + size,
    left: cx - size,
    right: cx + size,
    svg: `<polygon points="${pts}" fill="${DECISION_FILL}" stroke="${STROKE}" stroke-width="1.6"/>${texts}`,
  };
}

function initial(cx, cy) {
  return { cx, cy, top: cy - 8, bottom: cy + 8, svg: `<circle cx="${cx}" cy="${cy}" r="8" fill="${STROKE}"/>` };
}

function final(cx, cy) {
  return {
    cx,
    cy,
    top: cy - 10,
    bottom: cy + 10,
    svg: `<circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="${STROKE}" stroke-width="1.8"/><circle cx="${cx}" cy="${cy}" r="6" fill="${STROKE}"/>`,
  };
}

function forkBar(x1, x2, y) {
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${STROKE}" stroke-width="3"/>`;
}

function arrowV(from, to, guard = "") {
  const x = from.cx;
  const y1 = from.bottom + 2;
  const y2 = to.top - 2;
  const g = guard ? `<text x="${x + 8}" y="${(y1 + y2) / 2}" class="guard">${esc(guard)}</text>` : "";
  return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${LINE}" stroke-width="1.4" marker-end="url(#arrow)"/>${g}`;
}

function arrowPath(points, guard = "", guardAt = 0) {
  const pts = points.map((p) => `${p.x},${p.y}`).join(" ");
  const g = guard
    ? `<text x="${points[guardAt].x + 6}" y="${points[guardAt].y - 4}" class="guard">${esc(guard)}</text>`
    : "";
  return `<polyline points="${pts}" fill="none" stroke="${LINE}" stroke-width="1.4" marker-end="url(#arrow)"/>${g}`;
}

function swimlane(x, y, w, h, label) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${SWIM_FILL}" fill-opacity="0.35" stroke="${SWIM_STROKE}" stroke-width="1.5"/>
    <text x="${x + 12}" y="${y + 22}" class="swim">${esc(label)}</text>`;
}

function placeAct(cx, top, text, w = 200) {
  const h = actHeight(text, w);
  return activity(cx, top + h / 2, text, w);
}

function buildAct01(width = 760) {
  const cx = width / 2;
  const lx = cx - 170;
  const rx = cx + 170;
  let y = 58;
  const nodes = [];
  const arrows = [];
  const parts = [];

  const start = initial(cx, y);
  nodes.push(start);
  y = start.bottom + GAP;

  const steps = [
    { cx, t: "Admin enregistre l'élève (Import B)" },
    { cx, t: "Élève active son compte (/auth/register)" },
    { cx, t: "Élève consulte Mes documents" },
    { cx, t: "Élève enregistre la demande (relevé ou diplôme)" },
    { cx, t: "Admin disponibilise (Import A ou action manuelle)" },
    { cx, t: "Notification : document DISPONIBLE" },
  ];

  let prev = start;
  for (const s of steps) {
    const n = placeAct(s.cx, y, s.t);
    nodes.push(n);
    arrows.push(arrowV(prev, n));
    prev = n;
    y = n.bottom + GAP;
  }

  const dec = decision(cx, y + 46, "Retrait au centre d'examen ?", 50);
  nodes.push(dec);
  arrows.push(arrowV(prev, dec));
  y = dec.bottom + GAP;

  const forkY = y;
  parts.push(forkBar(lx, rx, forkY));
  arrows.push(arrowPath([{ x: cx, y: dec.bottom }, { x: cx, y: forkY }]));
  arrows.push(arrowPath([{ x: cx, y: forkY }, { x: lx, y: forkY }, { x: lx, y: forkY + 20 }], "[oui]", 1));
  arrows.push(arrowPath([{ x: cx, y: forkY }, { x: rx, y: forkY }, { x: rx, y: forkY + 20 }], "[non]", 1));

  y = forkY + 20;
  const rdv = placeAct(lx, y, "Élève prend rendez-vous (centre)");
  const antenne = placeAct(rx, y, "Élève suit instructions antenne");
  nodes.push(rdv, antenne);
  y = Math.max(rdv.bottom, antenne.bottom) + GAP;

  const agent = placeAct(lx, y, "Agent confirme le retrait");
  const adminA = placeAct(rx, y, "Admin antenne confirme le retrait");
  nodes.push(agent, adminA);
  arrows.push(arrowV(rdv, agent));
  arrows.push(arrowV(antenne, adminA));

  y = Math.max(agent.bottom, adminA.bottom) + GAP;
  const mergeY = y;
  parts.push(forkBar(lx, rx, mergeY));
  arrows.push(arrowPath([{ x: lx, y: agent.bottom }, { x: lx, y: mergeY }, { x: cx, y: mergeY }]));
  arrows.push(arrowPath([{ x: rx, y: adminA.bottom }, { x: rx, y: mergeY }, { x: cx, y: mergeY }]));

  y = mergeY + GAP;
  const finAct = placeAct(cx, y, "Document RETIRE + notification élève");
  nodes.push(finAct);
  arrows.push(arrowPath([{ x: cx, y: mergeY }, { x: cx, y: finAct.top }]));

  y = finAct.bottom + GAP;
  const end = final(cx, y + 10);
  nodes.push(end);
  arrows.push(arrowV(finAct, end));

  const height = end.bottom + 48;
  return wrapSvg({
    title: "Diagramme d'activité — Retrait relevé / diplôme",
    subtitle: "Processus 1 + 2 + 4 (§5.2 analyse) — routage centre vs antenne",
    width,
    height,
    laneLabel: "Élève · Administrateur · Agent / Admin antenne",
    nodes,
    arrows,
    parts,
  });
}

function buildAct02(width = 760) {
  const cx = width / 2;
  const lx = cx - 165;
  let y = 58;
  const nodes = [];
  const arrows = [];
  const parts = [];

  const start = initial(cx, y);
  nodes.push(start);
  y = start.bottom + GAP;
  let prev = start;

  for (const t of [
    "Élève remplit le formulaire duplicata",
    "Téléversement des pièces (Storage)",
    "Paiement simulé + reçu (même opération)",
    "Dossier SOUMISE — notification élève",
    "Admin analyse les pièces (traiter dossier)",
  ]) {
    const n = placeAct(cx, y, t);
    nodes.push(n);
    arrows.push(arrowV(prev, n));
    prev = n;
    y = n.bottom + GAP;
  }

  const dec = decision(cx, y + 46, "Dossier validable ?", 50);
  nodes.push(dec);
  arrows.push(arrowV(prev, dec));
  y = dec.bottom + GAP;

  const valide = placeAct(cx, y, "Admin valide le dossier");
  const rejet = placeAct(lx, y, "Admin rejette — dossier REJETEE");
  nodes.push(valide, rejet);
  arrows.push(arrowPath([{ x: cx, y: dec.bottom }, { x: cx, y: valide.top }], "[oui]", 0));
  arrows.push(arrowPath([{ x: dec.left, y: dec.cy }, { x: lx, y: dec.cy }, { x: lx, y: rejet.top }], "[non]", 1));

  y = Math.max(valide.bottom, rejet.bottom) + GAP;
  const dispo = placeAct(cx, y, "Document duplicata DISPONIBLE (antenne)");
  nodes.push(dispo);
  arrows.push(arrowV(valide, dispo));

  y = dispo.bottom + GAP;
  const retrait = placeAct(cx, y, "Admin antenne confirme retrait → RETIRE");
  nodes.push(retrait);
  arrows.push(arrowV(dispo, retrait));

  y = retrait.bottom + GAP;
  const endOk = final(cx, y + 10);
  nodes.push(endOk);
  arrows.push(arrowV(retrait, endOk));

  y = rejet.bottom + GAP;
  const endKo = final(lx, y + 10);
  nodes.push(endKo);
  arrows.push(arrowV(rejet, endKo));

  const height = Math.max(endOk.bottom, endKo.bottom) + 48;
  return wrapSvg({
    title: "Diagramme d'activité — Duplicata",
    subtitle: "Processus 3 (§5.2) — paiement à la soumission, retrait en antenne",
    width,
    height,
    laneLabel: "Élève · Administrateur antenne OBC/DECC",
    nodes,
    arrows,
    parts,
  });
}

function buildAct03(width = 720) {
  const cx = width / 2;
  const lx = cx - 155;
  const rx = cx + 155;
  let y = 58;
  const nodes = [];
  const arrows = [];
  const parts = [];

  const start = initial(cx, y);
  nodes.push(start);
  y = start.bottom + GAP;

  const auth = placeAct(cx, y, "Connexion portail admin (OBC ou DECC)");
  nodes.push(auth);
  arrows.push(arrowV(start, auth));
  y = auth.bottom + GAP;

  const decMode = decision(cx, y + 46, "Mode de saisie ?", 48);
  nodes.push(decMode);
  arrows.push(arrowV(auth, decMode));
  y = decMode.bottom + GAP;

  const forkY = y;
  parts.push(forkBar(lx, rx, forkY));
  arrows.push(arrowPath([{ x: cx, y: decMode.bottom }, { x: cx, y: forkY }]));
  arrows.push(arrowPath([{ x: cx, y: forkY }, { x: lx, y: forkY + 18 }], "Import A", 1));
  arrows.push(arrowPath([{ x: cx, y: forkY }, { x: rx, y: forkY + 18 }], "Unitaire", 1));

  y = forkY + 18;
  const importA = placeAct(lx, y, "Import CSV disponibilisation", 190);
  const unit = placeAct(rx, y, "MAJ statut depuis /admin/documents", 190);
  nodes.push(importA, unit);
  y = Math.max(importA.bottom, unit.bottom) + GAP;

  const mergeY = y;
  parts.push(forkBar(lx, rx, mergeY));
  arrows.push(arrowPath([{ x: lx, y: importA.bottom }, { x: lx, y: mergeY }, { x: cx, y: mergeY }]));
  arrows.push(arrowPath([{ x: rx, y: unit.bottom }, { x: rx, y: mergeY }, { x: cx, y: mergeY }]));

  y = mergeY + GAP;
  const decVal = decision(cx, y + 46, "Périmètre et règles OK ?", 50);
  nodes.push(decVal);
  arrows.push(arrowPath([{ x: cx, y: mergeY }, { x: cx, y: decVal.top }]));

  y = decVal.bottom + GAP;
  const ok = placeAct(cx, y, "Statut → DISPONIBLE + notification");
  nodes.push(ok);
  arrows.push(arrowV(decVal, ok, "[oui]"));
  y = ok.bottom + GAP;

  const audit = placeAct(cx, y, "Audit log (IMPORT ou UPDATE)");
  nodes.push(audit);
  arrows.push(arrowV(ok, audit));
  y = audit.bottom + GAP;

  const end = final(cx, y + 10);
  nodes.push(end);
  arrows.push(arrowV(audit, end));

  const height = end.bottom + 48;
  return wrapSvg({
    title: "Diagramme d'activité — Disponibilisation",
    subtitle: "Processus 2 (§5.2) — Import A OU action unitaire (pas les deux)",
    width,
    height,
    laneLabel: "Administrateur OBC / DECC",
    nodes,
    arrows,
    parts,
  });
}

function buildAct04(width = 700) {
  const cx = width / 2;
  const lx = cx - 150;
  let y = 58;
  const nodes = [];
  const arrows = [];
  const parts = [];

  const start = initial(cx, y);
  nodes.push(start);
  y = start.bottom + GAP;
  let prev = start;

  for (const t of [
    "Connexion espace /centre-examen",
    "Consulter RDV transmis (région / centre)",
    "Prérequis : RDV PLANIFIE par l'élève",
    "Vérifier identité élève sur place",
  ]) {
    const n = placeAct(cx, y, t);
    nodes.push(n);
    arrows.push(arrowV(prev, n));
    prev = n;
    y = n.bottom + GAP;
  }

  const dec = decision(cx, y + 46, "Document conforme ?", 48);
  nodes.push(dec);
  arrows.push(arrowV(prev, dec));
  y = dec.bottom + GAP;

  const confirm = placeAct(cx, y, "Confirmer retrait (API confirm-withdrawal)");
  const refuse = placeAct(lx, y, "Refuser — retrait non enregistré");
  nodes.push(confirm, refuse);
  arrows.push(arrowV(dec, confirm, "[oui]"));
  arrows.push(arrowPath([{ x: dec.left, y: dec.cy }, { x: lx, y: dec.cy }, { x: lx, y: refuse.top }], "[non]", 1));

  y = confirm.bottom + GAP;
  const honore = placeAct(cx, y, "RDV HONORE · document RETIRE");
  nodes.push(honore);
  arrows.push(arrowV(confirm, honore));
  y = honore.bottom + GAP;

  const mail = placeAct(cx, y, "Email accusé de retrait à l'élève");
  nodes.push(mail);
  arrows.push(arrowV(honore, mail));
  y = mail.bottom + GAP;

  const endOk = final(cx, y + 10);
  nodes.push(endOk);
  arrows.push(arrowV(mail, endOk));

  y = refuse.bottom + GAP;
  const endKo = final(lx, y + 10);
  nodes.push(endKo);
  arrows.push(arrowV(refuse, endKo));

  const height = Math.max(endOk.bottom, endKo.bottom) + 48;
  return wrapSvg({
    title: "Diagramme d'activité — Retrait centre d'examen",
    subtitle: "Processus 4 (§5.2) — branche centre uniquement (agent)",
    width,
    height,
    laneLabel: "Agent centre d'examen · Élève (RDV amont)",
    nodes,
    arrows,
    parts,
  });
}

function wrapSvg({ title, subtitle, width, height, laneLabel, nodes, arrows, parts }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${svgStyles()}
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <polygon points="0,0 8,4 0,8" fill="${LINE}"/>
    </marker>
    <rect width="${width}" height="${height}" fill="${FILL}"/>
    <text x="${width / 2}" y="26" text-anchor="middle" class="title">${esc(title)}</text>
    <text x="${width / 2}" y="44" text-anchor="middle" class="note">${esc(subtitle)}</text>
    ${swimlane(32, 48, width - 64, height - 56, laneLabel)}
    ${parts.join("\n")}
    ${nodes.map((n) => n.svg).join("\n")}
    ${arrows.join("\n")}
  </svg>`;
}

/** Flux linéaire ou avec une décision binaire — diagrammes par cas d'utilisation (§3.7–3.9). */
function buildLinearFlow({ title, subtitle, laneLabel, steps, width = 700 }) {
  const cx = width / 2;
  const lx = cx - 155;
  let y = 58;
  const nodes = [];
  const arrows = [];
  const parts = [];

  const start = initial(cx, y);
  nodes.push(start);
  y = start.bottom + GAP;
  let prev = start;

  for (const step of steps) {
    if (step.type === "decision") {
      const dec = decision(cx, y + 46, step.label, step.size ?? 48);
      nodes.push(dec);
      arrows.push(arrowV(prev, dec));
      y = dec.bottom + GAP;

      const yes = placeAct(cx, y, step.yes, step.w ?? 200);
      const no = placeAct(lx, y, step.no, step.w ?? 200);
      nodes.push(yes, no);
      arrows.push(arrowV(dec, yes, "[oui]"));
      arrows.push(arrowPath([{ x: dec.left, y: dec.cy }, { x: lx, y: dec.cy }, { x: lx, y: no.top }], "[non]", 1));

      y = Math.max(yes.bottom, no.bottom) + GAP;
      const endYes = final(cx, y + 10);
      const endNo = final(lx, y + 10);
      nodes.push(endYes, endNo);
      arrows.push(arrowV(yes, endYes));
      arrows.push(arrowV(no, endNo));
      prev = endYes;
      y = Math.max(endYes.bottom, endNo.bottom) + GAP;
      break;
    }

    const n = placeAct(cx, y, step, 210);
    nodes.push(n);
    arrows.push(arrowV(prev, n));
    prev = n;
    y = n.bottom + GAP;
  }

  if (prev.svg.includes("circle") && prev.svg.includes("fill=\"none\"")) {
    // already ended via decision branch
  } else {
    const end = final(cx, y + 10);
    nodes.push(end);
    arrows.push(arrowV(prev, end));
    y = end.bottom + GAP;
  }

  const height = y + 48;
  return wrapSvg({ title, subtitle, width, height, laneLabel, nodes, arrows, parts });
}

function buildPerUcActivities() {
  return [
    {
      file: "act-uc-01-activer-compte",
      build: () =>
        buildLinearFlow({
          title: "Activité UC-01 — Activer son compte",
          subtitle: "Élève non connecté → compte activé et session ouverte",
          laneLabel: "Élève · Système DR-DOCSCOL",
          steps: [
            "Accéder à /auth/register",
            "Saisir matricule, email, mot de passe",
            "Vérifier correspondance matricule + email en base",
            "Créer compte Auth et lier authUserId",
            "Envoyer email de bienvenue",
            "Rediriger vers /dashboard",
          ],
        }),
    },
    {
      file: "act-uc-auth-eleve",
      build: () =>
        buildLinearFlow({
          title: "Activité — Authentifier (élève)",
          subtitle: "Connexion matricule + email + mot de passe",
          laneLabel: "Élève · Auth · Prisma",
          steps: [
            "Accéder à /auth/login",
            "Saisir identifiants",
            "Contrôler rôle ELEVE et email en Prisma",
            "Ouvrir session Supabase Auth",
            "Journaliser LOGIN et rediriger /dashboard",
          ],
        }),
    },
    {
      file: "act-uc-03-consultation-publique",
      build: () =>
        buildLinearFlow({
          title: "Activité UC-03 — Consultation publique",
          subtitle: "QR ou matricule — lecture seule, rate-limit IP",
          laneLabel: "Visiteur · API publique",
          steps: [
            "Saisir matricule (/consultation ou landing)",
            "Appliquer rate-limit par IP",
            "Rechercher élève en base",
            {
              type: "decision",
              label: "Compte activé ?",
              yes: "Afficher statuts documents (hors duplicatas)",
              no: "Afficher prénom + lien activation",
            },
          ],
        }),
    },
    {
      file: "act-uc-02-mes-documents",
      build: () =>
        buildLinearFlow({
          title: "Activité UC-02 — Consulter Mes documents",
          subtitle: "Espace connecté — statuts et routage centre/antenne",
          laneLabel: "Élève · Routage documentaire",
          steps: [
            "Ouvrir /dashboard/documents",
            "Charger documents et examens validés",
            "Calculer routage OBC/DECC par document",
            "Afficher cartes par diplôme et actions possibles",
          ],
        }),
    },
    {
      file: "act-uc-04-demande-releve",
      build: () =>
        buildLinearFlow({
          title: "Activité UC-04 — Demander relevé ou diplôme",
          subtitle: "Enregistrement demandeSoumiseAt — statut Pas disponible",
          laneLabel: "Élève · Administration",
          steps: [
            "Choisir examen et type de document",
            "Vérifier éligibilité et absence de demande existante",
            "Résoudre routage organisme / lieu",
            "Enregistrer demande + notification in-app",
          ],
        }),
    },
    {
      file: "act-uc-06-rdv-retrait",
      build: () =>
        buildLinearFlow({
          title: "Activité UC-06 — Rendez-vous de retrait",
          subtitle: "Prise ou annulation — quota, créneaux, centre uniquement",
          laneLabel: "Élève · Service rendez-vous",
          steps: [
            "Sélectionner document DISPONIBLE (centre)",
            "Charger créneaux disponibles (quota, fériés)",
            "Choisir date et horaire libre",
            "Créer RDV PLANIFIE + notification",
          ],
        }),
    },
    {
      file: "act-uc-07-import-eleves",
      build: () =>
        buildLinearFlow({
          title: "Activité UC-07 — Import élèves (Import B)",
          subtitle: "CSV — création matricules et documents initiaux",
          laneLabel: "Administrateur OBC/DECC",
          steps: [
            "Connexion portail admin",
            "Téléverser CSV Import B",
            "Valider périmètre organisme / région",
            "UPSERT élève, examen, documents PAS_DISPONIBLE",
            "Afficher rapport ligne par ligne",
          ],
        }),
    },
    {
      file: "act-uc-09-maj-statut",
      build: () =>
        buildLinearFlow({
          title: "Activité UC-09 — Mettre à jour statut document",
          subtitle: "Action unitaire depuis /admin/documents",
          laneLabel: "Administrateur · Transitions statut",
          steps: [
            "Sélectionner document du périmètre",
            "Choisir nouveau statut (ex. DISPONIBLE, RETIRE)",
            "Vérifier règles duplicata et routage",
            "Appliquer transition + notification + audit",
          ],
        }),
    },
    {
      file: "act-uc-10-valider-duplicata",
      build: () =>
        buildLinearFlow({
          title: "Activité UC-10 — Valider demande duplicata",
          subtitle: "Analyse pièces → dossier VALIDEE",
          laneLabel: "Administrateur antenne",
          steps: [
            "Ouvrir dossier duplicata SOUMISE",
            "Contrôler les pièces obligatoires",
            "Valider ou rejeter chaque pièce",
            "Passer dossier à VALIDEE si complet",
            "Synchroniser document DUPLICATA",
          ],
        }),
    },
    {
      file: "act-uc-auth-admin",
      build: () =>
        buildLinearFlow({
          title: "Activité — Authentifier (admin OBC/DECC)",
          subtitle: "Portail OBC ou DECC — périmètre régional",
          laneLabel: "Administrateur · Auth",
          steps: [
            "Accéder portail OBC ou DECC",
            "Saisir identifiants administrateur",
            "Vérifier rôle ADMINISTRATEUR",
            "Rediriger vers /admin",
          ],
        }),
    },
    {
      file: "act-uc-auth-agent",
      build: () =>
        buildLinearFlow({
          title: "Activité — Authentifier (agent centre)",
          subtitle: "Connexion /auth/login/centre-examen",
          laneLabel: "Agent centre d'examen",
          steps: [
            "Accéder portail centre d'examen",
            "Saisir identifiants agent",
            "Vérifier rôle AGENT_CENTRE_EXAMEN",
            "Rediriger vers /centre-examen",
          ],
        }),
    },
    {
      file: "act-uc-11-consulter-rdv",
      build: () =>
        buildLinearFlow({
          title: "Activité UC-11a — Consulter RDV transmis",
          subtitle: "Liste filtrée par région / centre",
          laneLabel: "Agent centre d'examen",
          steps: [
            "Connexion espace /centre-examen",
            "Charger RDV de la région du centre",
            "Afficher élève, document, créneau, statut",
          ],
        }),
    },
  ];
}

const builders = [
  { file: "act-eleve-parcours-retrait-document", build: buildAct01 },
  { file: "act-eleve-demande-duplicata", build: buildAct02 },
  { file: "act-admin-disponibilisation", build: buildAct03 },
  { file: "act-agent-confirmation-retrait", build: buildAct04 },
  ...buildPerUcActivities(),
];

async function exportDiagram({ file, build }) {
  const svg = build();
  const base = join(OUT_DIR, file);
  writeFileSync(`${base}.svg`, svg);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(`${base}.png`, png);
  console.log(`  ${base}.png`);
}

console.log("Génération diagrammes d'activité (corrigés)…");
for (const def of builders) {
  await exportDiagram(def);
}
console.log(`Terminé : ${builders.length} diagrammes dans ${OUT_DIR}/`);
