#!/usr/bin/env node
/**
 * replace-defaultmessage.cjs
 *
 * 替换 ZSV/ZLR apps 中所有 formatMessage/MessageDescriptor 的 defaultMessage
 * 使用 i18n JSON (en-US.json) 中的英文值。
 *
 * 用法:
 *   node packages/i18n/scripts/replace-defaultmessage.cjs [product] [appsDir] [--dry-run]
 *
 * 参数:
 *   product   - 产品名 (默认: zsv, 可选: zlr)
 *   appsDir   - apps 目录路径 (默认: 从项目根目录推导)
 *   --dry-run - 仅打印不修改文件
 *
 * 环境变量:
 *   ZSV_APP_DIR     - 覆盖 apps 目录
 *   ZSV_SHARED_DIR  - 覆盖 shared 目录（仅在同时设置 ZSV_APP_DIR 时生效）
 *   ZSV_SCAN_DIRS   - 覆盖扫描目录，多个目录用系统 path delimiter 分隔
 *   I18N_PRODUCT    - 覆盖产品名
 */

const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const CONFIG_EXTENSIONS = new Set([".json"]);
const SKIPPED_DIRECTORIES = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".nx",
  "target",
  ".turbo",
  "graphify-out",
  "__pycache__",
]);

// ========== 配置解析 ==========

function getConfig() {
  const args = process.argv.slice(2);

  // 从环境变量读取（优先级最高，来自 BFF）
  let product = process.env.I18N_PRODUCT || "zsv";
  let appsDir = process.env.ZSV_APP_DIR || null;
  let dryRun = false;
  const positionalArgs = [];

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") {
      dryRun = true;
    } else if (!args[i].startsWith("--")) {
      positionalArgs.push(args[i]);
    }
  }

  if (positionalArgs[0]) {
    product = positionalArgs[0];
  }

  // 推导项目根目录和 apps 路径
  const projectRoot = findProjectRoot();
  const productDir = getProductDir(projectRoot, product);

  if (!appsDir) {
    appsDir = positionalArgs[1] || getDefaultAppsDir(projectRoot, product);
  }

  const scanDirs = getScanDirs({
    projectRoot,
    product,
    appsDir,
    productDir,
    sharedDir: process.env.ZSV_SHARED_DIR || null,
    hasAppDirOverride: Boolean(process.env.ZSV_APP_DIR || positionalArgs[1]),
  });

  return {
    product,
    appsDir,
    scanDirs,
    dryRun,
    projectRoot,
    i18nPath: path.join(
      projectRoot,
      "packages",
      "i18n",
      "src",
      "zstack",
      product,
      "locale",
    ),
  };
}

function toAbsolutePath(projectRoot, dir) {
  return path.isAbsolute(dir) ? dir : path.join(projectRoot, dir);
}

function uniqueExistingDirs(dirs) {
  return [...new Set(dirs)].filter((dir) => fs.existsSync(dir));
}

function getProductDir(projectRoot, product) {
  return path.join(
    projectRoot,
    "packages",
    "products",
    product === "zlr" ? "zlr" : "zsv",
  );
}

function getDefaultAppsDir(projectRoot, product) {
  const zsphereAppsDir = path.join(projectRoot, "zsphere", "apps");
  if (product === "zsv" && fs.existsSync(zsphereAppsDir)) {
    return zsphereAppsDir;
  }

  return path.join(getProductDir(projectRoot, product), "apps");
}

function getDefaultScanDirs({ projectRoot, product, productDir }) {
  if (product === "zsv") {
    return uniqueExistingDirs([
      path.join(projectRoot, "zsphere", "apps"),
      path.join(projectRoot, "zsphere", "shared"),
      path.join(projectRoot, "zsphere", "bff", "src", "ui-config"),
      path.join(productDir, "apps"),
      path.join(productDir, "shared"),
    ]);
  }

  return uniqueExistingDirs([
    path.join(productDir, "apps"),
    path.join(productDir, "shared"),
  ]);
}

function getScanDirs({
  projectRoot,
  product,
  appsDir,
  productDir,
  sharedDir,
  hasAppDirOverride,
}) {
  if (process.env.ZSV_SCAN_DIRS) {
    return uniqueExistingDirs(
      process.env.ZSV_SCAN_DIRS.split(path.delimiter)
        .filter(Boolean)
        .map((dir) => toAbsolutePath(projectRoot, dir)),
    );
  }

  if (hasAppDirOverride) {
    return uniqueExistingDirs(
      [appsDir, sharedDir]
        .filter(Boolean)
        .map((dir) => toAbsolutePath(projectRoot, dir)),
    );
  }

  return getDefaultScanDirs({ projectRoot, product, productDir });
}

