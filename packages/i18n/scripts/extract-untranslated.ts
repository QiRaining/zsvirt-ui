#!/usr/bin/env bun

import fs from "fs";
import path from "path";

/**
 * 提取未翻译的国际化条目
 * 繁体中文以简体中文为基础，其他语种以英文为基础
 */

// 脚本目录: packages/i18n/scripts/
// Locale 目录: packages/i18n/src/zstack/cloud/locale/
const scriptDir = import.meta.dir;
const localeDir = path.resolve(scriptDir, "../src/zstack/cloud/locale");

// 定义语言文件和它们的基础语言
const languages: Record<string, string> = {
  "zh-TW": "zh-CN", // 繁体中文以简体中文为基础
  "de-DE": "en-US", // 德语以英语为基础
  "th-TH": "en-US", // 泰语以英语为基础
  "ru-RU": "en-US", // 俄语以英语为基础
  "ko-KR": "en-US", // 韩语以英语为基础
  "ja-JP": "en-US", // 日语以英语为基础
  "id-ID": "en-US", // 印尼语以英语为基础
  "fr-FR": "en-US", // 法语以英语为基础
};

interface LocaleData {
  [key: string]: string;
}

interface ComparisonResult {
  untranslated: LocaleData;
  untranslatedCount: number;
  missingKeys: string[];
  missingCount: number;
  extraKeys: string[];
  extraCount: number;
}

/**
 * 读取 JSON 文件
 */
function readJsonFile(filename: string): LocaleData {
  const filePath = path.join(localeDir, filename);
  console.log(`  读取 ${filename}...`);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * 写入 JSON 文件
 */
function writeJsonFile(filename: string, data: LocaleData): void {
  const filePath = path.join(localeDir, filename);
  console.log(`  写入 ${filename}...`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * 比较两个语言文件，找出未翻译的条目（即缺失的 key）
 */
function findUntranslated(
  targetLang: string,
  baseLang: string,
): ComparisonResult {
  const targetData = readJsonFile(`${targetLang}.json`);
  const baseData = readJsonFile(`${baseLang}.json`);

  const untranslated: LocaleData = {};
  const missingKeys: string[] = [];
  const extraKeys: string[] = [];

  // 检查目标语言中有但基础语言没有的 key（多余的 key）
  for (const key in targetData) {
    if (targetData.hasOwnProperty(key) && !baseData.hasOwnProperty(key)) {
      extraKeys.push(key);
    }
  }

  // 检查基础语言中有但目标语言中没有的 key（缺失的 key = 未翻译）
  for (const key in baseData) {
    if (baseData.hasOwnProperty(key) && !targetData.hasOwnProperty(key)) {
      missingKeys.push(key);
      // 缺失的 key 及其在基础语言中的值添加到未翻译列表
      untranslated[key] = baseData[key];
    }
  }

  return {
    untranslated,
    untranslatedCount: Object.keys(untranslated).length,
    missingKeys,
    missingCount: missingKeys.length,
    extraKeys,
    extraCount: extraKeys.length,
  };
}

/**
 * 生成报告文件
 */
function generateReport(
  results: Record<string, ComparisonResult & { base: string }>,
): void {
  const reportLines: string[] = [
    "# 国际化翻译状态报告",
    "",
    `生成时间: ${new Date().toLocaleString("zh-CN")}`,
    "",
    "## 统计摘要",
    "",
    "| 语言 | 基础语言 | 未翻译条目 | 缺失Key | 多余Key |",
    "|------|----------|-----------|---------|---------|",
  ];

  let totalUntranslated = 0;
  let totalMissing = 0;
  let totalExtra = 0;

  for (const [lang, result] of Object.entries(results)) {
    reportLines.push(
      `| ${lang} | ${result.base} | ${result.untranslatedCount} | ${result.missingCount} | ${result.extraCount} |`,
    );
    totalUntranslated += result.untranslatedCount;
    totalMissing += result.missingCount;
    totalExtra += result.extraCount;
  }

  reportLines.push(
    `| **总计** | - | **${totalUntranslated}** | **${totalMissing}** | **${totalExtra}** |`,
    "",
    "## 详细说明",
    "",
    "- **未翻译条目**: 基础语言有但目标语言缺失的 Key（需要翻译）",
    "- **缺失Key**: 与未翻译条目相同",
    "- **多余Key**: 目标语言有但基础语言没有的 Key（可能是历史遗留）",
    "",
  );

  // 添加详细信息
  for (const [lang, result] of Object.entries(results)) {
    if (result.missingCount > 0 || result.extraCount > 0) {
      reportLines.push(`### ${lang}`);
      reportLines.push("");

      if (result.missingCount > 0) {
        reportLines.push(`#### 缺失的 Key (${result.missingCount})`);
        reportLines.push("```");
        reportLines.push(...result.missingKeys.slice(0, 10));
        if (result.missingKeys.length > 10) {
          reportLines.push(`... 还有 ${result.missingKeys.length - 10} 个`);
        }
        reportLines.push("```");
        reportLines.push("");
      }

      if (result.extraCount > 0) {
        reportLines.push(`#### 多余的 Key (${result.extraCount})`);
        reportLines.push("```");
        reportLines.push(...result.extraKeys.slice(0, 10));
        if (result.extraKeys.length > 10) {
          reportLines.push(`... 还有 ${result.extraKeys.length - 10} 个`);
        }
        reportLines.push("```");
        reportLines.push("");
      }
    }
  }

  const reportPath = path.join(localeDir, "translation-report.md");
  fs.writeFileSync(reportPath, reportLines.join("\n"), "utf-8");
  console.log(`\n📊 详细报告已保存到: translation-report.md`);
}

/**
 * 主函数
 */
function main(): void {
  console.log("🚀 开始提取未翻译的国际化条目...");
  console.log(`📁 Locale 目录: ${localeDir}\n`);

  const results: Record<string, ComparisonResult & { base: string }> = {};

  // 处理每种语言
  for (const [targetLang, baseLang] of Object.entries(languages)) {
    console.log(`📝 处理 ${targetLang} (基于 ${baseLang})...`);
    const result = findUntranslated(targetLang, baseLang);

    // 写入 diff 文件
    const diffFilename = `${targetLang}-diff.json`;
    writeJsonFile(diffFilename, result.untranslated);

    results[targetLang] = {
      ...result,
      base: baseLang,
    };

    console.log(`  ✅ 未翻译: ${result.untranslatedCount}`);
    if (result.missingCount > 0) {
      console.log(`  ⚠️  缺失Key: ${result.missingCount}`);
    }
    if (result.extraCount > 0) {
      console.log(`  ℹ️  多余Key: ${result.extraCount}`);
    }
    console.log(`  💾 已保存到: ${diffFilename}\n`);
  }

  // 生成报告
  generateReport(results);

  // 输出统计信息
  console.log("═══════════════════════════════════════");
  console.log("📊 汇总统计");
  console.log("═══════════════════════════════════════");
  for (const [lang, result] of Object.entries(results)) {
    console.log(
      `${lang.padEnd(8)} (${result.base}): ${String(
        result.untranslatedCount,
      ).padStart(5)} 未翻译${
        result.missingCount > 0 ? ` | ${result.missingCount} 缺失` : ""
      }${result.extraCount > 0 ? ` | ${result.extraCount} 多余` : ""}`,
    );
  }
  console.log("═══════════════════════════════════════");
  console.log("\n✨ 完成！");
}

// 执行主函数
main();
