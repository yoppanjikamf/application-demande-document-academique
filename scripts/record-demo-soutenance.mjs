#!/usr/bin/env node
/**
 * Démo soutenance DR-DOCSCOL — 3 à 5 minutes, cas réels (RDV + confirmation agent).
 *
 * Prérequis :
 *   npm run dev
 *   npm run demo:prepare
 *
 * Usage :
 *   npm run demo:record
 *   DEMO_PAUSE_MS=900 npm run demo:record   # plus rapide (~3 min)
 *   DEMO_PAUSE_MS=1400 npm run demo:record  # plus lent (~5 min)
 *
 * Sortie : ~/Vidéos/demo-soutenance-d-scolcam.webm
 */
import { mkdirSync, readFileSync, renameSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE = process.env.DEMO_BASE_URL?.trim() || "http://localhost:3000";
const OUT_DIR = join(homedir(), "Vidéos");
const PAUSE = Number(process.env.DEMO_PAUSE_MS || 900);
const MATRICULE = process.env.SCREENSHOT_ELEVE_MATRICULE?.trim() || "DEMO2026002";

loadEnv(join(ROOT, ".env.local"));
loadEnv(join(ROOT, ".env"));

const CREDS = {
  eleve: {
    matricule: MATRICULE,
    email: process.env.SCREENSHOT_ELEVE_EMAIL?.trim() || "faissayoppanjikam@gmail.com",
    password: process.env.SCREENSHOT_ELEVE_PASSWORD?.trim() || "DemoScreens2026!",
    loginUrl: "/auth/login",
  },
  admin: {
    matricule: "ADM-02-CENTRE",
    email: "admin.centre@example.com",
    password: "AdminCentre2026!",
    loginUrl: "/auth/login/obc",
  },
  decc: {
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

async function login(page, creds, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    await page.goto(`${BASE}${creds.loginUrl}`, { waitUntil: "networkidle" });
    await page.locator('input[name="matricule"]').waitFor({ state: "visible" });
    await pause(page, 600);
    await page.locator('input[name="matricule"]').fill(creds.matricule);
    await page.locator('input[name="email"]').fill(creds.email);
    await page.locator('input[name="password"]').fill(creds.password);
    const submit = page.getByRole("button", { name: "Se connecter" });
    await submit.click();
    try {
      await page.waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 45000 });
      await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
      await pause(page, PAUSE * 0.5);
      return;
    } catch (error) {
      const stuckOnLogin = page.url().includes("/auth/login");
      if (stuckOnLogin && attempt < retries) {
        console.warn(`  ↻ Connexion ${creds.matricule} — nouvel essai (${attempt}/${retries})`);
        await pause(page, 1200);
        continue;
      }
      throw error;
    }
  }
}

async function clearSession(context) {
  await context.clearCookies();
}

async function flash(page, url, hold = PAUSE) {
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await pause(page, hold);
}

/** ── ACTE 1 : Landing + langues + pages connexion (~25 s) ── */
async function acte1Landing(page) {
  console.log("  Acte 1 — Landing");
  await flash(page, "/", PAUSE * 1.2);
  const enBtn = page.getByRole("button", { name: "EN", exact: true });
  if (await enBtn.isVisible().catch(() => false)) {
    await enBtn.click();
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await pause(page, PAUSE * 0.8);
    await page.getByRole("button", { name: "FR", exact: true }).click().catch(() => {});
    await pause(page, PAUSE * 0.5);
  }
  await flash(page, "/auth/login", PAUSE * 0.5);
  await flash(page, "/auth/login/obc", PAUSE * 0.4);
  await flash(page, "/auth/login/decc", PAUSE * 0.4);
  await flash(page, "/auth/login/centre-examen", PAUSE * 0.4);
}

/** ── ACTE 2 : Élève — demande relevé (~35 s) ── */
async function acte2EleveDemande(page, context) {
  console.log("  Acte 2 — Élève : demande relevé");
  await clearSession(context);
  await login(page, CREDS.eleve);
  await flash(page, "/dashboard", PAUSE * 0.8);
  await flash(page, "/dashboard/documents", PAUSE * 0.6);

  const demandeBtn = page.getByRole("button", { name: "Faire une demande" }).first();
  if (await demandeBtn.isVisible().catch(() => false)) {
    await demandeBtn.scrollIntoViewIfNeeded();
    await demandeBtn.click();
    await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
    await pause(page, PAUSE * 1.2);
  }

  await flash(page, "/dashboard/notifications", PAUSE * 0.6);
}

/** ── ACTE 3 : Admin OBC — disponibilisation (~40 s) ── */
async function acte3AdminObc(page, context) {
  console.log("  Acte 3 — Admin OBC : disponibilisation");
  await clearSession(context);
  await login(page, CREDS.admin);
  await flash(page, "/admin", PAUSE * 0.8);
  await flash(page, "/admin/documents", PAUSE * 0.6);

  const studentRow = page.locator("div.border-b").filter({ hasText: MATRICULE }).first();
  if (await studentRow.isVisible().catch(() => false)) {
    await studentRow.scrollIntoViewIfNeeded();
    const form = studentRow.locator("form").first();
    const select = form.locator('select[name="statut"]');
    if (await select.isVisible().catch(() => false)) {
      await select.selectOption("DISPONIBLE");
      await form.getByRole("button", { name: "Modifier" }).click();
      await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
      await pause(page, PAUSE * 1.2);
    }
  }

  await flash(page, "/admin/students", PAUSE * 0.6);
}

