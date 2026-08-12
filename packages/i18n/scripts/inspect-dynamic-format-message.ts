#!/usr/bin/env bun
/**
 * 列举所有动态 formatMessage 调用,采样输出代码上下文
 */
import fs from "fs";
import path from "path";

import { parse } from "@babel/parser";

const repoRoot = path.resolve(import.meta.dir, "../../..");
const zlrRoot = path.join(repoRoot, "packages/products/zlr");
const appNames = [
  "core-shell",
  "dashboard",
  "infrastructure",
  "monitoring",
  "protection",
  "recovery",
  "system-management",
];
const sourceExts = new Set([".ts", ".tsx"]);
const ignored = new Set([
  "node_modules",
  "dist",
  "build",
  "coverage",
  "lint_report",
  ".turbo",
]);

function collect(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  const out: string[] = [];
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith(".")) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (!ignored.has(e.name)) walk(p);
        continue;
      }
      if (e.isFile() && sourceExts.has(path.extname(e.name))) out.push(p);
    }
  };
  walk(root);
  return out;
}

function roots(): string[] {
  const r: string[] = [];
  const s = path.join(zlrRoot, "shared");
  if (fs.existsSync(s))
    for (const e of fs.readdirSync(s, { withFileTypes: true })) {
      if (e.isDirectory()) {
        const sr = path.join(s, e.name, "src");
        if (fs.existsSync(sr)) r.push(sr);
      }
    }
  for (const a of appNames) {
    const sr = path.join(zlrRoot, `apps/${a}/src`);
    if (fs.existsSync(sr)) r.push(sr);
  }
  return r;
}

function propName(p: any): string | undefined {
  if (!p) return undefined;
  if (p.type === "Identifier") return p.name;
  if (p.type === "StringLiteral") return p.value;
  return undefined;
}
function isFM(callee: any): boolean {
  if (!callee) return false;
  if (callee.type === "Identifier") return callee.name === "formatMessage";
  if (
    callee.type !== "MemberExpression" &&
    callee.type !== "OptionalMemberExpression"
  )
    return false;
  return propName(callee.property) === "formatMessage";
}
function visit(n: any, v: (n: any) => void) {
  if (!n || typeof n !== "object") return;
  v(n);
  for (const [k, val] of Object.entries(n)) {
    if (
      [
        "loc",
        "start",
        "end",
        "leadingComments",
        "trailingComments",
        "innerComments",
      ].includes(k)
    )
      continue;
    if (Array.isArray(val)) for (const c of val) visit(c, v);
    else if (val && typeof val === "object") visit(val, v);
  }
}

interface Sample {
  file: string;
  line: number;
  kind: string;
  snippet: string;
}
const buckets: Record<string, Sample[]> = {
  "non-object arg (variable/identifier)": [],
  "spread element in arg": [],
  "id is variable / identifier": [],
  "id is template literal with interpolation": [],
  "id is conditional / logical expression": [],
  "id is member expression": [],
  "id is function call": [],
  "other dynamic": [],
};

for (const root of roots()) {
  for (const file of collect(root)) {
    const src = fs.readFileSync(file, "utf8");
    let ast;
    try {
      ast = parse(src, {
        sourceType: "module",
        errorRecovery: true,
        plugins: [
          "typescript",
          "jsx",
          "decorators-legacy",
          "classProperties",
          "objectRestSpread",
          "optionalChaining",
          "nullishCoalescingOperator",
          "dynamicImport",
          "importMeta",
          "topLevelAwait",
        ],
      });
    } catch {
      continue;
    }
    visit(ast, (node: any) => {
      if (node.type !== "CallExpression") return;
      if (!isFM(node.callee)) return;
      const arg = node.arguments?.[0];
      const line = node.loc?.start?.line ?? 0;
      const rel = path.relative(repoRoot, file);
      const start = node.loc?.start?.index ?? node.start;
      const end = node.loc?.end?.index ?? node.end;
      const snippet = src
        .slice(start, Math.min(end, start + 220))
        .replace(/\n\s+/g, " ")
        .trim();
      const sample = { file: rel, line, kind: arg?.type ?? "none", snippet };
      if (!arg || arg.type !== "ObjectExpression") {
        if (arg?.type === "ObjectExpression") {
          return;
        }
        buckets["non-object arg (variable/identifier)"].push(sample);
        return;
      }
      // arg is object expression - check for spread, dynamic id
      let bucket = "";
      let idProp: any;
      for (const p of arg.properties) {
        if (p.type === "SpreadElement") {
          bucket = "spread element in arg";
          break;
        }
        if (p.type === "ObjectProperty" && propName(p.key) === "id") idProp = p;
      }
      if (!bucket) {
        if (!idProp) return; // skip - no id at all
        const v = idProp.value;
        if (v.type === "StringLiteral") return; // static, not dynamic
        if (v.type === "TemplateLiteral") {
          if (v.expressions.length === 0) return; // static template
          bucket = "id is template literal with interpolation";
        } else if (v.type === "Identifier") {
          bucket = "id is variable / identifier";
        } else if (
          v.type === "ConditionalExpression" ||
          v.type === "LogicalExpression"
        ) {
          bucket = "id is conditional / logical expression";
        } else if (
          v.type === "MemberExpression" ||
          v.type === "OptionalMemberExpression"
        ) {
          bucket = "id is member expression";
        } else if (v.type === "CallExpression") {
          bucket = "id is function call";
        } else bucket = "other dynamic";
      }
      buckets[bucket].push(sample);
    });
  }
}

for (const [k, arr] of Object.entries(buckets)) {
  console.log(`\n## ${k}  (total: ${arr.length})`);
  for (const s of arr.slice(0, 100)) {
    console.log(`  ${s.file}:${s.line}`);
    console.log(`    ${s.snippet}`);
  }
}
