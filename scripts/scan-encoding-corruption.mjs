import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const srcRoot = "src";
const files = [];

function walk(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(ent.name)) {
      files.push(p.replace(/\\/g, "/"));
    }
  }
}
walk(srcRoot);

const existsInF36 = new Set(
  execSync("git ls-tree -r --name-only f36cef2 src/", { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean),
);

/** @param {string} text @param {string} file */
function detectIssues(text, file) {
  const issues = [];
  const lines = text.split(/\r?\n/);

  if (/\?\?\/(label|option|span|p|button|strong|h[1-6])/i.test(text)) {
    issues.push("broken-jsx-close (??/tag>)");
  }
  if (/\(\d+\)\?\?\s/.test(text)) {
    issues.push("corrupt-regex (digits+??)");
  }
  if (/\uFFFD/.test(text)) {
    issues.push("replacement-char (U+FFFD)");
  }
  if (/useState\(["']\?\?["']\)/.test(text) || /as ["']\?\?["']/.test(text)) {
    issues.push("corrupt-gender-literals");
  }
  if (/headline:\s*["'][^"']*\?\?[^"']*["']/.test(text)) {
    issues.push("corrupt-headline-string");
  }
  if (/subcopy:\s*["'][^"']*\?\?[^"']*["']/.test(text)) {
    issues.push("corrupt-subcopy-string");
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const n = i + 1;

    if (/\?\?\/[a-zA-Z]/.test(line)) {
      issues.push(`L${n}: broken-jsx-close`);
    }
    if (/\.match\(\/\^.*\?\?/.test(line)) {
      issues.push(`L${n}: corrupt-regex-in-match`);
    }
    if (
      /(label|title|placeholder|aria-label|subcopy|headline):\s*["'][^"']*\?\?\?/.test(
        line,
      )
    ) {
      issues.push(`L${n}: corrupt-string-literal`);
    }
    if (/["'][^"'\n]*\?\?[^"'\n]*$/.test(line) && !/\?\?\s/.test(line)) {
      const q = (line.match(/"/g) || []).length + (line.match(/'/g) || []).length;
      if (q % 2 === 1) issues.push(`L${n}: possible-unclosed-string`);
    }
    if (/^[^/]*["'][^"']*\?\?[^"']*["']/.test(line) && !/\?\? /.test(line)) {
      if (/["'][^"']*\?\?\?/.test(line)) {
        issues.push(`L${n}: ????-in-string`);
      }
    }
  }

  return [...new Set(issues)];
}

const report = [];
for (const f of files.sort()) {
  const text = readFileSync(f, "utf8");
  const issues = detectIssues(text, f);
  if (issues.length === 0) continue;
  report.push({
    file: f,
    inF36cef2: existsInF36.has(f),
    issues,
  });
}

const changed195766c = execSync(
  "git diff --name-only f36cef2 195766c -- src/",
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);

console.log("=== CORRUPTED FILES IN src/ ===\n");
for (const r of report) {
  console.log(`${r.file}`);
  console.log(`  f36cef2 exists: ${r.inF36cef2}`);
  for (const i of r.issues.slice(0, 8)) console.log(`  - ${i}`);
  if (r.issues.length > 8) console.log(`  - ... +${r.issues.length - 8} more`);
  console.log("");
}

const restoreable = report.filter((r) => r.inF36cef2).map((r) => r.file);
const newOnly = report.filter((r) => !r.inF36cef2).map((r) => r.file);

console.log("=== SUMMARY ===");
console.log(`Total corrupted: ${report.length}`);
console.log(`Restore via checkout f36cef2: ${restoreable.length}`);
console.log(`NOT in f36cef2 (manual): ${newOnly.length}`);
if (newOnly.length) console.log(newOnly.join("\n"));

console.log("\n=== CHANGED IN 195766c (for reference) ===");
console.log(changed195766c.join("\n"));

// Output restore list for shell
console.log("\n=== RESTORE_LIST ===");
console.log(restoreable.join("\n"));
