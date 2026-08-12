import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const groups = [
  {
    label: "icons",
    assetDir: "src/assets/icons",
    outputFile: "src/icons.ts",
    prefix: "Icon",
    importDir: "icons",
  },
  {
    label: "app-icons",
    assetDir: "src/assets/app-icons",
    outputFile: "src/app-icons.ts",
    prefix: "AppIcon",
    importDir: "app-icons",
  },
  {
    label: "illus-icons",
    assetDir: "src/assets/illus-icons",
    outputFile: "src/illus-icons.ts",
    prefix: "IllusIcon",
    importDir: "illus-icons",
  },
];

const mappingGroups = [
  {
    label: "icons-mapping",
    componentFile: "src/icons.ts",
    outputFile: "src/icons-mapping.ts",
    prefix: "Icon",
    importPath: "./icons",
    exportName: "Icons",
  },
  {
    label: "app-icons-mapping",
    componentFile: "src/app-icons.ts",
    outputFile: "src/app-icons-mapping.ts",
    prefix: "AppIcon",
    importPath: "./app-icons",
    exportName: "AppIcons",
  },
];

const toPascalCase = (name) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const toKebabCase = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z])(\d)/g, "$1-$2")
    .replace(/(\d)([a-z])/gi, "$1-$2")
    .toLowerCase();

const readSvgFiles = (assetDir) =>
  readdirSync(path.join(rootDir, assetDir))
    .filter((file) => file.endsWith(".svg"))
    .sort((a, b) => a.localeCompare(b));

const normalizeGeneratedContent = (content) =>
  content.replace(/\s+/g, "").replace(/,\)/g, ")");

const extractExportedNames = (content, prefix) => {
  const constExportRegex = new RegExp(
    `export\\s+const\\s+(${prefix}\\w+)\\s*:`,
    "g",
  );

  return [...content.matchAll(constExportRegex)]
    .map((match) => match[1])
    .sort((a, b) => a.localeCompare(b));
};

const expectedContent = ({ assetDir, prefix, importDir }) => {
  const iconFiles = readSvgFiles(assetDir);
  const imports = iconFiles
    .map((file) => {
      const componentName = `${prefix}${toPascalCase(file.replace(/\.svg$/, ""))}`;
      return `import ${componentName}Svg from "./assets/${importDir}/${file}?react";`;
    })
    .join("\n");
  const exports = iconFiles
    .map((file) => {
      const componentName = `${prefix}${toPascalCase(file.replace(/\.svg$/, ""))}`;
      return `export const ${componentName}: IconComponent =
  /* @__PURE__ */ createIconComponent(${componentName}Svg);`;
    })
    .join("\n");

  return `// 此文件由脚本自动生成，请勿手动修改

${imports}
import { createIconComponent } from "./icon-component";
import type { IconComponent } from "./icon-component";

${exports}
`;
};

const expectedMappingContent = ({
  componentFile,
  prefix,
  importPath,
  exportName,
}) => {
  const componentContent = readFileSync(
    path.join(rootDir, componentFile),
    "utf8",
  );
  const iconNames = extractExportedNames(componentContent, prefix);
  const imports = iconNames.map((iconName) => `  ${iconName},`).join("\n");
  const iconsObject = iconNames
    .map((iconName) => {
      const iconKey = toKebabCase(
        iconName.replace(new RegExp(`^${prefix}`), ""),
      );
      return `  "${iconKey}": ${iconName},`;
    })
    .join("\n");

  return `// 此文件由脚本自动生成，请勿手动修改
// 来源: @zstack/icon

import {
${imports}
} from "${importPath}";
import type { IconComponent } from "./icon-component";

export const ${exportName} = {
${iconsObject}
} satisfies Record<string, IconComponent>;
`;
};

let failed = false;

for (const group of groups) {
  const outputPath = path.join(rootDir, group.outputFile);

  if (!existsSync(outputPath)) {
    console.error(`[icon:exports] missing ${group.outputFile}`);
    failed = true;
    continue;
  }

  const actual = readFileSync(outputPath, "utf8");
  const expected = expectedContent(group);

  if (
    normalizeGeneratedContent(actual) !== normalizeGeneratedContent(expected)
  ) {
    console.error(
      `[icon:exports] ${group.outputFile} is stale. Run "pnpm --filter @zstack/icon gen".`,
    );
    failed = true;
  } else {
    const count = readSvgFiles(group.assetDir).length;
    console.log(`[icon:exports] ${group.label}: ${count} exports ok`);
  }
}

for (const group of mappingGroups) {
  const outputPath = path.join(rootDir, group.outputFile);

  if (!existsSync(outputPath)) {
    console.error(`[icon:exports] missing ${group.outputFile}`);
    failed = true;
    continue;
  }

  const actual = readFileSync(outputPath, "utf8");
  const expected = expectedMappingContent(group);

  if (
    normalizeGeneratedContent(actual) !== normalizeGeneratedContent(expected)
  ) {
    console.error(
      `[icon:exports] ${group.outputFile} is stale. Run "pnpm --filter @zstack/icon gen".`,
    );
    failed = true;
  } else {
    console.log(`[icon:exports] ${group.label}: mapping ok`);
  }
}

if (failed) {
  process.exit(1);
}
