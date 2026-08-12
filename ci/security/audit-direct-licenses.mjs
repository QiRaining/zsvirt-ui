#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, "../..");
const policyPath = path.join(scriptDirectory, "gpl3-license-policy.json");
const lockfilePath = path.join(workspaceRoot, "pnpm-lock.yaml");
const rootManifestPath = path.join(workspaceRoot, "package.json");

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const jsonOutput = args.includes("--json");
const outputIndex = args.indexOf("--output");
const outputPath =
  outputIndex === -1
    ? undefined
    : path.resolve(workspaceRoot, args[outputIndex + 1]);

if (outputIndex !== -1 && !args[outputIndex + 1]) {
  console.error("ERROR: --output requires a path");
  process.exit(2);
}

const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
const rootManifest = JSON.parse(fs.readFileSync(rootManifestPath, "utf8"));
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const pnpmList = spawnSync(
  pnpmCommand,
  ["list", "-r", "--depth", "0", "--json"],
  {
    cwd: workspaceRoot,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
    maxBuffer: 32 * 1024 * 1024,
  },
);

if (pnpmList.status !== 0) {
  process.stderr.write(pnpmList.stderr || pnpmList.stdout);
  console.error(
    "ERROR: unable to resolve direct dependencies; run pnpm install --frozen-lockfile first",
  );
  process.exit(pnpmList.status || 1);
}

const projects = JSON.parse(pnpmList.stdout);
const workspacePaths = new Set(
  projects.map((project) => path.resolve(project.path)),
);
const dependencies = new Map();

function addDependency({
  dependencyName,
  dependencyType,
  manifest,
  projectName,
  requestedRange,
}) {
  const key = `${dependencyName}@${manifest?.version || "UNRESOLVED"}`;
  const existing = dependencies.get(key) || {
    name: dependencyName,
    version: manifest?.version || "UNRESOLVED",
    declaredLicense:
      typeof manifest?.license === "string" ? manifest.license : null,
    production: false,
    development: false,
    optional: false,
    peer: false,
    unresolved: !manifest,
    projects: new Set(),
    requestedRanges: new Set(),
  };

  if (dependencyType === "devDependencies") {
    existing.development = true;
  } else if (dependencyType === "peerDependencies") {
    existing.peer = true;
  } else {
    existing.production = true;
  }
  if (dependencyType === "optionalDependencies") {
    existing.optional = true;
  }
  if (requestedRange) {
    existing.requestedRanges.add(requestedRange);
  }
  existing.projects.add(projectName);
  dependencies.set(key, existing);
}

function resolvePeerManifest(projectPath, dependencyName) {
  const requireFromProject = createRequire(
    path.join(projectPath, "package.json"),
  );

  try {
    const manifestPath = requireFromProject.resolve(
      `${dependencyName}/package.json`,
    );
    return {
      manifestPath,
      dependencyPath: path.dirname(manifestPath),
    };
  } catch {
    try {
      const entryPath = requireFromProject.resolve(dependencyName);
      let dependencyPath = path.dirname(entryPath);
      while (dependencyPath !== path.dirname(dependencyPath)) {
        const manifestPath = path.join(dependencyPath, "package.json");
        if (fs.existsSync(manifestPath)) {
          return { manifestPath, dependencyPath };
        }
        dependencyPath = path.dirname(dependencyPath);
      }
    } catch {
      return;
    }
  }

  return;
}

