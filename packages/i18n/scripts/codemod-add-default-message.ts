#!/usr/bin/env bun
/**
 * Codemod: 给所有 formatMessage({ id: "x.y" }) 调用补上 defaultMessage（默认取 en-US.json 中对应的值）。
 *
 * 用法:
 *   bun packages/i18n/scripts/codemod-add-default-message.ts            # 预览
 *   bun packages/i18n/scripts/codemod-add-default-message.ts --write    # 实际写盘
 *
 * 处理规则:
 *   - 解析每个 .ts / .tsx 源文件,找到所有 formatMessage({...}) 调用
 *   - 只处理第一个参数为对象字面量、且包含字符串 id 的形态
 *   - 若该对象已有 defaultMessage 字段则跳过
 *   - 否则在 id 属性之后插入 defaultMessage: "<en-US value>"
 *   - 字符串值使用双引号并对 `\\` 和 `"` 转义,保留 newline 字面量 \n
 *   - id 在 en-US.json 中不存在时跳过并打印警告
 *
 * 扫描范围:
 *   packages/products/zlr/shared/<any>/src
 *   packages/products/zlr/apps/<app>/src
 */

import fs from "fs";
import path from "path";

import { parse } from "@babel/parser";

const write = process.argv.includes("--write");
const replaceMismatch = process.argv.includes("--replace-mismatch");
const repoRoot = path.resolve(import.meta.dir, "../../..");
const zlrRoot = path.join(repoRoot, "packages/products/zlr");
const enLocalePath = path.join(
  repoRoot,
  "packages/i18n/src/zstack/zlr/locale/en-US.json",
);

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
const ignoredDirs = new Set([
  "node_modules",
  "dist",
  "build",
  "coverage",
  "lint_report",
  ".turbo",
]);

function flatten(
  value: Record<string, unknown>,
  prefix = "",
  output = new Map<string, string>(),
): Map<string, string> {
  for (const [key, child] of Object.entries(value)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      flatten(child as Record<string, unknown>, nextKey, output);
    } else {
      output.set(nextKey, String(child ?? ""));
    }
  }
  return output;
}

function collectFiles(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  const result: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) walk(fullPath);
        continue;
      }
      if (entry.isFile() && sourceExts.has(path.extname(entry.name))) {
        result.push(fullPath);
      }
    }
  };
  walk(root);
  return result.sort();
}

function appSourceRoots(): string[] {
  const roots: string[] = [];
  const sharedRoot = path.join(zlrRoot, "shared");
  if (fs.existsSync(sharedRoot)) {
    for (const entry of fs.readdirSync(sharedRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const src = path.join(sharedRoot, entry.name, "src");
      if (fs.existsSync(src)) roots.push(src);
    }
  }
  for (const name of appNames) {
    const src = path.join(zlrRoot, `apps/${name}/src`);
    if (fs.existsSync(src)) roots.push(src);
  }
  return roots;
}

function propertyName(p: any): string | undefined {
  if (!p) return undefined;
  if (p.type === "Identifier") return p.name;
  if (p.type === "StringLiteral") return p.value;
  return undefined;
}

function stringValue(n: any): string | undefined {
  if (!n) return undefined;
  if (n.type === "StringLiteral") return n.value;
  if (n.type === "TemplateLiteral" && n.expressions.length === 0) {
    return n.quasis.map((q: any) => q.value.cooked ?? "").join("");
  }
  return undefined;
}

function isFormatMessageCall(callee: any): boolean {
  if (!callee) return false;
  if (callee.type === "Identifier") return callee.name === "formatMessage";
  if (
    callee.type !== "MemberExpression" &&
    callee.type !== "OptionalMemberExpression"
  ) {
    return false;
  }
  return propertyName(callee.property) === "formatMessage";
}

function visit(node: any, visitor: (n: any) => void): void {
  if (!node || typeof node !== "object") return;
  visitor(node);
  for (const [key, value] of Object.entries(node)) {
    if (
      key === "loc" ||
      key === "start" ||
      key === "end" ||
      key === "leadingComments" ||
      key === "trailingComments" ||
      key === "innerComments"
    ) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const c of value) visit(c, visitor);
    } else if (value && typeof value === "object") {
      visit(value, visitor);
    }
  }
}