/** ── ACTE 4 : Admin DECC — tableau de bord (~15 s) ── */
async function acte4AdminDecc(page, context) {
  console.log("  Acte 4 — Admin DECC : aperçu");
  await clearSession(context);
  await login(page, CREDS.decc);
  await flash(page, "/admin", PAUSE * 0.7);
  await flash(page, "/admin/documents", PAUSE * 0.6);
}

/** ── ACTE 5 : Élève — RDV (~45 s) ── */
async function acte5EleveRdv(page, context) {
  console.log("  Acte 5 — Élève : prise de rendez-vous");
  await clearSession(context);
  await login(page, CREDS.eleve);
  await flash(page, "/dashboard/documents", PAUSE * 0.8);

  const rdvBtn = page.getByRole("button", { name: "Rendez-vous" }).first();
  if (await rdvBtn.isVisible().catch(() => false)) {
    await rdvBtn.scrollIntoViewIfNeeded();
    await rdvBtn.click();
    await pause(page, PAUSE * 0.8);

    const slotBtn = page
      .locator('form button[type="button"]')
      .filter({ hasText: /^\d{2}:\d{2}/ })
      .first();
    if (await slotBtn.isVisible().catch(() => false)) {
      await slotBtn.click();
      await pause(page, PAUSE * 0.4);
    }

    const confirmRdv = page.getByRole("button", { name: "Confirmer le rendez-vous" });
    if (await confirmRdv.isVisible().catch(() => false)) {
      await confirmRdv.click();
      await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
      await pause(page, PAUSE * 1.2);
    } else {
      await page.keyboard.press("Escape").catch(() => {});
    }
  }

  await flash(page, "/dashboard/rendez-vous", PAUSE * 0.8);
}

/** ── ACTE 6 : Agent — confirmation retrait (~35 s) ── */
async function acte6Agent(page, context) {
  console.log("  Acte 6 — Agent : confirmation retrait");
  await clearSession(context);
  await login(page, CREDS.agent);
  await flash(page, "/centre-examen", PAUSE * 0.8);

  const upcoming = page.getByRole("button", { name: "À venir" });
  if (await upcoming.isVisible().catch(() => false)) {
    await upcoming.click();
    await pause(page, PAUSE * 0.5);
  }

  const confirmBtn = page.getByRole("button", { name: "Confirmer retrait" }).first();
  if (await confirmBtn.isVisible().catch(() => false)) {
    await confirmBtn.scrollIntoViewIfNeeded();
    await confirmBtn.click();
    await pause(page, PAUSE * 0.6);
    await page.getByRole("button", { name: "Confirmer", exact: true }).click();
    await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
    await pause(page, PAUSE * 1.2);
  }
}

/** ── ACTE 7 : Élève — document retiré (~15 s) ── */
async function acte7EleveFinal(page, context) {
  console.log("  Acte 7 — Élève : document retiré");
  await clearSession(context);
  await login(page, CREDS.eleve);
  await flash(page, "/dashboard/documents", PAUSE * 1);
  await clearSession(context);
  await flash(page, "/", PAUSE * 0.8);
}

async function runAct(label, fn) {
  try {
    await fn();
  } catch (error) {
    console.warn(`  ⚠ ${label}: ${error instanceof Error ? error.message : error}`);
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const health = await fetch(BASE).catch(() => null);
  if (!health || health.status >= 500) {
    throw new Error(`Application inaccessible sur ${BASE}. Lancez : npm run dev`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: "fr-FR",
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  await hideToasts(page);

  const started = Date.now();
  console.log(`Enregistrement démo soutenance (pause ${PAUSE} ms)…`);

  try {
    await runAct("Acte 1", () => acte1Landing(page));
    await runAct("Acte 2", () => acte2EleveDemande(page, context));
    await runAct("Acte 3", () => acte3AdminObc(page, context));
    await runAct("Acte 4", () => acte4AdminDecc(page, context));
    await runAct("Acte 5", () => acte5EleveRdv(page, context));
    await runAct("Acte 6", () => acte6Agent(page, context));
    await runAct("Acte 7", () => acte7EleveFinal(page, context));
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();
    const rawPath = await video.path();
    const finalPath = join(OUT_DIR, "demo-soutenance-d-scolcam.webm");
    renameSync(rawPath, finalPath);
    const durationSec = Math.round((Date.now() - started) / 1000);
    console.log(`\n✓ Vidéo : ${finalPath}`);
    console.log(`  Durée script : ~${durationSec}s (cible 3–5 min)`);
    console.log("  Lecture : glisser le fichier dans Firefox ou Chrome");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