for (const project of projects) {
  const projectName =
    project.name || path.relative(workspaceRoot, project.path) || ".";
  const projectManifest = JSON.parse(
    fs.readFileSync(path.join(project.path, "package.json"), "utf8"),
  );

  for (const dependencyType of [
    "dependencies",
    "optionalDependencies",
    "devDependencies",
  ]) {
    for (const [dependencyName, dependency] of Object.entries(
      project[dependencyType] || {},
    )) {
      if (!dependency.path) {
        continue;
      }

      const dependencyPath = path.resolve(dependency.path);
      if (workspacePaths.has(dependencyPath)) {
        continue;
      }

      const manifestPath = path.join(dependencyPath, "package.json");
      if (!fs.existsSync(manifestPath)) {
        console.error(
          `ERROR: package metadata is missing for ${dependencyName}: ${manifestPath}`,
        );
        process.exit(1);
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      addDependency({
        dependencyName,
        dependencyType,
        manifest,
        projectName,
        requestedRange: projectManifest[dependencyType]?.[dependencyName],
      });
    }
  }

  for (const [dependencyName, requestedRange] of Object.entries(
    projectManifest.peerDependencies || {},
  )) {
    const resolved = resolvePeerManifest(project.path, dependencyName);
    if (!resolved) {
      addDependency({
        dependencyName,
        dependencyType: "peerDependencies",
        projectName,
        requestedRange,
      });
      continue;
    }

    const dependencyPath = path.resolve(resolved.dependencyPath);
    if (workspacePaths.has(dependencyPath)) {
      continue;
    }

    const manifest = JSON.parse(fs.readFileSync(resolved.manifestPath, "utf8"));
    addDependency({
      dependencyName,
      dependencyType: "peerDependencies",
      manifest,
      projectName,
      requestedRange,
    });
  }
}

function classify(dependency) {
  const packageKey = `${dependency.name}@${dependency.version}`;
  const packageOverride = policy.packageOverrides[packageKey];
  const effectiveLicense =
    packageOverride?.effectiveLicense || dependency.declaredLicense;
  const licensePolicy = effectiveLicense
    ? policy.licenses[effectiveLicense]
    : undefined;

  return {
    effectiveLicense: effectiveLicense || "NOASSERTION",
    status: packageOverride?.status || licensePolicy?.status || "review",
    reason:
      packageOverride?.reason ||
      licensePolicy?.reason ||
      "许可证缺失或尚未纳入 GPLv3 兼容性策略，需要人工和法务确认。",
  };
}

function usageOf(dependency) {
  const usage = [];
  if (dependency.production) {
    usage.push("prod");
  }
  if (dependency.development) {
    usage.push("dev");
  }
  if (dependency.optional) {
    usage.push("optional");
  }
  if (dependency.peer) {
    usage.push("peer");
  }
  return usage.join("+");
}

const rows = [...dependencies.values()]
  .map((dependency) => ({
    ...dependency,
    projects: [...dependency.projects].sort(),
    requestedRanges: [...dependency.requestedRanges].sort(),
    usage: usageOf(dependency),
    ...classify(dependency),
  }))
  .sort(
    (left, right) =>
      left.name.localeCompare(right.name) ||
      left.version.localeCompare(right.version),
  );

const statusOrder = ["compatible", "conditional", "incompatible", "review"];
const statusCounts = Object.fromEntries(
  statusOrder.map((status) => [
    status,
    rows.filter((row) => row.status === status).length,
  ]),
);

const report = {
  targetLicense: policy.targetLicense,
  repositoryLicense: rootManifest.license || "NOASSERTION",
  repositoryLicenseMatchesTarget: rootManifest.license === policy.targetLicense,
  lockfileSha256: createHash("sha256")
    .update(fs.readFileSync(lockfilePath))
    .digest("hex"),
  policySha256: createHash("sha256")
    .update(fs.readFileSync(policyPath))
    .digest("hex"),
  scope: {
    workspaceProjects: projects.length,
    uniqueDirectPackageVersions: rows.length,
    uniqueDirectPackageNames: new Set(rows.map((row) => row.name)).size,
    productionPackageVersions: rows.filter((row) => row.production).length,
    developmentPackageVersions: rows.filter((row) => row.development).length,
    peerPackageVersions: rows.filter((row) => row.peer).length,
  },
  statusCounts,
  dependencies: rows.map(({ projects: dependencyProjects, ...row }) => ({
    ...row,
    projects: dependencyProjects,
  })),
};

function escapeMarkdown(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function toMarkdown(value) {
  const lines = [
    "# Direct dependency license inventory",
    "",
    `Target project license: \`${value.targetLicense}\``,
    "",
    `Repository package license: \`${value.repositoryLicense}\``,
    "",
    `Lockfile SHA-256: \`${value.lockfileSha256}\``,
    "",
    `Policy SHA-256: \`${value.policySha256}\``,
    "",
    "Scope: third-party direct `dependencies`, `optionalDependencies`, `devDependencies`, and `peerDependencies` from every pnpm workspace project. Internal workspace links are excluded.",
    "",
    "## Summary",
    "",
    `- Workspace projects: ${value.scope.workspaceProjects}`,
    `- Unique direct package names: ${value.scope.uniqueDirectPackageNames}`,
    `- Unique direct package/version rows: ${value.scope.uniqueDirectPackageVersions}`,
    `- Production package/version rows: ${value.scope.productionPackageVersions}`,
    `- Development package/version rows: ${value.scope.developmentPackageVersions}`,
    `- Peer package/version rows: ${value.scope.peerPackageVersions}`,
    `- Compatible: ${value.statusCounts.compatible}`,
    `- Conditional: ${value.statusCounts.conditional}`,
    `- Incompatible: ${value.statusCounts.incompatible}`,
    `- Review required: ${value.statusCounts.review}`,
    "",
    "`conditional` means the license can be distributed with GPLv3 only after its additional notice/source/file-level obligations are implemented. `review` is not an approval.",
    "",
    "## Inventory",
    "",
    "| Package | Version | Declared ranges | Usage | Declared license | Effective license | Result | Workspace references | Reason |",
    "|---|---:|---|---|---|---|---|---:|---|",
  ];

  for (const dependency of value.dependencies) {
    lines.push(
      `| ${escapeMarkdown(dependency.name)} | ${escapeMarkdown(dependency.version)} | ${escapeMarkdown(dependency.requestedRanges.join(", ") || "-")} | ${escapeMarkdown(dependency.usage)} | ${escapeMarkdown(dependency.declaredLicense || "NOASSERTION")} | ${escapeMarkdown(dependency.effectiveLicense)} | ${escapeMarkdown(dependency.status)} | ${dependency.projects.length} | ${escapeMarkdown(dependency.reason)} |`,
    );
  }

  lines.push("");
  return lines.join("\n");
}

const rendered = jsonOutput
  ? `${JSON.stringify(report, null, 2)}\n`
  : toMarkdown(report);

if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, rendered);
  if (!jsonOutput) {
    const formatterCommand = path.join(
      workspaceRoot,
      "node_modules",
      ".bin",
      process.platform === "win32" ? "oxfmt.cmd" : "oxfmt",
    );
    const formatResult = spawnSync(
      formatterCommand,
      [
        outputPath,
        "--config",
        path.join(workspaceRoot, ".oxfmtrc.json"),
        "--no-error-on-unmatched-pattern",
      ],
      { cwd: workspaceRoot, encoding: "utf8" },
    );
    if (formatResult.status !== 0) {
      process.stderr.write(formatResult.stderr || formatResult.stdout);
      console.error("ERROR: unable to format the generated license report");
      process.exit(formatResult.status || 1);
    }
  }
  console.info(`Wrote ${path.relative(workspaceRoot, outputPath)}`);
} else if (checkOnly && !jsonOutput) {
  console.info(`Target license: ${report.targetLicense}`);
  console.info(`Repository license: ${report.repositoryLicense}`);
  console.info(
    `Direct dependencies: ${report.scope.uniqueDirectPackageNames} names, ${report.scope.uniqueDirectPackageVersions} package/version rows`,
  );
  console.info(
    `Compatible: ${statusCounts.compatible}; conditional: ${statusCounts.conditional}; incompatible: ${statusCounts.incompatible}; review: ${statusCounts.review}`,
  );
  for (const conditional of rows.filter(
    (row) => row.status === "conditional",
  )) {
    console.info(
      `- conditional: ${conditional.name}@${conditional.version} (${conditional.effectiveLicense})`,
    );
  }
} else {
  process.stdout.write(rendered);
}

if (checkOnly) {
  const blockers = rows.filter(
    (row) => row.status === "incompatible" || row.status === "review",
  );
  if (blockers.length > 0) {
    console.error(
      `GPLv3 license gate failed: ${statusCounts.incompatible} incompatible, ${statusCounts.review} review required.`,
    );
    for (const blocker of blockers) {
      console.error(
        `- ${blocker.name}@${blocker.version}: ${blocker.status} (${blocker.effectiveLicense})`,
      );
    }
    process.exit(1);
  }
  if (!report.repositoryLicenseMatchesTarget) {
    console.error(
      `GPLv3 license gate failed: repository package license is ${report.repositoryLicense}, expected ${report.targetLicense}.`,
    );
    process.exit(1);
  }
}
