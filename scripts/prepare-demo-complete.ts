import "dotenv/config";
import { execSync } from "node:child_process";

/**
 * Remise à zéro complète pour la démo production (tous les cas).
 * - reset:imports : désactive tous les élèves, purge RDV/duplicatas, régénère les CSV
 *
 * Usage : npm run demo:complete:prepare
 * Puis enregistrement : DEMO_BASE_URL=https://application-demande-document-academ.vercel.app npm run demo:complete:record
 */
async function main() {
  console.log("=== Remise à zéro complète (production) ===\n");
  execSync("npm run reset:imports", { stdio: "inherit" });
  console.log("\n✓ Base prête pour la démo complète.");
  console.log("  Prochaine étape : activation élève sur /auth/register (DEMO2026002 / faissayoppanjikam@gmail.com)");
  console.log("  Mot de passe suggéré pour l'activation : DemoSoutenance2026!");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