function findProjectRoot(startDir = __dirname) {
  let current = startDir;
  const root = path.parse(current).root;
  while (current !== root) {
    if (fs.existsSync(path.join(current, "package.json"))) {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(current, "package.json"), "utf-8"),
      );
      if (pkg.name === "@zstack/ui-next" || pkg.name === "@zsphere/ui") {
        return current;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  throw new Error("Cannot find project root");
}

// ========== i18n JSON 解析 ==========

function loadEnglishDict(i18nPath) {
  const enPath = path.join(i18nPath, "en-US.json");

  if (!fs.existsSync(enPath)) {
    console.error(`❌ English locale not found: ${enPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(enPath, "utf-8");
  return JSON.parse(content);
}

// ========== CJK 检测 ==========

function isChineseText(text) {
  // CJK Unified Ideographs + extensions
  const cjkPattern = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufa2f]/;
  return cjkPattern.test(text);
}

function getEnglishValue(englishDict, msgId) {
  let englishValue = englishDict[msgId];
  if (!englishValue && msgId.includes(".")) {
    const normalized = msgId.replace(/^\.*/, "").replace(/\.$/, "");
    englishValue = englishDict[normalized] || englishDict[`.${normalized}`];
  }

  return typeof englishValue === "string" ? englishValue : undefined;
}

// ========== TypeScript 文件解析和替换 ==========

function extractTsAndReplace(content, englishDict, filePath) {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const edits = [];
  const replacements = [];
  const unmapped = [];

  function visit(node) {
    if (!ts.isObjectLiteralExpression(node)) {
      ts.forEachChild(node, visit);
      return;
    }

    let idNode = null;
    let defaultMessageNode = null;

    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) {
        continue;
      }

      const propertyName = getPropertyNameText(property.name);
      if (propertyName === "id") {
        idNode = property.initializer;
      } else if (propertyName === "defaultMessage") {
        defaultMessageNode = property.initializer;
      }
    }

    if (
      idNode &&
      defaultMessageNode &&
      isStaticStringNode(idNode) &&
      isStaticStringNode(defaultMessageNode)
    ) {
      const msgId = idNode.text.trim();
      const msgText = defaultMessageNode.text.trim();

      if (msgId && msgText && isChineseText(msgText)) {
        const englishValue = getEnglishValue(englishDict, msgId);

        if (englishValue) {
          edits.push({
            start: defaultMessageNode.getStart(sourceFile),
            end: defaultMessageNode.getEnd(),
            text: toStringLiteral(defaultMessageNode, englishValue, sourceFile),
          });
          replacements.push({
            id: msgId,
            original: msgText,
            replacement: englishValue,
          });
        } else {
          unmapped.push({ id: msgId, original: msgText });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    content: applyTextEdits(content, edits),
    modified: edits.length > 0,
    replacements,
    unmapped,
  };
}

function extractJsonAndReplace(content, englishDict) {
  const data = JSON.parse(content);
  let modified = false;
  const replacements = [];
  const unmapped = [];

  function visit(value) {
    if (!value || typeof value !== "object") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    const msgId =
      typeof value.id === "string"
        ? value.id
        : typeof value.i18nKey === "string"
          ? value.i18nKey
          : "";
    const msgText =
      typeof value.defaultMessage === "string" ? value.defaultMessage : "";

    if (msgId && msgText && isChineseText(msgText)) {
      const englishValue = getEnglishValue(englishDict, msgId);

      if (englishValue) {
        value.defaultMessage = englishValue;
        replacements.push({
          id: msgId,
          original: msgText,
          replacement: englishValue,
        });
        modified = true;
      } else {
        unmapped.push({ id: msgId, original: msgText });
      }
    }

    Object.values(value).forEach(visit);
  }

  visit(data);

  return {
    content: modified ? `${JSON.stringify(data, null, 2)}\n` : content,
    modified,
    replacements,
    unmapped,
  };
}

function extractAndReplace(content, englishDict, filePath) {
  const ext = path.extname(filePath);
  if (CONFIG_EXTENSIONS.has(ext)) {
    return extractJsonAndReplace(content, englishDict);
  }

  return extractTsAndReplace(content, englishDict, filePath);
}

function getPropertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text;
  }

  return;
}

function isStaticStringNode(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeStringLiteralValue(value, quote) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(new RegExp(escapeRegex(quote), "g"), `\\${quote}`)
    .replace(/\r?\n/g, "\\n");
}

function escapeTemplateLiteralValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
}

function toStringLiteral(node, value, sourceFile) {
  const original = node.getText(sourceFile);
  const quote = original[0] === "'" ? "'" : original[0] === "`" ? "`" : '"';

  if (quote === "`") {
    return `\`${escapeTemplateLiteralValue(value)}\``;
  }

  return `${quote}${escapeStringLiteralValue(value, quote)}${quote}`;
}

function applyTextEdits(content, edits) {
  return edits
    .sort((a, b) => b.start - a.start)
    .reduce(
      (result, edit) =>
        result.slice(0, edit.start) + edit.text + result.slice(edit.end),
      content,
    );
}

// ========== 文件扫描和批量替换 ==========

function scanFiles(scanDirs) {
  const files = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) {
      return;
    }

    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (SKIPPED_DIRECTORIES.has(entry)) {
          continue;
        }
        walk(fullPath);
      } else if (
        SOURCE_EXTENSIONS.has(path.extname(entry)) ||
        CONFIG_EXTENSIONS.has(path.extname(entry))
      ) {
        files.push(fullPath);
      }
    }
  }

  const dirs = Array.isArray(scanDirs) ? scanDirs : [scanDirs];
  dirs.forEach((dir) => walk(dir));
  return files;
}

