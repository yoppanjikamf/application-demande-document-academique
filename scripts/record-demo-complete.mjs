#!/usr/bin/env node
/**
 * Démo COMPLÈTE DR-DOCSCOL — production, tous les cas (~10–15 min).
 *
 * Prérequis :
 *   npm run demo:complete:prepare
 *
 * Usage :
 *   npm run demo:complete:record
 *   DEMO_PAUSE_MS=1200 npm run demo:complete:record
 *
 * Sortie : ~/Vidéos/demo-complete-d-scolcam.webm
 */
import { mkdirSync, readFileSync, renameSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE =
  process.env.DEMO_BASE_URL?.trim() || "https://application-demande-document-academ.vercel.app";
const OUT_DIR = join(homedir(), "Vidéos");
const PAUSE = Number(process.env.DEMO_PAUSE_MS || 1300);
const FIXTURES = join(ROOT, "scripts", "demo-fixtures");
const CSV_OBC_DISPO = join(ROOT, "docs/imports/centre/obc/import-disponibilisation.csv");
const CSV_OBC_AJOUT = join(ROOT, "docs/imports/centre/obc/import-ajout-eleves.csv");
const CSV_DECC_DISPO = join(ROOT, "docs/imports/centre/decc/import-disponibilisation.csv");

loadEnv(join(ROOT, ".env.local"));
loadEnv(join(ROOT, ".env"));

const MATRICULE = process.env.SCREENSHOT_ELEVE_MATRICULE?.trim() || "DEMO2026002";
const ELEVE_EMAIL = process.env.SCREENSHOT_ELEVE_EMAIL?.trim() || "faissayoppanjikam@gmail.com";
const ELEVE_PASSWORD = process.env.DEMO_ELEVE_PASSWORD?.trim() || "DemoSoutenance2026!";

const CREDS = {
  eleve: {
    matricule: MATRICULE,
    email: ELEVE_EMAIL,
    password: ELEVE_PASSWORD,
    loginUrl: "/auth/login",
  },
  adminObc: {
    matricule: "ADM-02-CENTRE",
    email: "admin.centre@example.com",
    password: "AdminCentre2026!",
    loginUrl: "/auth/login/obc",
  },
  adminDecc: {
    matricule: "DECC-02-CENTRE",
    email: "admin.decc.centre@example.com",
    password: "DeccCentre2026!",
    loginUrl: "/auth/login/decc",
  },
  agent: {
    matricule: "AGENT-CE-02-CENTRE",
    email: "agent.centre.centre@example.com",
    password: "AgentCentre2026!",
    loginUrl: "/auth/login/centre-examen",
  },
};

function loadEnv(path) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

async function pause(page, ms = PAUSE) {
  await page.waitForTimeout(ms);
}

async function hideToasts(page) {
  await page.addStyleTag({
    content: ".Toastify, [data-sonner-toaster] { display: none !important; }",
  });
}

async function clearSession(context) {
  await context.clearCookies();
}

const ELEVE_PASSWORDS = [
  process.env.DEMO_ELEVE_PASSWORD?.trim(),
  process.env.SCREENSHOT_ELEVE_PASSWORD?.trim(),
  "DemoSoutenance2026!",
  "DemoScreens2026!",
].filter(Boolean);

async function login(page, creds, retries = 3) {
  const passwords =
    creds.matricule === MATRICULE
      ? [...new Set(ELEVE_PASSWORDS)]
      : [creds.password];

  for (const password of passwords) {
    for (let attempt = 1; attempt <= retries; attempt += 1) {
      await page.goto(`${BASE}${creds.loginUrl}`, { waitUntil: "domcontentloaded" });
      await page.locator('input[name="matricule"]').waitFor({ state: "visible", timeout: 45000 });
      await pause(page, 800);
      await page.locator('input[name="matricule"]').fill(creds.matricule);
      await page.locator('input[name="email"]').fill(creds.email);
      await page.locator('input[name="password"]').fill(password);
      await page.getByRole("button", { name: "Se connecter" }).click();
      try {
        await page.waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 120000 });
        await pause(page, PAUSE * 0.6);
        return;
      } catch (error) {
        if (attempt < retries) {
          console.warn(`  ↻ Connexion ${creds.matricule} — essai ${attempt}/${retries}`);
          await pause(page, 2000);
          continue;
        }
        if (password !== passwords.at(-1)) break;
        throw error;
      }
    }
  }
}

