#!/usr/bin/env bun

import fs from "fs";
import path from "path";

/**
 * 使用 DeepSeek API 自动翻译 diff 文件
 *
 * 使用方法:
 *   DEEPSEEK_API_KEY=your_key bun packages/i18n/scripts/translate-diff.ts
 *
 * 可选参数:
 *   --lang=zh-TW  只翻译指定语言
 *   --batch=50    每批翻译的条目数量
 */

const scriptDir = import.meta.dir;
const localeDir = path.resolve(scriptDir, "../src/zstack/cloud/locale");

// DeepSeek API 配置
const DEEPSEEK_API_URL = "https://chat.zstack.ai/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  console.error("❌ 请设置 DEEPSEEK_API_KEY 环境变量");
  console.error(
    "   示例: DEEPSEEK_API_KEY=your_key bun packages/i18n/scripts/translate-diff.ts",
  );
  process.exit(1);
}

// 语言配置：目标语言 -> 源语言
const languageConfig: Record<
  string,
  { source: string; targetName: string; sourceDescription: string }
> = {
  "zh-TW": {
    source: "zh-CN",
    targetName: "Traditional Chinese (Taiwan)",
    sourceDescription: "Simplified Chinese",
  },
  "de-DE": {
    source: "en-US",
    targetName: "German",
    sourceDescription: "English",
  },
  "th-TH": {
    source: "en-US",
    targetName: "Thai",
    sourceDescription: "English",
  },
  "ru-RU": {
    source: "en-US",
    targetName: "Russian",
    sourceDescription: "English",
  },
  "ko-KR": {
    source: "en-US",
    targetName: "Korean",
    sourceDescription: "English",
  },
  "ja-JP": {
    source: "en-US",
    targetName: "Japanese",
    sourceDescription: "English",
  },
  "id-ID": {
    source: "en-US",
    targetName: "Indonesian",
    sourceDescription: "English",
  },
  "fr-FR": {
    source: "en-US",
    targetName: "French",
    sourceDescription: "English",
  },
};

interface LocaleData {
  [key: string]: string;
}

/**
 * 读取 JSON 文件
 */
function readJsonFile(filename: string): LocaleData {
  const filePath = path.join(localeDir, filename);
  if (!fs.existsSync(filePath)) {
    return {};
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
 * 调用 DeepSeek API 进行翻译
 */
async function callDeepSeekAPI(
  texts: Record<string, string>,
  targetLang: string,
  sourceDescription: string,
  targetName: string,
): Promise<Record<string, string>> {
  const systemPrompt = `You are a professional software localization translator. Your task is to translate UI text from ${sourceDescription} to ${targetName}.

CRITICAL RULES:
1. Return ONLY valid JSON object, no markdown, no code blocks, no explanations
2. Preserve all placeholders like {name}, {count}, {0}, {1}, etc. - DO NOT translate them
3. Preserve all special characters, HTML tags, and escape sequences
4. Keep technical terms (API, GPU, CPU, Token, vLLM, SDN, OOM, KV Cache, etc.) unchanged or use standard localized terms
5. Maintain the same tone and formality as the source
6. For zh-TW: Use Traditional Chinese characters commonly used in Taiwan
7. Translate naturally, ensuring the text sounds native to ${targetName} speakers
8. Keep brand names, product names (like ZStack), and proper nouns unchanged

Input format: JSON object with keys and source text values
Output format: JSON object with same keys and translated text values`;

  const userPrompt = `Translate the following JSON from ${sourceDescription} to ${targetName}:

${JSON.stringify(texts, null, 2)}`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Empty response from API");
    }

    // 尝试解析 JSON，处理可能的 markdown 代码块
    let jsonContent = content;
    if (content.startsWith("```")) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        jsonContent = match[1].trim();
      }
    }

    return JSON.parse(jsonContent);
  } catch (error) {
    console.error("API 调用失败:", error);
    throw error;
  }
}

/**
 * 分批翻译
 */