function getRelativePath(filePath, scanDirs) {
  const dirs = Array.isArray(scanDirs) ? scanDirs : [scanDirs];
  const root = dirs.find((dir) => filePath.startsWith(`${dir}${path.sep}`));

  return root ? path.relative(root, filePath) : filePath;
}

// ========== 主逻辑 ==========

function main() {
  const config = getConfig();

  console.info("🔍 ZSV/i18n defaultMessage English replacement");
  console.info("=".repeat(60));
  console.info(`Product:    ${config.product}`);
  console.info("Scan dirs:");
  config.scanDirs.forEach((dir) => console.info(`  - ${dir}`));
  console.info(`I18N path:  ${config.i18nPath}`);
  if (config.dryRun) {
    console.info("Mode:       DRY RUN (no files modified)");
  }
  console.info();

  // Load English dictionary
  const englishDict = loadEnglishDict(config.i18nPath);
  const totalKeys = Object.keys(englishDict).length;
  console.info(
    `📖 Loaded ${totalKeys.toLocaleString()} i18n keys from en-US.json`,
  );
  console.info();

  // Scan files
  const files = scanFiles(config.scanDirs);
  console.info(`📁 Found ${files.length} .ts/.tsx/.json files to scan`);
  console.info();

  // Process each file
  let totalReplacements = 0;
  let modifiedFileCount = 0;
  const statsByApp = {};
  const unmappedWarningSet = new Set();

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");

      // Quick check if file has any defaultMessage reference with Chinese
      if (!/defaultMessage/.test(content)) {
        continue;
      }

      // Perform replacement
      const result = extractAndReplace(content, englishDict, filePath);

      for (const item of result.unmapped) {
        const warningKey = `${filePath}:${item.id}`;
        if (!unmappedWarningSet.has(warningKey)) {
          unmappedWarningSet.add(warningKey);
          console.info(
            `⚠️   ${getRelativePath(filePath, config.scanDirs)}: id="${item.id}" has no English mapping`,
          );
        }
      }

      if (result.replacements.length === 0) {
        continue;
      }

      // Write modified content (or simulate in dry-run mode)
      if (!config.dryRun) {
        fs.writeFileSync(filePath, result.content, "utf-8");
      }

      const fileRel = getRelativePath(filePath, config.scanDirs);
      const app = fileRel.split("/")[0];
      statsByApp[app] = (statsByApp[app] || 0) + result.replacements.length;

      totalReplacements += result.replacements.length;
      modifiedFileCount++;

      console.info(
        `✅ ${fileRel}: replaced ${result.replacements.length} Chinese messages`,
      );
    } catch (error) {
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
    }
  }

  // Print summary
  console.info();
  console.info("=".repeat(60));
  console.info("📊 SUMMARY");
  console.info("=".repeat(60));

  console.info(`Files processed:     ${modifiedFileCount}`);
  console.info(`Total replacements:  ${totalReplacements.toLocaleString()}`);

  if (Object.keys(statsByApp).length > 0) {
    console.info();
    console.info("Per-app breakdown:");
    Object.entries(statsByApp)
      .sort((a, b) => b[1] - a[1])
      .forEach(([app, count]) => {
        console.info(`  ${app}: ${count.toLocaleString()}`);
      });
  }

  if (unmappedWarningSet.size > 0) {
    console.info();
    console.info(
      `⚠️   ${unmappedWarningSet.size} Chinese defaultMessage(s) could not be mapped to English`,
    );
  }

  if (config.dryRun) {
    console.info();
    console.info(
      "⚠️  This was a dry run. Use without --dry-run to apply changes.",
    );
  }

  // Exit with error code if there were unmapped Chinese messages (optional warning)
  process.exit(0);
}

if (require.main !== module) {
  module.exports = {
    extractAndReplace,
    extractJsonAndReplace,
    extractTsAndReplace,
    findProjectRoot,
    getDefaultAppsDir,
    getDefaultScanDirs,
    getScanDirs,
    isChineseText,
  };
} else {
  main();
}
