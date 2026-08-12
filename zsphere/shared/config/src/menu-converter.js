#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 从menu.json生成list.json的转换脚本
 *
 * menu.json: 树形结构的菜单配置
 * list.json: 扁平化的菜单列表，包含parentKey、prevKey、nextKey等关系信息
 */

// 读取menu.json文件
function readMenuFile() {
  const menuPath = path.join(__dirname, "menu/menu.json");
  try {
    const content = fs.readFileSync(menuPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("读取menu.json失败:", error.message);
    process.exit(1);
  }
}

// 递归处理菜单项，生成扁平化列表
function processMenuItems(items, parentKey = "", result = []) {
  let prevKey = "";

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const currentKey = item.key;

    // 构建list.json的菜单项
    const listItem = {
      source: "system",
      key: currentKey,
      menuKey: item.menuKey,
      name: item.name.name || item.name, // 兼容两种格式
      i18nKey: item.name.id || item.name,
      parentKey: parentKey,
      prevKey: prevKey,
      nextKey: i < items.length - 1 ? items[i + 1].key : "",
      visible: true,
      privilege: "all",
      iconKey: item.icon || "",
      path: item.path || "",
      target: "page",
    };

    // 添加资源类型和命名空间（如果存在）
    if (item.resourceType) {
      listItem.resourceType = Array.isArray(item.resourceType)
        ? item.resourceType.join(",")
        : item.resourceType;
    }

    if (item.namespace) {
      listItem.namespace = item.namespace;
    }

    // 处理tabs（标记为isTab）
    if (item.tabs) {
      listItem.isTab = true;
    }

    // 添加到结果列表
    result.push(listItem);

    // 更新prevKey
    prevKey = currentKey;

    // 递归处理子菜单
    if (item.children && item.children.length > 0) {
      processMenuItems(item.children, currentKey, result);
    }

    // 处理tabs中的菜单项
    if (item.tabs && item.tabs.length > 0) {
      processMenuItems(item.tabs, currentKey, result);
    }
  }
}

// 生成list.json文件
function generateListFile(menuData) {
  const result = [];

  // 处理顶级菜单
  processMenuItems(menuData, "", result);

  // 写入list.json文件
  const listPath = path.join(__dirname, "menu/list.json");
  try {
    fs.writeFileSync(listPath, JSON.stringify(result, null, 2), "utf8");
    console.log(`✅ 成功生成 list.json，共 ${result.length} 个菜单项`);
    console.log(`📁 文件路径: ${listPath}`);
  } catch (error) {
    console.error("写入list.json失败:", error.message);
    process.exit(1);
  }
}

// 验证生成的list.json
function validateListFile() {
  const listPath = path.join(__dirname, "menu/list.json");
  try {
    const content = fs.readFileSync(listPath, "utf8");
    const data = JSON.parse(content);

    console.log("\n🔍 验证结果:");
    console.log(`- 总菜单项数: ${data.length}`);

    // 检查是否有重复的key
    const keys = data.map((item) => item.key);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      console.warn("⚠️  发现重复的key");
    } else {
      console.log("✅ 所有key都是唯一的");
    }

    // 检查必填字段
    const requiredFields = [
      "key",
      "menuKey",
      "name",
      "i18nKey",
      "parentKey",
      "prevKey",
      "nextKey",
    ];
    const missingFields = data.filter((item) => {
      return requiredFields.some((field) => !(field in item));
    });

    if (missingFields.length > 0) {
      console.warn(`⚠️  发现 ${missingFields.length} 个菜单项缺少必填字段`);
    } else {
      console.log("✅ 所有必填字段都已填写");
    }
  } catch (error) {
    console.error("验证list.json失败:", error.message);
  }
}

// 主函数
function main() {
  console.log("🚀 开始转换 menu.json 到 list.json...\n");

  // 读取menu.json
  const menuData = readMenuFile();
  console.log(`📖 读取到 ${menuData.length} 个顶级菜单项`);

  // 生成list.json
  generateListFile(menuData);

  // 验证结果
  validateListFile();

  console.log("\n✨ 转换完成！");
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { readMenuFile, processMenuItems, generateListFile, validateListFile };