function quote(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")}"`;
}

interface Edit {
  start: number;
  end: number;
  insert: string;
}

function processFile(
  filePath: string,
  enMap: Map<string, string>,
  stats: {
    patched: number;
    replaced: number;
    skippedHasDefault: number;
    skippedNoId: number;
    skippedDynamic: number;
    skippedUnknownId: number;
    unknownIds: Set<string>;
  },
): boolean {
  const source = fs.readFileSync(filePath, "utf8");
  let ast;
  try {
    ast = parse(source, {
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
  } catch (e) {
    console.error(`parse error ${filePath}: ${(e as Error).message}`);
    return false;
  }

  const edits: Edit[] = [];

  visit(ast, (node) => {
    if (node.type !== "CallExpression") return;
    if (!isFormatMessageCall(node.callee)) return;
    const arg = node.arguments?.[0];
    if (!arg || arg.type !== "ObjectExpression") {
      stats.skippedDynamic += 1;
      return;
    }
    let idProperty: any;
    let defaultProperty: any;
    for (const prop of arg.properties) {
      if (prop.type !== "ObjectProperty") continue;
      const name = propertyName(prop.key);
      if (name === "id") idProperty = prop;
      if (name === "defaultMessage") defaultProperty = prop;
    }
    if (!idProperty) {
      stats.skippedNoId += 1;
      return;
    }
    const id = stringValue(idProperty.value);
    if (!id) {
      stats.skippedDynamic += 1;
      return;
    }
    const enValue = enMap.get(id);
    if (enValue === undefined) {
      stats.skippedUnknownId += 1;
      stats.unknownIds.add(id);
      return;
    }
    if (defaultProperty) {
      const currentDefault = stringValue(defaultProperty.value);
      if (!replaceMismatch || currentDefault === enValue) {
        stats.skippedHasDefault += 1;
        return;
      }
      // Replace the entire defaultMessage property value with the en-US value.
      edits.push({
        start: defaultProperty.value.start,
        end: defaultProperty.value.end,
        insert: quote(enValue),
      });
      stats.replaced += 1;
      return;
    }
    // Insert `, defaultMessage: "..."` right after the id property's end.
    const insertPos = idProperty.end;
    edits.push({
      start: insertPos,
      end: insertPos,
      insert: `, defaultMessage: ${quote(enValue)}`,
    });
    stats.patched += 1;
  });

  if (edits.length === 0) return false;

  // Apply from end to start to preserve offsets.
  edits.sort((a, b) => b.start - a.start);
  let result = source;
  for (const edit of edits) {
    result = result.slice(0, edit.start) + edit.insert + result.slice(edit.end);
  }

  if (write) {
    fs.writeFileSync(filePath, result, "utf8");
  }
  return true;
}

function main(): void {
  const enMap = flatten(JSON.parse(fs.readFileSync(enLocalePath, "utf8")));

  const stats = {
    patched: 0,
    replaced: 0,
    skippedHasDefault: 0,
    skippedNoId: 0,
    skippedDynamic: 0,
    skippedUnknownId: 0,
    unknownIds: new Set<string>(),
  };

  let modifiedFiles = 0;
  for (const root of appSourceRoots()) {
    for (const file of collectFiles(root)) {
      if (processFile(file, enMap, stats)) {
        modifiedFiles += 1;
      }
    }
  }

  console.log(
    `mode: ${write ? "WRITE" : "DRY-RUN"}${replaceMismatch ? " +replace-mismatch" : ""}`,
  );
  console.log(`modified files: ${modifiedFiles}`);
  console.log(`patched (added defaultMessage): ${stats.patched}`);
  console.log(`replaced (mismatch defaultMessage): ${stats.replaced}`);
  console.log(
    `skipped (already has defaultMessage): ${stats.skippedHasDefault}`,
  );
  console.log(
    `skipped (dynamic / spread / non-object arg): ${stats.skippedDynamic}`,
  );
  console.log(`skipped (no id key): ${stats.skippedNoId}`);
  console.log(`skipped (id not in en-US.json): ${stats.skippedUnknownId}`);
  if (stats.unknownIds.size > 0) {
    console.log("\nunknown ids (first 30):");
    [...stats.unknownIds]
      .sort()
      .slice(0, 30)
      .forEach((id) => console.log(`  - ${id}`));
    if (stats.unknownIds.size > 30) {
      console.log(`  ... ${stats.unknownIds.size - 30} more`);
    }
  }
}

main();