async function activateOrLogin(page) {
  await page.goto(`${BASE}/auth/register`, { waitUntil: "domcontentloaded" });
  await pause(page, PAUSE * 0.8);
  await page.locator('input[name="matricule"]').fill(MATRICULE);
  await page.locator('input[name="email"]').fill(ELEVE_EMAIL);
  await page.locator('input[name="password"]').fill(ELEVE_PASSWORD);
  await page.locator('input[name="confirmPassword"]').fill(ELEVE_PASSWORD);
  await page.getByRole("button", { name: "Activer mon compte" }).click();
  try {
    await page.waitForURL((url) => url.pathname.includes("/dashboard"), { timeout: 120000 });
    await pause(page, PAUSE * 1.2);
    return;
  } catch {
    console.warn("  ↻ Compte déjà activé — connexion élève");
    await login(page, CREDS.eleve);
  }
}

async function flash(page, url, hold = PAUSE) {
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded" });
  await pause(page, hold);
}

async function scrollLanding(page) {
  const anchors = ["#features", "#consultation", "#steps", "#access", "#faq"];
  for (const anchor of anchors) {
    await page.locator(`a[href="${anchor}"]`).first().click().catch(() => {});
    await pause(page, PAUSE * 0.7);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await pause(page, PAUSE * 0.5);
}

async function runAct(label, fn) {
  console.log(`  ${label}`);
  try {
    await fn();
  } catch (error) {
    console.warn(`  ⚠ ${label}: ${error instanceof Error ? error.message : error}`);
  }
}

/** ACTE 1 — Landing DR-DOCSCOL (production) */
async function acte1Landing(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await pause(page, PAUSE * 1.5);
  const enBtn = page.getByRole("button", { name: "EN", exact: true });
  if (await enBtn.isVisible().catch(() => false)) {
    await enBtn.click();
    await pause(page, PAUSE * 0.6);
    await page.getByRole("button", { name: "FR", exact: true }).click();
    await pause(page, PAUSE * 0.4);
  }
  await scrollLanding(page);
}

/** ACTE 2 — Consultation rapide (avant activation) */
async function acte2Consultation(page) {
  await flash(page, "/consultation", PAUSE);
  await page.locator("#consultation-matricule").fill(MATRICULE);
  await page.getByRole("button", { name: /Consulter|Rechercher|Search/i }).click();
  await pause(page, PAUSE * 1.2);
}

/** ACTE 3 — Activation compte élève (première visite) */
async function acte3Activation(page) {
  await activateOrLogin(page);
}

/** ACTE 4 — Parcours élève complet */
async function acte4EleveTour(page) {
  const routes = [
    "/dashboard",
    "/dashboard/documents",
    "/dashboard/documents?exam=BEPC",
    "/dashboard/documents?exam=PROBATOIRE",
    "/dashboard/documents?exam=BACCALAUREAT",
    "/dashboard/rendez-vous",
    "/dashboard/notifications",
    "/dashboard/payments",
    "/account",
  ];
  for (const route of routes) {
    await flash(page, route, PAUSE * 0.7);
  }
}

/** ACTE 5 — Élève : demandes relevé + diplôme */
async function acte5EleveDemandes(page) {
  await flash(page, "/dashboard/documents?exam=BACCALAUREAT", PAUSE * 0.8);
  for (const label of ["Faire une demande"]) {
    const btn = page.getByRole("button", { name: label }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
      await pause(page, PAUSE);
    }
  }
  const originalBtn = page.getByRole("button", { name: "Faire une demande" }).first();
  if (await originalBtn.isVisible().catch(() => false)) {
    await originalBtn.click();
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await pause(page, PAUSE);
  }
  await flash(page, "/dashboard/notifications", PAUSE);
}

/** ACTE 6 — Admin OBC : tous les écrans */
async function acte6AdminObcTour(page) {
  const routes = [
    "/admin",
    "/admin/documents",
    "/admin/students",
    "/admin/payments",
    "/admin/appointments",
    "/admin/rdv-disponibilites",
    "/admin/audit-logs",
  ];
  for (const route of routes) {
    await flash(page, route, PAUSE * 0.8);
  }
}

/** ACTE 7 — Admin DECC : aperçu complet */
async function acte7AdminDeccTour(page) {
  const routes = ["/admin", "/admin/documents", "/admin/students", "/admin/payments"];
  for (const route of routes) {
    await flash(page, route, PAUSE * 0.8);
  }
}

/** ACTE 8 — Admin OBC : demande élève + changement statut */
async function acte8AdminObcStatut(page) {
  await flash(page, "/admin/documents", PAUSE);
  const row = page.locator("div.border-b").filter({ hasText: MATRICULE }).first();
  if (await row.isVisible().catch(() => false)) {
    await row.scrollIntoViewIfNeeded();
    const form = row.locator("form").first();
    await form.locator('select[name="statut"]').selectOption("DISPONIBLE");
    await form.getByRole("button", { name: "Modifier" }).click();
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await pause(page, PAUSE * 1.2);
  }
}

/** ACTe 9 — Admin OBC : imports CSV + ajout manuel */
async function acte9AdminObcImports(page, context) {
  await clearSession(context);
  await login(page, CREDS.adminObc);
  await flash(page, "/admin/students", PAUSE * 1.5);

  const onStudents = page.url().includes("/admin/students");
  if (!onStudents) {
    console.warn("  ⚠ Pas sur /admin/students — imports ignorés");
    return;
  }

  await page.getByRole("heading", { name: /Disponibilisation|Import élèves|Élèves/i }).first()
    .scrollIntoViewIfNeeded().catch(() => {});

  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  if (count >= 1) {
    await fileInputs.first().setInputFiles(CSV_OBC_DISPO);
    await pause(page, 500);
    await page.getByRole("button", { name: "Importer et disponibiliser" }).click();
    await pause(page, PAUSE * 2.5);
    await flash(page, "/admin/students", PAUSE);
  }

  const filesAfter = page.locator('input[type="file"]');
  if ((await filesAfter.count()) >= 2) {
    await filesAfter.nth(1).setInputFiles(CSV_OBC_AJOUT);
  } else if ((await filesAfter.count()) === 1) {
    await filesAfter.first().setInputFiles(CSV_OBC_AJOUT);
  }
  if (await page.getByRole("button", { name: "Importer le fichier" }).isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "Importer le fichier" }).click();
    await pause(page, PAUSE * 2.5);
  }

  const manualMatricule = `DEMO${Date.now().toString().slice(-6)}`;
  if (await page.locator("#manual-matricule").isVisible().catch(() => false)) {
    await page.locator("#manual-matricule").scrollIntoViewIfNeeded();
    await page.locator("#manual-matricule").fill(manualMatricule);
    await page.locator("#manual-email").fill(`${manualMatricule.toLowerCase()}@facsciences-uy1.cm`);
    await page.locator("#manual-nom").fill("MANUEL");
    await page.locator("#manual-prenom").fill("Demo");
    await page.locator("#manual-dateNaissance").fill("2005-01-15");
    await page.locator("#manual-centreExamen").fill("Centre d'examen Centre");
    await page.getByRole("button", { name: "Enregistrer l'élève" }).click();
    await pause(page, PAUSE * 1.5);
  }
}

