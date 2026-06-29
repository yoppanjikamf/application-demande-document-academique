#!/usr/bin/env node
/**
 * Enregistre une démo vidéo automatique de DR-DOCSCOL (Playwright).
 * Prérequis : npm run dev sur BASE_URL (défaut http://localhost:3000)
 *
 * Usage : node scripts/record-demo-video.mjs
 * Sortie : ~/Vidéos/demo-d-scolcam.webm (Firefox / Chrome peuvent le lire)
 */
import { mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE = process.env.DEMO_BASE_URL?.trim() || "http://localhost:3000";
const OUT_DIR = join(homedir(), "Vidéos");
const PAUSE = Number(process.env.DEMO_PAUSE_MS || 2500);

loadEnv(join(ROOT, ".env.local"));
loadEnv(join(ROOT, ".env"));

const CREDS = {
  eleve: {
    matricule: process.env.SCREENSHOT_ELEVE_MATRICULE?.trim() || "DEMO2026002",
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
    content: ".Toastify, [data-sonner-toaster] { opacity: 0.85 !important; }",
  });
}

async function login(page, creds) {
  await page.goto(`${BASE}${creds.loginUrl}`, { waitUntil: "domcontentloaded" });
  await page.locator('input[name="matricule"]').waitFor({ state: "visible" });
  await page.locator('input[name="matricule"]').fill(creds.matricule);
  await page.locator('input[name="email"]').fill(creds.email);
  await page.locator('input[name="password"]').fill(creds.password);
  const submit = page.getByRole("button", { name: "Se connecter" });
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 90000 }),
    submit.click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await pause(page);
}

async function logout(page) {
  const btn = page.getByRole("button", { name: /Déconnexion|Sign out/i }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await pause(page, 1500);
    return;
  }
  await page.goto(`${BASE}/logout`, { waitUntil: "domcontentloaded" }).catch(() => {});
  await pause(page, 1500);
}

async function scrollMain(page) {
  const main = page.locator("main").first();
  if (await main.isVisible().catch(() => false)) {
    await main.evaluate((el) => el.scrollTo({ top: 0, behavior: "smooth" }));
    await pause(page, 1200);
    await main.evaluate((el) => el.scrollTo({ top: el.scrollHeight / 3, behavior: "smooth" }));
    await pause(page, 1200);
  }
}

async function demoPublicPages(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await pause(page, 3000);
  await scrollMain(page);

  await page.goto(`${BASE}/auth/register`, { waitUntil: "domcontentloaded" });
  await pause(page, 2500);

  await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded" });
  await pause(page, 2500);
}

async function demoEleve(page) {
  await login(page, CREDS.eleve);

  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await pause(page);
  await scrollMain(page);

  await page.goto(`${BASE}/dashboard/documents`, { waitUntil: "domcontentloaded" });
  await pause(page);
  await scrollMain(page);

  await page.goto(`${BASE}/dashboard/rendez-vous`, { waitUntil: "domcontentloaded" });
  await pause(page);

  await page.goto(`${BASE}/dashboard/notifications`, { waitUntil: "domcontentloaded" });
  await pause(page);

  await logout(page);
}

async function demoAdmin(page) {
  await login(page, CREDS.admin);

  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await pause(page);
  await scrollMain(page);

  await page.goto(`${BASE}/admin/documents?statut=DISPONIBLE`, { waitUntil: "domcontentloaded" });
  await pause(page);

  await page.goto(`${BASE}/admin/students`, { waitUntil: "domcontentloaded" });
  await pause(page);
  await scrollMain(page);

  await logout(page);
}

async function demoDecc(page) {
  await login(page, CREDS.decc);

  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await pause(page);
  await scrollMain(page);

  await page.goto(`${BASE}/admin/documents`, { waitUntil: "domcontentloaded" });
  await pause(page);

  await logout(page);
}

async function demoAgent(page) {
  await login(page, CREDS.agent);

  await page.goto(`${BASE}/centre-examen`, { waitUntil: "domcontentloaded" });
  await pause(page);
  await scrollMain(page);

  const confirmBtn = page.getByRole("button", { name: "Confirmer retrait" }).first();
  if (await confirmBtn.isVisible().catch(() => false)) {
    await confirmBtn.scrollIntoViewIfNeeded();
    await pause(page, 1500);
    await confirmBtn.click();
    await pause(page, 2000);
    await page.keyboard.press("Escape").catch(() => {});
  }

  await logout(page);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const health = await fetch(BASE).catch(() => null);
  if (!health || health.status >= 500) {
    throw new Error(`Application inaccessible sur ${BASE}. Lancez npm run dev.`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: "fr-FR",
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1280, height: 720 },
    },
  });
  const page = await context.newPage();
  await hideToasts(page);

  console.log("Enregistrement démo en cours…");
  try {
    await demoPublicPages(page);
    if (CREDS.eleve.password) await demoEleve(page);
    await demoAdmin(page);
    await demoDecc(page);
    await demoAgent(page);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await pause(page, 2000);
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();
    const rawPath = await video.path();
    const finalPath = join(OUT_DIR, "demo-d-scolcam.webm");
    const { renameSync } = await import("node:fs");
    renameSync(rawPath, finalPath);
    console.log(`\n✓ Démo enregistrée : ${finalPath}`);
    console.log("  Ouvrir avec Firefox : glisser-déposer le fichier dans Firefox");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
