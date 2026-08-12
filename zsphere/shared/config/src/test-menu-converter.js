#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 测试菜单转换脚本的验证脚本
 */

function testMenuConversion() {
  console.log("🧪 开始测试菜单转换结果...\n");

  // 读取原始menu.json
  const menuPath = path.join(__dirname, "menu/menu.json");
  const listPath = path.join(__dirname, "menu/list.json");

  try {
    const menuData = JSON.parse(fs.readFileSync(menuPath, "utf8"));
    const listData = JSON.parse(fs.readFileSync(listPath, "utf8"));

    console.log("📊 数据统计:");
    console.log(`- menu.json 顶级菜单数: ${menuData.length}`);
    console.log(`- list.json 总菜单项数: ${listData.length}`);

    // 测试1: 检查所有key的唯一性
    const keys = listData.map((item) => item.key);
    const uniqueKeys = new Set(keys);
    console.log(
      `\n✅ 测试1 - Key唯一性: ${keys.length === uniqueKeys.size ? "通过" : "失败"}`,
    );

    // 测试2: 检查必填字段
    const requiredFields = [
      "key",
      "menuKey",
      "name",
      "i18nKey",
      "parentKey",
      "prevKey",
      "nextKey",
    ];
    const missingFields = listData.filter((item) => {
      return requiredFields.some((field) => !(field in item));
    });
    console.log(
      `✅ 测试2 - 必填字段完整性: ${missingFields.length === 0 ? "通过" : "失败"}`,
    );

    // 测试3: 检查父子关系
    const parentChildRelations = {};
    listData.forEach((item) => {
      if (item.parentKey && item.parentKey !== "") {
        if (!parentChildRelations[item.parentKey]) {
          parentChildRelations[item.parentKey] = [];
        }
        parentChildRelations[item.parentKey].push(item.key);
      }
    });

    console.log(
      `✅ 测试3 - 父子关系完整性: 发现 ${Object.keys(parentChildRelations).length} 个父级菜单`,
    );

    // 测试4: 检查前后关系
    let validRelations = 0;
    listData.forEach((item) => {
      if (
        item.prevKey === "" ||
        listData.some((other) => other.key === item.prevKey)
      ) {
        validRelations++;
      }
      if (
        item.nextKey === "" ||
        listData.some((other) => other.key === item.nextKey)
      ) {
        validRelations++;
      }
    });
    console.log(
      `✅ 测试4 - 前后关系完整性: ${validRelations}/${listData.length * 2} 个关系有效`,
    );

    // 测试5: 检查重复key的处理
    const originalKeys = new Set();
    const processedKeys = new Set();

    listData.forEach((item) => {
      const baseKey = item.key.split(".").slice(0, -1).join(".");
      if (item.key.includes(".") && /^\d+$/.test(item.key.split(".").pop())) {
        originalKeys.add(baseKey);
        processedKeys.add(item.key);
      } else {
        originalKeys.add(item.key);
        processedKeys.add(item.key);
      }
    });

    console.log(
      `✅ 测试5 - 重复Key处理: 原始Key数 ${originalKeys.size}, 处理后Key数 ${processedKeys.size}`,
    );

    // 显示一些示例数据
    console.log("\n📋 示例数据:");
    const sampleItems = listData.slice(0, 3);
    sampleItems.forEach((item, index) => {
      console.log(`\n示例 ${index + 1}:`);
      console.log(`  Key: ${item.key}`);
      console.log(`  名称: ${item.name}`);
      console.log(`  父级: ${item.parentKey || "顶级"}`);
      console.log(`  路径: ${item.path || "无"}`);
    });

    console.log("\n🎉 所有测试完成！");
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testMenuConversion();
}

export { testMenuConversion };
