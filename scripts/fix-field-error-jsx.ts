import { readFileSync, writeFileSync } from "node:fs";

const path = "apps/web/src/app/databases/new/page.tsx";
let content = readFileSync(path, "utf8");

const replacements: Array<[string, string]> = [
  [
    `error={touched.name ? errors.name : undefined}`,
    `error={touched.name ? (errors.name ?? "") : ""}`
  ],
  [
    `error={touched.databaseName ? errors.databaseName : undefined}`,
    `error={touched.databaseName ? (errors.databaseName ?? "") : ""}`
  ],
  [
    `error={touched.username ? errors.username : undefined}`,
    `error={touched.username ? (errors.username ?? "") : ""}`
  ]
];

let changed = false;

for (const [from, to] of replacements) {
  if (content.includes(from)) {
    content = content.replaceAll(from, to);
    changed = true;
  }
}

if (!changed) {
  console.log("No direct JSX replacements were found. The file may already be fixed or has changed.");
} else {
  writeFileSync(path, content);
  console.log("Fixed explicit undefined Field error props in", path);
}
