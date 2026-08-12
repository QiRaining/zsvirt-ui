#!/usr/bin/env bun

import fs from "fs";
import path from "path";

/**
 * 将翻译好的 *-trans.json 合并到对应的语言文件中
 *
 * 使用方法:
 *   bun packages/i18n/scripts/merge-translations.ts
 *
 * 可选参数:
 *   --lang=zh-TW  只合并指定语言
 *   --dry-run     预览模式，不实际写入
 */

const scriptDir = import.meta.dir;
const localeDir = path.resolve(scriptDir, "../src/zstack/cloud/locale");

// 支持的语言列表
const languages = [
  "zh-TW",
  "de-DE",
  "th-TH",
  "ru-RU",
  "ko-KR",
  "ja-JP",
  "id-ID",
  "fr-FR",
];

interface LocaleData {
  [key: string]: string;
}

/**
 * 读取 JSON 文件
 */
function readJsonFile(filename: string): LocaleData | null {
  const filePath = path.join(localeDir, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * 写入 JSON 文件
 */
function writeJsonFile(filename: string, data: LocaleData): void {
  const filePath = path.join(localeDir, filename);
  // 按 key 排序
  const sortedData: LocaleData = {};
  Object.keys(data)
    .sort()
    .forEach((key) => {
      sortedData[key] = data[key];
    });
  fs.writeFileSync(
    filePath,
    JSON.stringify(sortedData, null, 2) + "\n",
    "utf-8",
  );
}

/**
 * 合并单个语言的翻译
 */
function mergeLanguage(
  lang: string,
  dryRun: boolean,
): { merged: number; skipped: number } {
  const mainFile = `${lang}.json`;
  const transFile = `${lang}-trans.json`;

  console.log(`\n📝 处理 ${lang}...`);

  // 读取主语言文件
  const mainData = readJsonFile(mainFile);
  if (!mainData) {
    console.log(`  ❌ 主文件 ${mainFile} 不存在`);
    return { merged: 0, skipped: 0 };
  }

  // 读取翻译文件
  const transData = readJsonFile(transFile);
  if (!transData) {
    console.log(`  ℹ️ 翻译文件 ${transFile} 不存在，跳过`);
    return { merged: 0, skipped: 0 };
  }

  const transCount = Object.keys(transData).length;
  console.log(`  📖 读取翻译文件: ${transCount} 条`);

  // 合并翻译
  let merged = 0;
  let skipped = 0;

  for (const key in transData) {
    if (mainData[key]) {
      // 已存在，跳过
      skipped++;
    } else {
      // 新增翻译
      mainData[key] = transData[key];
      merged++;
    }
  }

  console.log(`  ✅ 合并: ${merged} 条新增, ${skipped} 条跳过（已存在）`);

  if (merged > 0 && !dryRun) {
    writeJsonFile(mainFile, mainData);
    console.log(`  💾 已写入 ${mainFile}`);
  } else if (dryRun && merged > 0) {
    console.log(`  🔍 [预览模式] 将写入 ${mainFile}`);
  }

  return { merged, skipped };
}

/**
 * 清理翻译文件
 */
function cleanupTransFiles(lang: string, dryRun: boolean): void {
  const transFile = `${lang}-trans.json`;
  const transPath = path.join(localeDir, transFile);

  if (fs.existsSync(transPath)) {
    if (!dryRun) {
      fs.unlinkSync(transPath);
      console.log(`  🗑️ 已删除 ${transFile}`);
    } else {
      console.log(`  🔍 [预览模式] 将删除 ${transFile}`);
    }
  }
}

/**
 * 解析命令行参数
 */
function parseArgs(): { lang?: string; dryRun: boolean; cleanup: boolean } {
  const args = process.argv.slice(2);
  let lang: string | undefined;
  let dryRun = false;
  let cleanup = false;

  for (const arg of args) {
    if (arg.startsWith("--lang=")) {
      lang = arg.split("=")[1];
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--cleanup") {
      cleanup = true;
    }
  }

  return { lang, dryRun, cleanup };
}

/**
 * 主函数
 */
function main(): void {
  console.log("🚀 开始合并翻译文件...");
  console.log(`📁 Locale 目录: ${localeDir}`);

  const { lang, dryRun, cleanup } = parseArgs();

  if (dryRun) {
    console.log("⚠️ 预览模式：不会实际写入文件");
  }

  let totalMerged = 0;
  let totalSkipped = 0;

  const langsToProcess = lang ? [lang] : languages;

  for (const targetLang of langsToProcess) {
    if (!languages.includes(targetLang)) {
      console.error(`❌ 未知的语言: ${targetLang}`);
      console.log(`   支持的语言: ${languages.join(", ")}`);
      process.exit(1);
    }

    const result = mergeLanguage(targetLang, dryRun);
    totalMerged += result.merged;
    totalSkipped += result.skipped;

    if (cleanup && result.merged > 0) {
      cleanupTransFiles(targetLang, dryRun);
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log("📊 汇总统计");
  console.log("═══════════════════════════════════════");
  console.log(`  总计合并: ${totalMerged} 条`);
  console.log(`  总计跳过: ${totalSkipped} 条`);
  console.log("═══════════════════════════════════════");
  console.log("\n✨ 完成！");

  if (dryRun && totalMerged > 0) {
    console.log("\n💡 提示: 移除 --dry-run 参数以实际执行合并");
  }
}

// 执行主函数
main();
