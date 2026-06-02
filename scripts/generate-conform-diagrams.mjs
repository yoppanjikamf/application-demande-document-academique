import { writeFileSync } from "node:fs";
import sharp from "sharp";

const blue = "#5f839e";
const border = "#d6dce2";
const line = "#8d98a5";
const text = "#1f2937";

const tables = [
  {
    name: "ORGANISMES",
    x: 80,
    y: 80,
    w: 360,
    fields: ["PK id", "nom UNIQUE", "createdAt", "updatedAt"],
  },
  {
    name: "ANTENNES_REGIONALES",
    x: 80,
    y: 330,
    w: 360,
    fields: [
      "PK id",
      "nom",
      "region",
      "ville",
      "accessKey",
      "FK organismeId",
      "createdAt",
      "updatedAt",
      "UNIQUE organismeId + region",
    ],
  },
  {
    name: "CENTRES_EXAMEN",
    x: 80,
    y: 700,
    w: 360,
    fields: ["PK id", "nom", "region UNIQUE", "ville", "createdAt", "updatedAt"],
  },
  {
    name: "PARAMETRES_RENDEZ_VOUS",
    x: 80,
    y: 990,
    w: 360,
    fields: [
      "PK id",
      "quotaJournalier",
      "lieuObc",
      "allowWeekendBookings",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    name: "CRENEAUX_HORAIRES",
    x: 80,
    y: 1280,
    w: 360,
    fields: ["PK id", "heureDebut", "heureFin", "actif", "createdAt", "updatedAt", "UNIQUE heureDebut + heureFin"],
  },
  {
    name: "JOURS_FERIES",
    x: 80,
    y: 1570,
    w: 360,
    fields: ["PK id", "date UNIQUE", "nom", "annuel", "createdAt", "updatedAt"],
  },
  {
    name: "USERS",
    x: 720,
    y: 80,
    w: 390,
    fields: [
      "PK id",
      "authUserId UNIQUE",
      "role",
      "email UNIQUE",
      "matricule UNIQUE",
      "nom",
      "prenom",
      "dateCreation",
      "derniereConnexion",
      "dateNaissance",
      "nomService",
      "maxRdvParJour",
      "FK organismeId",
      "FK antenneRegionaleId",
      "FK centreExamenId",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    name: "EXAMENS_VALIDES",
    x: 720,
    y: 660,
    w: 390,
    fields: [
      "PK id",
      "diplomeType",
      "anneeSession",
      "centreExamen",
      "regionComposition",
      "FK eleveId",
      "createdAt",
      "updatedAt",
      "UNIQUE eleveId + diplomeType",
    ],
  },
  {
    name: "NOTIFICATIONS",
    x: 720,
    y: 1030,
    w: 390,
    fields: ["PK id", "typeNotification", "statut", "message", "dateEnvoi", "FK userId", "createdAt", "updatedAt"],
  },
  {
    name: "MAIL_LOGS",
    x: 720,
    y: 1370,
    w: 390,
    fields: ["PK id", "to", "subject", "status", "error", "FK userId", "createdAt"],
  },
  {
    name: "AUDIT_LOGS",
    x: 720,
    y: 1670,
    w: 390,
    fields: ["PK id", "action", "resource", "resourceId", "details", "ipAddress", "FK userId", "createdAt"],
  },
  {
    name: "DOCUMENTS",
    x: 1410,
    y: 80,
    w: 430,
    fields: [
      "PK id",
      "typeDocument",
      "diplomeType",
      "statut",
      "centreExamen",
      "regionComposition",
      "FK eleveId",
      "FK organismeId",
      "FK antenneRegionaleId",
      "FK paiementId",
      "FK releveId",
      "FK diplomeId",
      "createdAt",
      "updatedAt",
      "UNIQUE eleveId + diplomeType + typeDocument",
    ],
  },
  {
    name: "DUPLICATAS",
    x: 1410,
    y: 610,
    w: 430,
    fields: [
      "PK id",
      "typeDocument",
      "nomDuplicata",
      "statut",
      "intruction",
      "regionComposition",
      "FK eleveId",
      "FK organismeId",
      "FK antenneRegionaleId",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    name: "RENDEZ_VOUS",
    x: 1410,
    y: 1040,
    w: 430,
    fields: [
      "PK id",
      "dateRdv",
      "heureRdv",
      "lieu",
      "statut",
      "commentaire",
      "FK adminId",
      "FK eleveId",
      "FK disponibiliteId UNIQUE",
      "FK documentId",
      "retraitConfirmeAt",
      "FK retraitConfirmeParId",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    name: "DISPONIBILITES_RDV",
    x: 1410,
    y: 1550,
    w: 430,
    fields: ["PK id", "dateRdv", "heureRdv", "lieu", "statut", "FK adminId", "createdAt", "updatedAt"],
  },
  {
    name: "PAIEMENTS",
    x: 2180,
    y: 120,
    w: 390,
    fields: ["PK id", "statut", "modePaiment", "FK duplicataId UNIQUE", "FK documentAcademiqueId UNIQUE", "createdAt", "updatedAt"],
  },
  {
    name: "RELEVES",
    x: 2180,
    y: 460,
    w: 390,
    fields: ["PK id", "nomReleve", "statut", "instruction", "FK duplicataId UNIQUE", "FK documentAcademiqueId UNIQUE", "createdAt", "updatedAt"],
  },
  {
    name: "DIPLOMES",
    x: 2180,
    y: 810,
    w: 390,
    fields: ["PK id", "nomDiplome", "statut", "instruction", "FK duplicataId UNIQUE", "FK documentAcademiqueId UNIQUE", "createdAt", "updatedAt"],
  },
  {
    name: "RECUS",
    x: 2180,
    y: 1160,
    w: 390,
    fields: ["PK id", "numero UNIQUE", "montant", "dateEmission", "modePaiement", "commentaire", "FK userId", "FK paiementId", "createdAt", "updatedAt"],
  },
];

const tableByName = new Map(tables.map((table) => [table.name, table]));

function tableHeight(table) {
  return 44 + table.fields.length * 24 + 16;
}

function escape(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function tableSvg(table, className = "table") {
  const h = tableHeight(table);
  return `<g id="${table.name}" transform="translate(${table.x} ${table.y})">
    <rect class="${className}" width="${table.w}" height="${h}"/>
    <rect class="header" width="${table.w}" height="38"/>
    <text class="title" x="${table.w / 2}" y="25">${table.name}</text>
    ${table.fields
      .map((field, index) => {
        const isKey = field.startsWith("PK") || field.includes("FK") || field.includes("UNIQUE");
        return `<text class="${isKey ? "field key" : "field"}" x="16" y="${66 + index * 24}">${escape(field)}</text>`;
      })
      .join("\n")}
  </g>`;
}

function anchor(tableName, side, offset = 0) {
  const table = tableByName.get(tableName);
  const h = tableHeight(table);
  if (side === "right") return { x: table.x + table.w, y: table.y + h / 2 + offset };
  if (side === "left") return { x: table.x, y: table.y + h / 2 + offset };
  if (side === "top") return { x: table.x + table.w / 2 + offset, y: table.y };
  return { x: table.x + table.w / 2 + offset, y: table.y + h };
}

function relation(from, fromSide, to, toSide, label, fromOffset = 0, toOffset = 0) {
  const a = anchor(from, fromSide, fromOffset);
  const b = anchor(to, toSide, toOffset);
  const midX = Math.round((a.x + b.x) / 2);
  const midY = Math.round((a.y + b.y) / 2);
  const d =
    fromSide === "right" || fromSide === "left"
      ? `M${a.x} ${a.y} H${midX} V${b.y} H${b.x}`
      : `M${a.x} ${a.y} V${midY} H${b.x} V${b.y}`;
  return `<path class="line" d="${d}"/><text class="relLabel" x="${midX + 8}" y="${midY - 8}">${escape(label)}</text>`;
}

const relations = [
  ["ORGANISMES", "bottom", "ANTENNES_REGIONALES", "top", "organismeId"],
  ["ORGANISMES", "right", "USERS", "left", "organismeId", -30, -70],
  ["ORGANISMES", "right", "DOCUMENTS", "left", "organismeId", 0, -120],
  ["ORGANISMES", "right", "DUPLICATAS", "left", "organismeId", 30, -100],
  ["ANTENNES_REGIONALES", "right", "USERS", "left", "antenneRegionaleId", -20, -20],
  ["ANTENNES_REGIONALES", "right", "DOCUMENTS", "left", "antenneRegionaleId", 20, -60],
  ["ANTENNES_REGIONALES", "right", "DUPLICATAS", "left", "antenneRegionaleId", 55, -40],
  ["CENTRES_EXAMEN", "right", "USERS", "left", "centreExamenId", 0, 70],
  ["USERS", "bottom", "EXAMENS_VALIDES", "top", "eleveId", -110, -80],
  ["USERS", "right", "DOCUMENTS", "left", "eleveId", -70, 0],
  ["USERS", "right", "DUPLICATAS", "left", "eleveId", 0, 50],
  ["USERS", "right", "RENDEZ_VOUS", "left", "adminId / eleveId", 80, -90],
  ["USERS", "right", "DISPONIBILITES_RDV", "left", "adminId", 130, -30],
  ["USERS", "bottom", "NOTIFICATIONS", "top", "userId", -30, -100],
  ["USERS", "bottom", "MAIL_LOGS", "top", "userId", 30, -70],
  ["USERS", "bottom", "AUDIT_LOGS", "top", "userId", 90, -40],
  ["USERS", "right", "RECUS", "left", "userId", 280, 70],
  ["DOCUMENTS", "right", "PAIEMENTS", "left", "documentAcademiqueId", -90, -30],
  ["DOCUMENTS", "right", "RELEVES", "left", "documentAcademiqueId", -30, -30],
  ["DOCUMENTS", "right", "DIPLOMES", "left", "documentAcademiqueId", 30, -30],
  ["DOCUMENTS", "bottom", "RENDEZ_VOUS", "top", "documentId", -100, -90],
  ["DUPLICATAS", "right", "PAIEMENTS", "left", "duplicataId", -80, 30],
  ["DUPLICATAS", "right", "RELEVES", "left", "duplicataId", 0, 30],
  ["DUPLICATAS", "right", "DIPLOMES", "left", "duplicataId", 80, 30],
  ["PAIEMENTS", "bottom", "RECUS", "top", "paiementId", 0, 0],
  ["RENDEZ_VOUS", "bottom", "DISPONIBILITES_RDV", "top", "disponibiliteId", 80, 0],
];

function baseStyles() {
  return `<defs>
    <style>
      .canvas { fill: #fff; }
      .table,.entity { fill: #fff; stroke: ${border}; stroke-width: 2; }
      .header { fill: ${blue}; }
      .line { stroke: ${line}; stroke-width: 2; fill: none; }
      .assoc { fill: ${blue}; stroke: ${border}; stroke-width: 2; }
      .title { fill: ${text}; font: 700 18px Arial, sans-serif; text-anchor: middle; }
      .field { fill: ${text}; font: 15px Arial, sans-serif; }
      .key { font-weight: 700; }
      .caption { fill: ${text}; font: 700 32px Arial, sans-serif; text-anchor: middle; }
      .relLabel { fill: #374151; font: 13px Arial, sans-serif; }
      .card { fill: #374151; font: 13px Arial, sans-serif; }
      .assocText { fill: ${text}; font: 15px Arial, sans-serif; text-anchor: middle; }
    </style>
  </defs>`;
}

function generateMld() {
  const width = 2680;
  const height = 1960;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${baseStyles()}
    <rect class="canvas" width="${width}" height="${height}"/>
    <text class="caption" x="${width / 2}" y="44">MLD detaille - DR-DOCSCOL</text>
    ${relations.map((item) => relation(...item)).join("\n")}
    ${tables.map((table) => tableSvg(table)).join("\n")}
  </svg>`;
}

function assocSvg(x, y, label) {
  return `<ellipse class="assoc" cx="${x}" cy="${y}" rx="92" ry="46"/><text class="assocText" x="${x}" y="${y + 5}">${label}</text>`;
}

function mcdRelation(from, fromSide, assocX, assocY, to, toSide, labelA, labelB) {
  const a = anchor(from, fromSide);
  const b = anchor(to, toSide);
  return `<path class="line" d="M${a.x} ${a.y} H${assocX} V${assocY}"/>
    <path class="line" d="M${assocX} ${assocY} H${b.x} V${b.y}"/>
    <text class="card" x="${a.x + (assocX > a.x ? 12 : -28)}" y="${a.y - 8}">${labelA}</text>
    <text class="card" x="${b.x + (assocX > b.x ? 12 : -28)}" y="${b.y - 8}">${labelB}</text>`;
}

function generateMcd() {
  const width = 2680;
  const height = 1960;
  const mcdRelations = [
    ["ORGANISMES", "right", 585, 420, "ANTENNES_REGIONALES", "right", "1,1", "1,n", "possede"],
    ["ORGANISMES", "right", 580, 170, "USERS", "left", "0,1", "1,n", "rattache"],
    ["ANTENNES_REGIONALES", "right", 580, 540, "USERS", "left", "0,1", "1,n", "rattache"],
    ["CENTRES_EXAMEN", "right", 580, 780, "USERS", "left", "0,1", "1,n", "affecte"],
    ["USERS", "right", 1250, 280, "DOCUMENTS", "left", "1,1", "1,n", "demander"],
    ["USERS", "right", 1250, 705, "DUPLICATAS", "left", "1,1", "1,n", "demander"],
    ["USERS", "right", 1250, 1040, "RENDEZ_VOUS", "left", "1,1", "1,n", "prendre"],
    ["DOCUMENTS", "right", 2005, 255, "PAIEMENTS", "left", "0,1", "0,1", "peut-etre"],
    ["DOCUMENTS", "right", 2005, 520, "RELEVES", "left", "0,1", "0,1", "peut-etre"],
    ["DOCUMENTS", "right", 2005, 870, "DIPLOMES", "left", "0,1", "0,1", "peut-etre"],
    ["DUPLICATAS", "right", 2005, 700, "PAIEMENTS", "left", "1,1", "1,1", "payer"],
    ["DUPLICATAS", "right", 2005, 610, "RELEVES", "left", "0,1", "0,1", "peut-etre"],
    ["DUPLICATAS", "right", 2005, 930, "DIPLOMES", "left", "0,1", "0,1", "peut-etre"],
    ["PAIEMENTS", "bottom", 2370, 1080, "RECUS", "top", "1,1", "1,n", "produire"],
    ["DOCUMENTS", "bottom", 1610, 980, "RENDEZ_VOUS", "top", "1,1", "0,n", "concerner"],
    ["USERS", "right", 1250, 815, "NOTIFICATIONS", "left", "1,1", "0,n", "recevoir"],
    ["USERS", "right", 1250, 1200, "MAIL_LOGS", "left", "0,1", "0,n", "journaliser"],
    ["USERS", "right", 1250, 1500, "AUDIT_LOGS", "left", "0,1", "0,n", "tracer"],
    ["USERS", "right", 1250, 610, "EXAMENS_VALIDES", "left", "1,1", "0,n", "composer"],
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${baseStyles()}
    <rect class="canvas" width="${width}" height="${height}"/>
    <text class="caption" x="${width / 2}" y="44">MCD detaille - DR-DOCSCOL</text>
    ${mcdRelations.map((item) => mcdRelation(...item.slice(0, 8))).join("\n")}
    ${mcdRelations.map((item) => assocSvg(item[2], item[3], item[8])).join("\n")}
    ${tables.map((table) => tableSvg(table, "entity")).join("\n")}
  </svg>`;
}

function generateClasses() {
  const width = 2680;
  const height = 1960;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${baseStyles()}
    <rect class="canvas" width="${width}" height="${height}"/>
    <text class="caption" x="${width / 2}" y="44">Diagramme de classes detaille - DR-DOCSCOL</text>
    ${relations.slice(0, 22).map((item) => relation(...item)).join("\n")}
    ${tables.map((table) => tableSvg({ ...table, name: table.name.replaceAll("_", " ") }, "table")).join("\n")}
  </svg>`;
}

function generateCombined() {
  const width = 1800;
  const height = 1050;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${baseStyles()}
    <rect class="canvas" width="${width}" height="${height}"/>
    <text class="caption" x="${width / 2}" y="44">MCD / MLD - DR-DOCSCOL</text>
    <text class="field" x="120" y="100">Les versions detaillees conformes sont separees pour garder tous les attributs lisibles.</text>
    <text class="field key" x="120" y="145">MCD : docs/diagrammes-images/diagramme-mcd-v2.svg</text>
    <text class="field key" x="120" y="175">MLD : docs/diagrammes-images/diagramme-mld-v2.svg</text>
    <text class="field key" x="120" y="205">Classes : docs/diagrammes-images/diagramme-classes-v2.svg</text>
    <g transform="translate(130 260) scale(0.48)">
      ${tables.slice(0, 8).map((table) => tableSvg(table, "entity")).join("\n")}
    </g>
    <g transform="translate(950 260) scale(0.48)">
      ${tables.slice(8, 16).map((table) => tableSvg(table, "table")).join("\n")}
    </g>
  </svg>`;
}

async function writeSvgAndPng(path, svg) {
  writeFileSync(path, svg);
  await sharp(Buffer.from(svg)).png().toFile(path.replace(/\.svg$/, ".png"));
}

await writeSvgAndPng("docs/diagrammes-images/diagramme-mld-v2.svg", generateMld());
await writeSvgAndPng("docs/diagrammes-images/diagramme-mcd-v2.svg", generateMcd());
await writeSvgAndPng("docs/diagrammes-images/diagramme-classes-v2.svg", generateClasses());
await writeSvgAndPng("docs/diagrammes-images/diagramme-mcd-mld-v2.svg", generateCombined());
