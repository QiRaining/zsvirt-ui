const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const scriptPath = path.join(__dirname, "replace-defaultmessage.cjs");
const {
  extractAndReplace,
  getDefaultAppsDir,
  getDefaultScanDirs,
} = require(scriptPath);

function runScript(args, env) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: path.resolve(__dirname, "../../.."),
    env: {
      ...process.env,
      ...env,
    },
    encoding: "utf-8",
  });
}

test("replaces Chinese defaultMessage values in ZSV apps and shared directories", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "zsv-i18n-"));
  const appsDir = path.join(tempDir, "apps");
  const sharedDir = path.join(tempDir, "shared");
  fs.mkdirSync(appsDir, { recursive: true });
  fs.mkdirSync(sharedDir, { recursive: true });

  const source =
    'const label = intl.formatMessage({ id: "about.introduction.service", defaultMessage: "提供5x8小时，7x24小时售后专业技术支持。" });\n';
  const templateSource =
    "const label = intl.formatMessage({ defaultMessage: `切换语言`, id: \"toggle.language\" });\n";

  const appFile = path.join(appsDir, "app.tsx");
  const sharedFile = path.join(sharedDir, "shared.tsx");
  fs.writeFileSync(appFile, source);
  fs.writeFileSync(sharedFile, templateSource);

  const result = runScript(["zsv"], {
    ZSV_APP_DIR: appsDir,
    ZSV_SHARED_DIR: sharedDir,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(
    fs.readFileSync(appFile, "utf-8"),
    /defaultMessage: "Provides 5x8 and 7x24 hour after-sales technical support\."/,
  );
  assert.match(
    fs.readFileSync(sharedFile, "utf-8"),
    /defaultMessage: `Switch Language`/,
  );
});

test("resolves current ZSphere monorepo default scan directories", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "zsv-i18n-root-"));
  const productDir = path.join(tempDir, "packages", "products", "zsv");
  const appsDir = path.join(tempDir, "zsphere", "apps");
  const sharedDir = path.join(tempDir, "zsphere", "shared");
  const uiConfigDir = path.join(tempDir, "zsphere", "bff", "src", "ui-config");

  fs.mkdirSync(appsDir, { recursive: true });
  fs.mkdirSync(sharedDir, { recursive: true });
  fs.mkdirSync(uiConfigDir, { recursive: true });

  assert.equal(getDefaultAppsDir(tempDir, "zsv"), appsDir);
  assert.deepEqual(
    getDefaultScanDirs({
      projectRoot: tempDir,
      product: "zsv",
      productDir,
    }),
    [appsDir, sharedDir, uiConfigDir],
  );
});

test("replaces JSON i18n defaultMessage values with English locale values", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "zsv-i18n-json-"));
  const configFile = path.join(tempDir, "table.json");
  fs.writeFileSync(
    configFile,
    JSON.stringify(
      {
        meta: {
          i18n: {
            id: "name",
            defaultMessage: "名称",
          },
        },
      },
      null,
      2,
    ),
  );

  const result = runScript(["zsv"], {
    ZSV_SCAN_DIRS: tempDir,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
  assert.equal(config.meta.i18n.defaultMessage, "Name");
});

test("warns when a Chinese defaultMessage has no English mapping", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "zsv-i18n-missing-"));
  const sourceFile = path.join(tempDir, "missing.tsx");
  fs.writeFileSync(
    sourceFile,
    'const label = intl.formatMessage({ id: "missing.test.key", defaultMessage: "缺失映射" });\n',
  );

  const result = runScript(["zsv"], {
    ZSV_SCAN_DIRS: tempDir,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(
    result.stdout,
    /missing\.tsx: id="missing\.test\.key" has no English mapping/,
  );
  assert.match(fs.readFileSync(sourceFile, "utf-8"), /缺失映射/);
});

test("extractAndReplace handles descriptor property order without touching missing keys", () => {
  const englishDict = {
    "toggle.language": "Switch Language",
  };
  const source =
    "const label = intl.formatMessage({ defaultMessage: '切换语言', id: 'toggle.language' });\n" +
    "const missing = intl.formatMessage({ defaultMessage: '缺失映射', id: 'missing.test.key' });\n";

  const result = extractAndReplace(source, englishDict, "example.tsx");

  assert.equal(result.replacements.length, 1);
  assert.equal(result.unmapped.length, 1);
  assert.match(result.content, /defaultMessage: 'Switch Language'/);
  assert.match(result.content, /defaultMessage: '缺失映射'/);
});
