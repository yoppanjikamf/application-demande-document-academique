#!/usr/bin/env node
/** Regénère les PNG depuis leurs SVG (rendu Playwright propre, sans artefacts d'export). */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = path.join(ROOT, "docs", "diagrammes-images");

async function svgToPng(svgPath, pngPath) {
  const svg = fs.readFileSync(svgPath, "utf8");
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.setContent(
    `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff">${svg}</body></html>`,
    { waitUntil: "networkidle" },
  );
  const el = page.locator("svg").first();
  await el.waitFor({ state: "visible" });
  await el.screenshot({ path: pngPath, type: "png" });
  await browser.close();
}

const pngs = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (name.endsWith(".png")) pngs.push(full);
  }
}
walk(IMG);

let done = 0;
for (const pngPath of pngs) {
  const svgPath = pngPath.replace(/\.png$/, ".svg");
  if (!fs.existsSync(svgPath)) continue;
  await svgToPng(svgPath, pngPath);
  done += 1;
  console.log("  ", path.relative(ROOT, pngPath));
}
console.log(`OK — ${done} PNG régénérés depuis SVG`);