async function translateBatch(
  diffData: LocaleData,
  targetLang: string,
  config: { source: string; targetName: string; sourceDescription: string },
  batchSize: number,
): Promise<LocaleData> {
  const keys = Object.keys(diffData);
  const totalBatches = Math.ceil(keys.length / batchSize);
  const result: LocaleData = {};

  console.log(`  📊 总计 ${keys.length} 条，分 ${totalBatches} 批处理`);

  for (let i = 0; i < totalBatches; i++) {
    const batchKeys = keys.slice(i * batchSize, (i + 1) * batchSize);
    const batchData: LocaleData = {};
    batchKeys.forEach((key) => {
      batchData[key] = diffData[key];
    });

    console.log(
      `  🔄 处理第 ${i + 1}/${totalBatches} 批 (${batchKeys.length} 条)...`,
    );

    try {
      const translated = await callDeepSeekAPI(
        batchData,
        targetLang,
        config.sourceDescription,
        config.targetName,
      );

      // 合并结果
      Object.assign(result, translated);
      console.log(`  ✅ 第 ${i + 1} 批完成`);

      // 添加延迟避免 API 限流
      if (i < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`  ❌ 第 ${i + 1} 批失败:`, error);
      // 保存已翻译的内容，继续处理下一批
      console.log(`  ⚠️ 跳过失败的批次，继续处理...`);
    }
  }

  return result;
}

/**
 * 处理单个语言的翻译
 */
async function translateLanguage(
  targetLang: string,
  batchSize: number,
): Promise<void> {
  const config = languageConfig[targetLang];
  if (!config) {
    console.error(`❌ 未知的语言: ${targetLang}`);
    return;
  }

  const diffFile = `${targetLang}-diff.json`;
  const transFile = `${targetLang}-trans.json`;

  console.log(`\n📝 处理 ${targetLang} (${config.targetName})...`);

  // 读取 diff 文件
  const diffData = readJsonFile(diffFile);
  const diffCount = Object.keys(diffData).length;

  if (diffCount === 0) {
    console.log(`  ℹ️ 无需翻译的内容`);
    return;
  }

  console.log(`  📖 读取 ${diffFile}: ${diffCount} 条待翻译`);

  // 读取已有的翻译文件（如果存在）
  const existingTrans = readJsonFile(transFile);
  const existingCount = Object.keys(existingTrans).length;

  if (existingCount > 0) {
    console.log(`  📂 发现已有翻译: ${existingCount} 条`);
  }

  // 过滤出尚未翻译的条目
  const toTranslate: LocaleData = {};
  for (const key in diffData) {
    if (!existingTrans[key]) {
      toTranslate[key] = diffData[key];
    }
  }

  const toTranslateCount = Object.keys(toTranslate).length;
  if (toTranslateCount === 0) {
    console.log(`  ✅ 所有条目已翻译完成`);
    return;
  }

  console.log(`  🔄 需要翻译: ${toTranslateCount} 条`);

  // 执行翻译
  const translated = await translateBatch(
    toTranslate,
    targetLang,
    config,
    batchSize,
  );

  // 合并并保存
  const finalResult = { ...existingTrans, ...translated };
  writeJsonFile(transFile, finalResult);

  const translatedCount = Object.keys(translated).length;
  const totalCount = Object.keys(finalResult).length;
  console.log(
    `  💾 已保存到 ${transFile}: 本次翻译 ${translatedCount} 条，总计 ${totalCount} 条`,
  );
}

/**
 * 解析命令行参数
 */
function parseArgs(): { lang?: string; batchSize: number } {
  const args = process.argv.slice(2);
  let lang: string | undefined;
  let batchSize = 30; // 默认每批 30 条

  for (const arg of args) {
    if (arg.startsWith("--lang=")) {
      lang = arg.split("=")[1];
    } else if (arg.startsWith("--batch=")) {
      batchSize = parseInt(arg.split("=")[1], 10);
    }
  }

  return { lang, batchSize };
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log("🚀 开始自动翻译...");
  console.log(`📁 Locale 目录: ${localeDir}`);

  const { lang, batchSize } = parseArgs();
  console.log(`⚙️ 批次大小: ${batchSize}`);

  if (lang) {
    // 只翻译指定语言
    if (!languageConfig[lang]) {
      console.error(`❌ 未知的语言: ${lang}`);
      console.log(`   支持的语言: ${Object.keys(languageConfig).join(", ")}`);
      process.exit(1);
    }
    await translateLanguage(lang, batchSize);
  } else {
    // 翻译所有语言
    for (const targetLang of Object.keys(languageConfig)) {
      await translateLanguage(targetLang, batchSize);
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log("✨ 翻译完成！");
  console.log("═══════════════════════════════════════");
  console.log("\n📋 后续步骤:");
  console.log("   1. 检查 *-trans.json 文件中的翻译质量");
  console.log("   2. 使用 merge-translations.ts 将翻译合并到主文件");
}

// 执行主函数
main().catch(console.error);
