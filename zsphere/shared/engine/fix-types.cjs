const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取所有需要修复的文件
const srcDir = path.join(__dirname, 'src');

function findFiles(dir, pattern) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...findFiles(filePath, pattern));
    } else if (file.match(pattern)) {
      results.push(filePath);
    }
  }
  
  return results;
}

// 修复 useActionConfig 文件
function fixUseActionConfig(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 检查是否需要添加 Item 导入
  if (!content.includes('import type { Item } from "@zstack/zsphere-types"')) {
    // 在 ITableListProps 导入后添加 Item 导入
    if (content.includes('import { ITableListProps')) {
      content = content.replace(
        /import { ITableListProps([^}]*)} from "@zstack\/zsphere-components";/,
        (match) => {
          return match + '\nimport type { Item } from "@zstack/zsphere-types";';
        }
      );
      modified = true;
    }
  }
  
  // 修复 IOption 类型定义
  if (content.includes('export type IOption<T, K = any>')) {
    content = content.replace(
      /export type IOption<T, K = any>/g,
      'export type IOption<T extends Item, K extends Item = Item>'
    );
    modified = true;
  }
  
  // 修复函数签名
  if (content.includes('function useActionConfig<T, K = any>')) {
    content = content.replace(
      /function useActionConfig<T, K = any>/g,
      'function useActionConfig<T extends Item, K extends Item = Item>'
    );
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

// 修复 useColumnConfig 文件
function fixUseColumnConfig(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 检查是否需要添加 Item 导入
  if (!content.includes('import type { Item } from "@zstack/zsphere-types"')) {
    // 在 genColumnFromRemote 导入后添加 Item 导入
    if (content.includes('genColumnFromRemote')) {
      content = content.replace(
        /import { genColumnFromRemote } from[^;]+;/,
        (match) => {
          return match + '\nimport type { Item } from "@zstack/zsphere-types";';
        }
      );
      modified = true;
    } else if (content.includes('IColumnType')) {
      // 如果没有 genColumnFromRemote，在 IColumnType 导入后添加
      const lines = content.split('\n');
      let insertIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('IColumnType') && lines[i].includes('from')) {
          insertIndex = i + 1;
          break;
        }
      }
      if (insertIndex > 0) {
        lines.splice(insertIndex, 0, 'import type { Item } from "@zstack/zsphere-types";');
        content = lines.join('\n');
        modified = true;
      }
    }
  }
  
  // 修复 IOption 类型定义
  if (content.includes('export type IOption<T> = Array<Omit<IColumnType<T>')) {
    content = content.replace(
      /export type IOption<T>/g,
      'export type IOption<T extends Item>'
    );
    modified = true;
  }
  
  // 修复函数签名
  if (content.includes('function useColumnConfig<T extends { [prop: string]: any }>')) {
    content = content.replace(
      /function useColumnConfig<T extends { \[prop: string\]: any }>/g,
      'function useColumnConfig<T extends Item>'
    );
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

// 修复 useQueryConfig 文件
function fixUseQueryConfig(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 修复 mergeCandidates 调用
  if (content.includes('mergeCandidates(') && !content.includes('originCandidates as any')) {
    content = content.replace(
      /mergeCandidates\(\s*originCandidates,\s*customCandidates as ICandidate\[\]/g,
      'mergeCandidates(\n      originCandidates as any,\n      customCandidates as any'
    );
    modified = true;
  }
  
  // 修复 setCandidates 调用
  if (content.includes('fuzzyConfig.setCandidates(queryConfig)') && !content.includes('queryConfig as any')) {
    content = content.replace(
      /fuzzyConfig\.setCandidates\(queryConfig\)/g,
      'fuzzyConfig.setCandidates(queryConfig as any)'
    );
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

// 执行修复
console.log('Fixing useActionConfig files...');
const actionConfigFiles = findFiles(srcDir, /useActionConfig\.tsx$/);
actionConfigFiles.forEach(fixUseActionConfig);

console.log('\nFixing useColumnConfig files...');
const columnConfigFiles = findFiles(srcDir, /useColumnConfig\.tsx$/);
columnConfigFiles.forEach(fixUseColumnConfig);

console.log('\nFixing useQueryConfig files...');
const queryConfigFiles = findFiles(srcDir, /useQueryConfig\.tsx$/);
queryConfigFiles.forEach(fixUseQueryConfig);

console.log('\nDone!');

