import { readFileSync, writeFileSync } from "node:fs";

const path = "apps/api/src/main.ts";
let content = readFileSync(path, "utf8");

if (!content.includes('import { loadRootEnv } from "@localdb-hub/db";')) {
  content = content.replace(
    /^(import .+;\n)/m,
    `$1import { loadRootEnv } from "@localdb-hub/db";\n`
  );
}

if (!content.includes('import { registerCors } from "./cors";')) {
  content = content.replace(
    /^(import .+;\n)/m,
    `$1import { registerCors } from "./cors";\n`
  );
}

if (!content.includes("loadRootEnv();")) {
  content = content.replace(
    /(async function|const boot|async function boot|async function main|function boot|function main)/,
    `loadRootEnv();\n\n$1`
  );
}

if (!content.includes("registerCors(app)") && !content.includes("await registerCors(app)")) {
  content = content.replace(
    /(const app = Fastify\([^;]*\);|const app = fastify\([^;]*\);|const app = Fastify\([^\\n]*\\n[^;]*;)/,
    `$1\n\n  await registerCors(app);`
  );
}

writeFileSync(path, content);
console.log("Patched API CORS registration in", path);
