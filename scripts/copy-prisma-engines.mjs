import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const sourceDir = join(process.cwd(), "lib", "generated", "prisma");
const targetDirs = [
  join(process.cwd(), ".next", "server", "chunks"),
  join(process.cwd(), ".next", "standalone", ".next", "server", "chunks"),
];

if (!existsSync(sourceDir)) {
  throw new Error(`Prisma generated directory not found: ${sourceDir}`);
}

const engineFiles = readdirSync(sourceDir).filter(
  (file) => file.startsWith("libquery_engine-") && file.endsWith(".so.node"),
);

if (engineFiles.length === 0) {
  throw new Error(`No Prisma query engines found in: ${sourceDir}`);
}

for (const targetDir of targetDirs) {
  if (!existsSync(targetDir)) {
    continue;
  }

  mkdirSync(targetDir, { recursive: true });

  for (const file of engineFiles) {
    copyFileSync(join(sourceDir, file), join(targetDir, file));
  }
}
