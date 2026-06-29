#!/usr/bin/env node
/**
 * Démo COMPLÈTE et PROPRE — production Vercel.
 * Tous les parcours : landing (#consultation), élève, admin OBC/DECC, agent, clôture.
 *
 * AVANT : npm run demo:video:prepare
 * Usage : npm run demo:video:record
 * Sortie : ~/Vidéos/demo-soutenance-finale.webm
 */
import { mkdirSync, readFileSync, renameSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  process.env.DEMO_BASE_URL?.trim() || "https://application-demande-document-academ.vercel.app";
const OUT_DIR = join(homedir(), "Vidéos");
const PAUSE = Number(process.env.DEMO_PAUSE_MS || 2200);
const MATRICULE = process.env.SCREENSHOT_ELEVE_MATRICULE?.trim() || "DEMO2026002";
const ELEVE_EMAIL = process.env.SCREENSHOT_ELEVE_EMAIL?.trim() || "faissayoppanjikam@gmail.com";
const ELEVE_PASSWORD = process.env.SCREENSHOT_ELEVE_PASSWORD?.trim() || "DemoScreens2026!";
const CSV_OBC_DISPO = join(ROOT, "docs/imports/centre/obc/import-disponibilisation.csv");
const CSV_OBC_AJOUT = join(ROOT, "docs/imports/centre/obc/import-ajout-eleves.csv");
const CSV_DECC_DISPO = join(ROOT, "docs/imports/centre/decc/import-disponibilisation.csv");

loadEnv(join(ROOT, ".env.local"));
loadEnv(join(ROOT, ".env"));

const CREDS = {
  eleve: { matricule: MATRICULE, email: ELEVE_EMAIL, password: ELEVE_PASSWORD, loginUrl: "/auth/login" },
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
    readFileSync(path, "utf8")
      .split("\n")
      .forEach((line) => {
        const t = line.trim();
        if (!t || t.startsWith("#")) return;
        const eq = t.indexOf("=");
        if (eq === -1) return;
        const key = t.slice(0, eq).trim();
        let v = t.slice(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (!(key in process.env)) process.env[key] = v;
      });
  } catch { /* */ }
}

async function pause(page, ms = PAUSE) {
  await page.waitForTimeout(ms);
}

async function warmup() {
  console.log("Réveil Vercel…");
  for (const p of ["/", "/admin", "/centre-examen", "/auth/login/obc"]) {
    await fetch(`${BASE}${p}`).catch(() => null);
    await new Promise((r) => setTimeout(r, 2500));
  }
}

async function waitForReady(page, retries = 5) {
  for (let i = 0; i < retries; i += 1) {
    await pause(page, 1200);
    if (await page.getByRole("heading", { name: "Une erreur est survenue" }).isVisible().catch(() => false)) {
      console.warn("  ↻ Erreur serveur — Réessayer");
      await page.getByRole("button", { name: "Réessayer" }).click().catch(() => {});
      await pause(page, 4000);
      continue;
    }
    if (await page.locator("main").first().isVisible().catch(() => false)) return;
    if (await page.locator('input[name="matricule"]').isVisible().catch(() => false)) return;
  }
}

async function gotoReady(page, url) {
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await waitForReady(page);
  await pause(page, PAUSE * 0.5);
}

async function clearSession(ctx) {
  await ctx.clearCookies();
}

async function login(page, creds) {
  for (let a = 1; a <= 5; a += 1) {
    await gotoReady(page, creds.loginUrl);
    await page.locator('input[name="matricule"]').fill(creds.matricule);
    await page.locator('input[name="email"]').fill(creds.email);
    await page.locator('input[name="password"]').fill(creds.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    try {
      await page.waitForURL((u) => !u.pathname.includes("/auth/login"), { timeout: 90000 });
      await waitForReady(page);
      return;
    } catch {
      console.warn(`  ↻ Connexion ${creds.matricule} ${a}/5`);
      await pause(page, 3500);
    }
  }
  throw new Error(`Connexion échouée : ${creds.matricule}`);
}

async function activateOrLogin(page) {
  await gotoReady(page, "/auth/register");
  await page.locator('input[name="matricule"]').fill(MATRICULE);
  await page.locator('input[name="email"]').fill(ELEVE_EMAIL);
  await page.locator('input[name="password"]').fill(ELEVE_PASSWORD);
  await page.locator('input[name="confirmPassword"]').fill(ELEVE_PASSWORD);
  await page.getByRole("button", { name: "Activer mon compte" }).click();
  try {
    await page.waitForURL((u) => u.pathname.includes("/dashboard"), { timeout: 90000 });
    await waitForReady(page);
  } catch {
    console.warn("  ↻ Compte déjà activé — connexion");
    await login(page, CREDS.eleve);
  }
}

async function scrollLanding(page) {
  await gotoReady(page, "/");
  const en = page.getByRole("button", { name: "EN", exact: true });
  if (await en.isVisible().catch(() => false)) {
    await en.click();
    await pause(page);
    await page.getByRole("button", { name: "FR", exact: true }).click();
    await pause(page);
  }
  for (const id of ["#features", "#consultation", "#steps", "#access", "#faq"]) {
    await page.locator(id).scrollIntoViewIfNeeded().catch(() => {});
    await pause(page, PAUSE * 0.9);
  }
  await page.locator("#consultation").scrollIntoViewIfNeeded().catch(() => {});
  await pause(page, PAUSE * 1.2);
}

async function run(label, fn) {
  console.log(`  ${label}`);
  try {
    await fn();
  } catch (e) {
    console.warn(`  ⚠ ${label}: ${e instanceof Error ? e.message : e}`);
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  await warmup();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: "fr-FR",
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const t0 = Date.now();

  console.log(`Démo FINALE sur ${BASE}\n`);

  await run("1 — Landing complète + consultation rapide", async () => {
    await scrollLanding(page);
    await gotoReady(page, "/consultation");
    await page.locator("#consultation-matricule").fill(MATRICULE);
    await page.getByRole("button", { name: /Consulter|Rechercher/i }).click();
    await pause(page, PAUSE * 1.5);
    for (const u of ["/auth/login", "/auth/login/obc", "/auth/login/decc", "/auth/login/centre-examen"]) {
      await gotoReady(page, u);
    }
  });

  await run("2 — Activation / connexion élève", async () => {
    await clearSession(context);
    await activateOrLogin(page);
  });

  await run("3 — Parcours élève complet", async () => {
    for (const u of [
      "/dashboard",
      "/dashboard/documents",
      "/dashboard/documents?exam=BEPC",
      "/dashboard/documents?exam=PROBATOIRE",
      "/dashboard/documents?exam=BACCALAUREAT",
      "/dashboard/rendez-vous",
      "/dashboard/notifications",
      "/dashboard/payments",
    ]) {
      await gotoReady(page, u);
    }
    const btn = page.getByRole("button", { name: "Faire une demande" }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await waitForReady(page);
      await pause(page, PAUSE);
    }
  });

  await run("4 — Admin OBC (tous écrans)", async () => {
    await clearSession(context);
    await login(page, CREDS.adminObc);
    for (const u of [
      "/admin",
      "/admin/documents",
      "/admin/students",
      "/admin/payments",
      "/admin/appointments",
      "/admin/rdv-disponibilites",
    ]) {
      await gotoReady(page, u);
    }
  });

  await run("5 — Admin DECC (tous écrans)", async () => {
    await clearSession(context);
    await login(page, CREDS.adminDecc);
    for (const u of ["/admin", "/admin/documents", "/admin/students", "/admin/payments"]) {
      await gotoReady(page, u);
    }
  });

  await run("6 — Admin OBC : disponibilisation + imports", async () => {
    await clearSession(context);
    await login(page, CREDS.adminObc);
    await gotoReady(page, "/admin/documents");
    const row = page.locator("div.border-b").filter({ hasText: MATRICULE }).first();
    if (await row.isVisible().catch(() => false)) {
      const form = row.locator("form").first();
      await form.locator('select[name="statut"]').selectOption("DISPONIBLE");
      await form.getByRole("button", { name: "Modifier" }).click();
      await waitForReady(page);
      await pause(page, PAUSE * 1.5);
    }
    await gotoReady(page, "/admin/students");
    const files = page.locator('input[type="file"]');
    if ((await files.count()) >= 1) {
      await files.first().setInputFiles(CSV_OBC_DISPO);
      await page.getByRole("button", { name: "Importer et disponibiliser" }).click();
      await pause(page, PAUSE * 2.5);
      await gotoReady(page, "/admin/students");
    }
    if ((await files.count()) >= 2) {
      await files.nth(1).setInputFiles(CSV_OBC_AJOUT);
      await page.getByRole("button", { name: "Importer le fichier" }).click();
      await pause(page, PAUSE * 2.5);
    }
  });

  await run("7 — Admin DECC : import disponibilisation", async () => {
    await clearSession(context);
    await login(page, CREDS.adminDecc);
    await gotoReady(page, "/admin/students");
    const f = page.locator('input[type="file"]').first();
    if (await f.isVisible().catch(() => false)) {
      await f.setInputFiles(CSV_DECC_DISPO);
      await page.getByRole("button", { name: "Importer et disponibiliser" }).click();
      await pause(page, PAUSE * 2.5);
    }
  });

  await run("8 — Élève : RDV", async () => {
    await clearSession(context);
    await login(page, CREDS.eleve);
    await gotoReady(page, "/dashboard/documents?exam=BACCALAUREAT");
    const rdv = page.getByRole("button", { name: "Rendez-vous" }).first();
    if (await rdv.isVisible().catch(() => false)) {
      await rdv.click();
      await pause(page, PAUSE);
      const slot = page.locator('form button[type="button"]').filter({ hasText: /^\d{2}:\d{2}/ }).first();
      if (await slot.isVisible().catch(() => false)) await slot.click();
      await page.getByRole("button", { name: "Confirmer le rendez-vous" }).click();
      await waitForReady(page);
      await pause(page, PAUSE * 1.5);
    }
    await gotoReady(page, "/dashboard/rendez-vous");
  });

  await run("9 — AGENT : confirmation retrait", async () => {
    await clearSession(context);
    await login(page, CREDS.agent);
    await gotoReady(page, "/centre-examen");
    await pause(page, PAUSE * 1.5);
    await page.getByRole("button", { name: "À venir" }).click().catch(() => {});
    await pause(page, PAUSE);
    const btn = page.getByRole("button", { name: "Confirmer retrait" }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.scrollIntoViewIfNeeded();
      await pause(page, PAUSE);
      await btn.click();
      await pause(page, PAUSE);
      await page.getByRole("button", { name: "Confirmer", exact: true }).click();
      await waitForReady(page);
      await pause(page, PAUSE * 2.5);
    } else {
      console.warn("  ⚠ Pas de bouton Confirmer retrait — vérifiez demo:video:prepare");
      await pause(page, PAUSE * 2);
    }
  });

  await run("10 — Élève : document retiré + notifications", async () => {
    await clearSession(context);
    await login(page, CREDS.eleve);
    await gotoReady(page, "/dashboard/documents?exam=BACCALAUREAT");
    await pause(page, PAUSE * 1.5);
    await gotoReady(page, "/dashboard/notifications");
    await pause(page, PAUSE * 1.5);
    await gotoReady(page, "/consultation");
    await page.locator("#consultation-matricule").fill(MATRICULE);
    await page.getByRole("button", { name: /Consulter|Rechercher/i }).click();
    await pause(page, PAUSE);
    await gotoReady(page, "/");
  });

  const video = page.video();
  await context.close();
  await browser.close();
  const out = join(OUT_DIR, "demo-soutenance-finale.webm");
  renameSync(await video.path(), out);
  const s = Math.round((Date.now() - t0) / 1000);
  console.log(`\n✓ Vidéo : ${out}`);
  console.log(`  Durée : ~${Math.floor(s / 60)} min ${s % 60} s`);
  console.log(`  Email retrait : vérifiez ${ELEVE_EMAIL} (notification in-app dans /dashboard/notifications)`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