/** ACTE 10 — Admin DECC : import disponibilisation BEPC */
async function acte10AdminDeccImport(page) {
  await flash(page, "/admin/students", PAUSE * 1.2);
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.isVisible().catch(() => false)) {
    await fileInput.setInputFiles(CSV_DECC_DISPO);
    await page.getByRole("button", { name: "Importer et disponibiliser" }).click();
    await pause(page, PAUSE * 2.5);
  }
}

/** ACTE 11 — Élève : document disponible + RDV relevé */
async function acte11EleveRdv(page) {
  await flash(page, "/dashboard/notifications", PAUSE);
  await flash(page, "/dashboard/documents?exam=BACCALAUREAT", PAUSE);

  const rdvBtn = page.getByRole("button", { name: "Rendez-vous" }).first();
  if (await rdvBtn.isVisible().catch(() => false)) {
    await rdvBtn.scrollIntoViewIfNeeded();
    await rdvBtn.click();
    await pause(page, PAUSE);
    const slot = page.locator('form button[type="button"]').filter({ hasText: /^\d{2}:\d{2}/ }).first();
    if (await slot.isVisible().catch(() => false)) await slot.click();
    await pause(page, PAUSE * 0.5);
    await page.getByRole("button", { name: "Confirmer le rendez-vous" }).click();
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await pause(page, PAUSE * 1.2);
  }
  await flash(page, "/dashboard/rendez-vous", PAUSE);
}

