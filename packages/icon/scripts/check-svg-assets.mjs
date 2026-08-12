import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const assetsDir = path.join(rootDir, "src/assets");

const fatalPatterns = [
  { label: "doctype", regex: /<!doctype/i },
  { label: "script", regex: /<script\b/i },
  { label: "inline-event", regex: /\son[a-z]+\s*=/i },
];

const warningPatterns = [
  {
    label: "hardcoded-fill",
    regex: /\sfill=["'](?!none["']|currentColor["']|url\()[^"']+["']/i,
  },
  {
    label: "hardcoded-stroke",
    regex: /\sstroke=["'](?!none["']|currentColor["']|url\()[^"']+["']/i,
  },
  { label: "missing-currentColor", regex: /^((?!currentColor).)*$/is },
  { label: "text-node", regex: /<text\b/i },
  { label: "defs", regex: /<defs\b/i },
  { label: "id-attr", regex: /\sid=["'][^"']+["']/i },
  { label: "use-node", regex: /<use\b/i },
  { label: "style-attr", regex: /\sstyle=["'][^"']+["']/i },
];

const listSvgFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return listSvgFiles(entryPath);
    }

    return entry.name.endsWith(".svg") ? [entryPath] : [];
  });

const toRelative = (filePath) => path.relative(rootDir, filePath);
const fatalHits = [];
const warningCounts = Object.fromEntries(
  warningPatterns.map(({ label }) => [label, 0]),
);
const warningSamples = Object.fromEntries(
  warningPatterns.map(({ label }) => [label, []]),
);

const files = listSvgFiles(assetsDir).sort((a, b) => a.localeCompare(b));

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const relativePath = toRelative(file);

  for (const pattern of fatalPatterns) {
    if (pattern.regex.test(content)) {
      fatalHits.push(`${relativePath}: ${pattern.label}`);
    }
  }

  for (const pattern of warningPatterns) {
    if (pattern.regex.test(content)) {
      warningCounts[pattern.label] += 1;
      if (warningSamples[pattern.label].length < 3) {
        warningSamples[pattern.label].push(relativePath);
      }
    }
  }
}

console.log(`[icon:svg] scanned ${files.length} svg files`);

for (const pattern of warningPatterns) {
  const count = warningCounts[pattern.label];

  if (count > 0) {
    const samples = warningSamples[pattern.label].join(", ");
    console.warn(`[icon:svg] warn ${pattern.label}: ${count} (${samples})`);
  }
}

if (fatalHits.length > 0) {
  console.error("[icon:svg] fatal issues:");
  for (const hit of fatalHits) {
    console.error(`  - ${hit}`);
  }
  process.exit(1);
}
