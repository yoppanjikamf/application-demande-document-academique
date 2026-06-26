#!/usr/bin/env node
/**
 * Capture les écrans DR-DOCSCOL pour le mémoire (figures 8–20).
 * Prérequis : npm run dev sur BASE_URL (défaut http://localhost:3000)
 *
 * Variables optionnelles (.env.local) :
 *   SCREENSHOT_ELEVE_MATRICULE, SCREENSHOT_ELEVE_EMAIL, SCREENSHOT_ELEVE_PASSWORD
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "docs", "memoire-screenshots");
const BASE = process.env.SCREENSHOT_BASE_URL?.trim() || "http://localhost:3000";

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

async function shot(page, name, options = {}) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false, ...options });
  console.log(`  ✓ ${name}`);
  return path;
}

async function shotAuthShell(page, name) {
  const shell = page.locator("form").first();
  if (await shell.isVisible().catch(() => false)) {
    const box = await shell.boundingBox();
    if (box) {
      await shot(page, name, {
        clip: {
          x: Math.max(0, box.x - 40),
          y: Math.max(0, box.y - 80),
          width: Math.min(1440, box.width + 80),
          height: Math.min(900, box.height + 120),
        },
      });
      return;
    }
  }
  await shot(page, name);
}

async function shotMain(page, name) {
  const main = page.locator("main").first();
  if (await main.isVisible().catch(() => false)) {
    const box = await main.boundingBox();
    if (box) {
      await shot(page, name, { clip: box });
      return;
    }
  }
  await shot(page, name);
}

async function login(page, creds) {
  await page.goto(`${BASE}${creds.loginUrl}`, { waitUntil: "networkidle" });
  const matricule = page.locator('input[name="matricule"]');
  await matricule.waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const input = document.querySelector('input[name="matricule"]');
    return input instanceof HTMLInputElement && input.value === "";
  });
  await matricule.fill(creds.matricule);
  await page.locator('input[name="email"]').fill(creds.email);
  await page.locator('input[name="password"]').fill(creds.password);
  const submit = page.getByRole("button", { name: "Se connecter" });
  await submit.waitFor({ state: "visible" });
  await page.waitForTimeout(800);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 90000 }),
    submit.click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
}

async function withLoggedInContext(creds, fn) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "fr-FR",
  });
  const page = await context.newPage();
  await hideToasts(page);
  try {
    await login(page, creds);
    await fn(page);
  } finally {
    await browser.close();
  }
}

async function hideToasts(page) {
  await page.addStyleTag({
    content: ".Toastify, [data-sonner-toaster] { display: none !important; }",
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  const health = await fetch(BASE).catch(() => null);
  if (!health || health.status >= 500) {
    throw new Error(`Application inaccessible sur ${BASE}. Lancez npm run dev.`);
  }

  const report = [];
  const browser = await chromium.launch({ headless: true });
  const publicContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "fr-FR",
  });
  const publicPage = await publicContext.newPage();
  await hideToasts(publicPage);

  await publicPage.goto(`${BASE}/auth/register`, { waitUntil: "domcontentloaded" });
  await publicPage.waitForLoadState("networkidle").catch(() => {});
  await shotAuthShell(publicPage, "fig-08-activation.png");

  await publicPage.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded" });
  await publicPage.waitForLoadState("networkidle").catch(() => {});
  await shotAuthShell(publicPage, "fig-09-login.png");
  await publicContext.close();

  if (CREDS.eleve.password) {
    try {
      await withLoggedInContext(CREDS.eleve, async (page) => {
        await page.goto(`${BASE}/dashboard/documents`, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle").catch(() => {});
        await shotMain(page, "fig-10-dashboard-documents.png");

        const detailCard = page
          .locator("section, article, div")
          .filter({ hasText: /Lieu de retrait|Disponible|instructions de retrait/i })
          .first();
        if (await detailCard.isVisible().catch(() => false)) {
          const box = await detailCard.boundingBox();
          if (box) await shot(page, "fig-11-document-detail.png", { clip: box });
          else await shotMain(page, "fig-11-document-detail.png");
        } else {
          await shotMain(page, "fig-11-document-detail.png");
        }

        const duplicataForm = page.locator("form").filter({ hasText: /Duplicata du/i }).first();
        if (await duplicataForm.isVisible().catch(() => false)) {
          const box = await duplicataForm.boundingBox();
          if (box) await shot(page, "fig-12-duplicata-form.png", { clip: box });
          else await shotMain(page, "fig-12-duplicata-form.png");
        } else {
          const duplicataSection = page.getByText(/Duplicata du/i).first();
          if (await duplicataSection.isVisible().catch(() => false)) {
            await duplicataSection.scrollIntoViewIfNeeded();
            await shotMain(page, "fig-12-duplicata-form.png");
          }
        }

        await page.goto(`${BASE}/dashboard/rendez-vous`, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle").catch(() => {});
        await shotMain(page, "fig-13-rdv.png");

        await page.goto(`${BASE}/dashboard/notifications`, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle").catch(() => {});
        await shotMain(page, "fig-14-notifications.png");
      });
      report.push("eleve: OK");
    } catch (error) {
      report.push(`eleve: SKIP (${error instanceof Error ? error.message : error})`);
      console.warn(`⚠ ${report.at(-1)}`);
    }
  } else {
    report.push("eleve: SKIP (mot de passe élève absent)");
    console.warn(`⚠ ${report.at(-1)}`);
  }

  try {
    await withLoggedInContext(CREDS.admin, async (page) => {
      await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await shotMain(page, "fig-15-admin-dashboard.png");

      await page.goto(`${BASE}/admin/documents?statut=DISPONIBLE`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await shotMain(page, "fig-16-admin-documents.png");

      await page.goto(`${BASE}/admin/students`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      const importSection = page.locator("section").filter({ hasText: /Import|CSV|élèves/i }).first();
      if (await importSection.isVisible().catch(() => false)) {
        const box = await importSection.boundingBox();
        if (box) await shot(page, "fig-17-import-csv.png", { clip: box });
        else await shotMain(page, "fig-17-import-csv.png");
      } else {
        await shotMain(page, "fig-17-import-csv.png");
      }

      await page.goto(`${BASE}/admin/documents`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      const duplicataPanel = page
        .locator("section, div")
        .filter({ hasText: /Duplicata|pièces justificatives|statutValidation/i })
        .first();
      if (await duplicataPanel.isVisible().catch(() => false)) {
        await duplicataPanel.scrollIntoViewIfNeeded();
        const box = await duplicataPanel.boundingBox();
        if (box) await shot(page, "fig-18-duplicata-admin.png", { clip: box });
        else await shotMain(page, "fig-18-duplicata-admin.png");
      } else {
        await shotMain(page, "fig-18-duplicata-admin.png");
      }
    });
    report.push("admin: OK");
  } catch (error) {
    report.push(`admin: ERREUR (${error instanceof Error ? error.message : error})`);
    console.error(`✗ ${report.at(-1)}`);
  }

  try {
    await withLoggedInContext(CREDS.agent, async (page) => {
      await page.goto(`${BASE}/centre-examen`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await shotMain(page, "fig-19-agent-rdv-list.png");

      const confirmBtn = page.getByRole("button", { name: "Confirmer retrait" }).first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.scrollIntoViewIfNeeded();
        await confirmBtn.click();
        await page.waitForTimeout(500);
        const dialog = page.getByRole("dialog");
        if (await dialog.isVisible().catch(() => false)) {
          const box = await dialog.boundingBox();
          if (box) await shot(page, "fig-20-agent-confirm.png", { clip: box });
          else await shot(page, "fig-20-agent-confirm.png");
          await page.keyboard.press("Escape");
        } else {
          await shot(page, "fig-20-agent-confirm.png");
        }
      } else {
        await shotMain(page, "fig-20-agent-confirm.png");
      }
    });
    report.push("agent: OK");
  } catch (error) {
    report.push(`agent: ERREUR (${error instanceof Error ? error.message : error})`);
    console.error(`✗ ${report.at(-1)}`);
  }

  await browser.close();

  writeFileSync(join(OUT, "capture-report.txt"), `${report.join("\n")}\n`, "utf8");
  console.log(`\nCaptures dans ${OUT}`);
  console.log(report.join("\n"));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