/** ACTE 12 — Élève : demande duplicata + pièces */
async function acte12EleveDuplicata(page) {
  await flash(page, "/dashboard/documents?exam=BACCALAUREAT", PAUSE);
  const detailsBtn = page
    .getByRole("button", { name: "Détails" })
    .filter({ has: page.locator("xpath=ancestor::tr") })
    .last();
  const duplicataDetails = page.getByRole("button", { name: "Détails" }).nth(2);
  const target = (await duplicataDetails.isVisible().catch(() => false))
    ? duplicataDetails
    : page.getByRole("button", { name: "Détails" }).last();
  await target.click();
  await pause(page, PAUSE);

  await page.locator('textarea[name="motif"]').fill(
    "Perte du relevé de notes lors d'un déménagement. Demande de duplicata officiel.",
  );
  for (const piece of [
    "DECLARATION_PERTE",
    "CNI",
    "DEMANDE_ADRESSEE_DG_OBC",
    "DECHARGE_BORDEREAU_REUSSITE",
  ]) {
    await page.locator(`input[name="${piece}"]`).setInputFiles(join(FIXTURES, `${piece}.png`));
  }
  await page.getByRole("button", { name: /Valider et payer/i }).click();
  await page.waitForLoadState("networkidle", { timeout: 120000 }).catch(() => {});
  await pause(page, PAUSE * 1.5);
  await page.keyboard.press("Escape").catch(() => {});
}

/** ACTE 13 — Admin OBC : validation duplicata */
async function acte13AdminObcDuplicata(page) {
  await flash(page, "/admin/documents", PAUSE);
  const duplicataSection = page.locator("div").filter({ hasText: /Duplicata|SOUMISE|EN_ANALYSE/i }).first();
  if (await duplicataSection.isVisible().catch(() => false)) {
    await duplicataSection.scrollIntoViewIfNeeded();
  }

  const pieceForms = page.locator("form").filter({ has: page.locator('input[name="pieceId"]') });
  const count = await pieceForms.count();
  for (let i = 0; i < count; i += 1) {
    const form = pieceForms.nth(i);
    await form.locator('select[name="statut"]').selectOption("VALIDEE");
    await form.getByRole("button", { name: "Enregistrer" }).click();
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await pause(page, PAUSE * 0.6);
  }

  const validateBtn = page.getByRole("button", { name: "Valider le dossier" });
  if (await validateBtn.isEnabled().catch(() => false)) {
    await validateBtn.click();
    await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
    await pause(page, PAUSE * 1.2);
  }

  const row = page.locator("div.border-b").filter({ hasText: MATRICULE }).filter({ hasText: /Duplicata/i }).first();
  if (await row.isVisible().catch(() => false)) {
    const form = row.locator("form").first();
    await form.locator('select[name="statut"]').selectOption("DISPONIBLE").catch(() => {});
    await form.getByRole("button", { name: "Modifier" }).click().catch(() => {});
    await pause(page, PAUSE);
  }
}

/** ACTE 14 — Élève : notifications + consultation après activation */
async function acte14ElevePostDuplicata(page) {
  await flash(page, "/dashboard/notifications", PAUSE);
  await flash(page, "/consultation", PAUSE * 0.8);
  await page.locator("#consultation-matricule").fill(MATRICULE);
  await page.getByRole("button", { name: /Consulter|Rechercher|Search/i }).click();
  await pause(page, PAUSE * 1.2);
}

