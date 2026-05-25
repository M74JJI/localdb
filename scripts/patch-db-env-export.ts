import { readFileSync, writeFileSync } from "node:fs";

const path = "packages/db/src/index.ts";
let content = readFileSync(path, "utf8");

if (!content.includes('export { loadRootEnv } from "./env";')) {
  content = `export { loadRootEnv } from "./env";\n${content}`;
  writeFileSync(path, content);
  console.log("Exported loadRootEnv from", path);
} else {
  console.log("loadRootEnv already exported from", path);
}
