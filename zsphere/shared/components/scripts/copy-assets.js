#!/usr/bin/env node

/**
 * 构建后脚本：将 assets 和 style 目录复制到 dist 目录
 * 保持目录结构，确保 less 文件中引用 assets 和 style 的相对路径正确
 */

import { cpSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageRoot = join(__dirname, "..");
const srcAssetsPath = join(packageRoot, "src", "assets");
const srcStylePath = join(packageRoot, "src", "style");
const distPath = join(packageRoot, "dist");
const distAssetsPath = join(distPath, "assets");
const distStylePath = join(distPath, "style");

// 检查 dist 目录是否存在
if (!existsSync(distPath)) {
  console.log("⚠️  dist 目录不存在，请先执行构建");
  process.exit(1);
}

try {
  // 复制 assets 目录
  if (existsSync(srcAssetsPath)) {
    console.log(`📦 复制 assets 目录: ${srcAssetsPath} -> ${distAssetsPath}`);
    cpSync(srcAssetsPath, distAssetsPath, { recursive: true, force: true });
    console.log("✅ assets 目录复制成功");
  } else {
    console.log("⚠️  src/assets 目录不存在，跳过复制");
  }

  // 复制 style 目录
  if (existsSync(srcStylePath)) {
    console.log(`📦 复制 style 目录: ${srcStylePath} -> ${distStylePath}`);
    cpSync(srcStylePath, distStylePath, { recursive: true, force: true });
    console.log("✅ style 目录复制成功");
  } else {
    console.log("⚠️  src/style 目录不存在，跳过复制");
  }
} catch (error) {
  console.error("❌ 复制目录失败:", error.message);
  process.exit(1);
}
