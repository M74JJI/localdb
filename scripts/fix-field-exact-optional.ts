import { readFileSync, writeFileSync } from "node:fs";

const path = "apps/web/src/app/databases/new/page.tsx";
let content = readFileSync(path, "utf8");

content = content.replace(
  `function Field({ label, help, error, children }: { label: string; help?: string; error?: string; children: React.ReactNode }) {`,
  `function Field({
  label,
  help,
  error,
  children
}: {
  label: string;
  help?: string | undefined;
  error?: string | undefined;
  children: React.ReactNode;
}) {`
);

content = content.replace(
  `function Field({
  label,
  help,
  error,
  children
}: {
  label: string;
  help?: string;
  error?: string;
  children: React.ReactNode;
}) {`,
  `function Field({
  label,
  help,
  error,
  children
}: {
  label: string;
  help?: string | undefined;
  error?: string | undefined;
  children: React.ReactNode;
}) {`
);

writeFileSync(path, content);
console.log("Fixed Field optional prop types in", path);
