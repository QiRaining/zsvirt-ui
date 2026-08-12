// @ts-nocheck
/**
 * 此脚本用于从 @zstack/icon 包内 SVG 资产生成：
 * - icons.ts / app-icons.ts / illus-icons.ts 具名 React 组件导出
 * - icons-mapping.ts / app-icons-mapping.ts 字符串 type 映射
 */
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type IconGroup = {
  assetDir: string;
  outputFile: string;
  prefix: "Icon" | "AppIcon" | "IllusIcon";
  importDir: string;
};

const groups: IconGroup[] = [
  {
    assetDir: "./src/assets/icons",
    outputFile: "./src/icons.ts",
    prefix: "Icon",
    importDir: "icons",
  },
  {
    assetDir: "./src/assets/app-icons",
    outputFile: "./src/app-icons.ts",
    prefix: "AppIcon",
    importDir: "app-icons",
  },
  {
    assetDir: "./src/assets/illus-icons",
    outputFile: "./src/illus-icons.ts",
    prefix: "IllusIcon",
    importDir: "illus-icons",
  },
];

// 将 PascalCase 转换为 kebab-case
const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z])(\d)/g, "$1-$2")
    .replace(/(\d)([a-z])/gi, "$1-$2")
    .toLowerCase();
};

// 将 kebab-case 转换为 PascalCase
const toPascalCase = (str: string): string => {
  return str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
};

const extractExportedNames = (content: string, prefix: string): string[] => {
  const constExportRegex = new RegExp(
    `export\\s+const\\s+(${prefix}\\w+)\\s*:`,
    "g",
  );
  const names = [...content.matchAll(constExportRegex)].map(
    (match) => match[1],
  );

  return names.sort((a, b) => a.localeCompare(b));
};

function generateComponentExports({
  assetDir,
  outputFile,
  prefix,
  importDir,
}: IconGroup) {
  const assetPath = path.resolve(__dirname, assetDir);
  const outputPath = path.resolve(__dirname, outputFile);
  const iconFiles = fs
    .readdirSync(assetPath)
    .filter((file) => file.endsWith(".svg"))
    .sort((a, b) => a.localeCompare(b));

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

  const output = `// 此文件由脚本自动生成，请勿手动修改

${imports}
import { createIconComponent } from "./icon-component";
import type { IconComponent } from "./icon-component";

${exports}
`;

  fs.writeFileSync(outputPath, output, "utf-8");
  console.log(
    `✅ 已生成 ${path.basename(outputFile)} (${iconFiles.length} 个图标)`,
  );
}

// 生成 icons-mapping.ts（普通图标）
function generateIconsMapping() {
  const iconsPath = path.resolve(__dirname, "./src/icons.ts");
  const iconsContent = fs.readFileSync(iconsPath, "utf-8");
  const iconNames = extractExportedNames(iconsContent, "Icon");

  if (iconNames.length === 0) {
    console.error("❌ 未找到任何图标导出");
    return;
  }

  const imports = iconNames.map((iconName) => `  ${iconName},`).join("\n");
  const iconsObject = iconNames
    .map((iconName) => {
      const iconKey = toKebabCase(iconName.replace(/^Icon/, ""));
      return `  "${iconKey}": ${iconName},`;
    })
    .join("\n");

  const output = `// 此文件由脚本自动生成，请勿手动修改
// 来源: @zstack/icon

import {
${imports}
} from "./icons";
import type { IconComponent } from "./icon-component";

export const Icons = {
${iconsObject}
} satisfies Record<string, IconComponent>;
`;

  const outputPath = path.resolve(__dirname, "./src/icons-mapping.ts");
  fs.writeFileSync(outputPath, output, "utf-8");
  console.log(`✅ 已生成 icons-mapping.ts (${iconNames.length} 个图标)`);
}

// 生成 app-icons-mapping.ts（应用图标）
function generateAppIconsMapping() {
  const appIconsPath = path.resolve(__dirname, "./src/app-icons.ts");
  const appIconsContent = fs.readFileSync(appIconsPath, "utf-8");
  const appIconNames = extractExportedNames(appIconsContent, "AppIcon");

  if (appIconNames.length === 0) {
    console.error("❌ 未找到任何应用图标导出");
    return;
  }

  const imports = appIconNames
    .map((appIconName) => `  ${appIconName},`)
    .join("\n");
  const appIconsObject = appIconNames
    .map((appIconName) => {
      const appIconKey = toKebabCase(appIconName.replace(/^AppIcon/, ""));
      return `  "${appIconKey}": ${appIconName},`;
    })
    .join("\n");

  const output = `// 此文件由脚本自动生成，请勿手动修改
// 来源: @zstack/icon

import {
${imports}
} from "./app-icons";
import type { IconComponent } from "./icon-component";

export const AppIcons = {
${appIconsObject}
} satisfies Record<string, IconComponent>;
`;

  const outputPath = path.resolve(__dirname, "./src/app-icons-mapping.ts");
  fs.writeFileSync(outputPath, output, "utf-8");
  console.log(
    `✅ 已生成 app-icons-mapping.ts (${appIconNames.length} 个应用图标)`,
  );
}

function main() {
  console.log("🚀 开始从 @zstack/icon SVG 资产生成图标文件...\n");

  try {
    for (const group of groups) {
      generateComponentExports(group);
    }
    generateIconsMapping();
    generateAppIconsMapping();
    console.log("\n✨ 所有图标文件生成完成！");
  } catch (error) {
    console.error("\n❌ 生成失败:", error);
    process.exit(1);
  }
}

main();