/** ACTE 15 — Agent : RDV + confirmation retrait */
async function acte15Agent(page) {
  await flash(page, "/centre-examen", PAUSE);
  await page.getByRole("button", { name: "À venir" }).click().catch(() => {});
  await pause(page, PAUSE * 0.6);
  const confirmBtn = page.getByRole("button", { name: "Confirmer retrait" }).first();
  if (await confirmBtn.isVisible().catch(() => false)) {
    await confirmBtn.scrollIntoViewIfNeeded();
    await confirmBtn.click();
    await pause(page, PAUSE * 0.6);
    await page.getByRole("button", { name: "Confirmer", exact: true }).click();
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await pause(page, PAUSE * 1.2);
  }
}

/** ACTE 16 — Élève : document retiré + clôture landing */
async function acte16Cloture(page) {
  await flash(page, "/dashboard/documents?exam=BACCALAUREAT", PAUSE * 1.2);
  await flash(page, "/dashboard/notifications", PAUSE);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await pause(page, PAUSE * 1.5);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const health = await fetch(BASE).catch(() => null);
  if (!health || health.status >= 500) {
    throw new Error(`Application inaccessible sur ${BASE}`);
  }

  console.log(`Enregistrement démo COMPLÈTE sur ${BASE}`);
  console.log(`Pause entre écrans : ${PAUSE} ms\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: "fr-FR",
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  await hideToasts(page);

  const started = Date.now();

  await runAct("Acte 1 — Landing DR-DOCSCOL", () => acte1Landing(page));
  await runAct("Acte 2 — Consultation rapide", () => acte2Consultation(page));
  await runAct("Acte 3 — Activation compte élève", () => acte3Activation(page));
  await runAct("Acte 4 — Parcours élève (tous écrans)", () => acte4EleveTour(page));
  await runAct("Acte 5 — Demandes relevé / diplôme", () => acte5EleveDemandes(page));

  await clearSession(context);
  await login(page, CREDS.adminObc);
  await runAct("Acte 6 — Admin OBC (tous écrans)", () => acte6AdminObcTour(page));

  await clearSession(context);
  await login(page, CREDS.adminDecc);
  await runAct("Acte 7 — Admin DECC (tous écrans)", () => acte7AdminDeccTour(page));

  await clearSession(context);
  await login(page, CREDS.adminObc);
  await runAct("Acte 8 — Admin OBC : statut document", () => acte8AdminObcStatut(page));
  await runAct("Acte 9 — Admin OBC : imports + manuel", () => acte9AdminObcImports(page, context));

  await clearSession(context);
  await login(page, CREDS.adminDecc);
  await runAct("Acte 10 — Admin DECC : import", () => acte10AdminDeccImport(page));

  await clearSession(context);
  await login(page, CREDS.eleve);
  await runAct("Acte 11 — Élève : RDV relevé", () => acte11EleveRdv(page));
  await runAct("Acte 12 — Élève : duplicata + pièces", () => acte12EleveDuplicata(page));

  await clearSession(context);
  await login(page, CREDS.adminObc);
  await runAct("Acte 13 — Admin OBC : validation duplicata", () => acte13AdminObcDuplicata(page));

  await clearSession(context);
  await login(page, CREDS.eleve);
  await runAct("Acte 14 — Élève : notifications + consultation", () => acte14ElevePostDuplicata(page));

  await clearSession(context);
  await login(page, CREDS.agent);
  await runAct("Acte 15 — Agent : confirmation retrait", () => acte15Agent(page));

  await clearSession(context);
  await login(page, CREDS.eleve);
  await runAct("Acte 16 — Clôture", () => acte16Cloture(page));

  const video = page.video();
  await context.close();
  await browser.close();
  const rawPath = await video.path();
  const finalPath = join(OUT_DIR, "demo-complete-d-scolcam.webm");
  renameSync(rawPath, finalPath);
  const durationSec = Math.round((Date.now() - started) / 1000);
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  console.log(`\n✓ Vidéo : ${finalPath}`);
  console.log(`  Durée : ~${minutes} min ${seconds} s`);
  console.log(`  Site : ${BASE}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
