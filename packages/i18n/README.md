# @zstack/i18n

ZStack UI 的国际化资源包，支持 TypeScript、tree shaking 和按产品分类的按需导入。

## 特性

- 🌍 支持 10 种语言
- 📦 支持 tree shaking，按需导入
- 🔷 直接导出 JSON 文件，无需构建
- 📝 轻量级，易于使用
- 🏢 按产品分类组织，支持多产品架构

## 目录结构

```text
src/
└── zstack/                     # ZStack 产品
    ├── cloud/                  # Cloud 产品
    │   └── locale/            # 语言文件目录
    │       ├── zh-CN.json
    │       ├── en-US.json
    │       └── ...
    ├── zsphere/               # ZSphere 产品
    │   └── locale/
    │       └── zh-CN.json
    └── cmp/                   # CMP 产品
        └── locale/
            └── zh-CN.json
```

## 安装

```bash
pnpm add @zstack/i18n
```

## 使用方法

### 按需导入单个语言包（推荐）

```typescript
// 只导入 Cloud 产品的中文语言包
import zhCN from "@zstack/i18n/zstack/cloud/locale/zh-CN.json";

// 只导入 Cloud 产品的英文语言包
import enUS from "@zstack/i18n/zstack/cloud/locale/en-US.json";

// 导入其他产品的语言包
import zsphereZhCN from "@zstack/i18n/zstack/zsphere/locale/zh-CN.json";
import cmpZhCN from "@zstack/i18n/zstack/cmp/locale/zh-CN.json";

// 使用
const message = zhCN["welcome"];
```

### 动态导入

```typescript
// 动态导入语言包
const loadLocale = async (locale: string) => {
  const messages = await import(
    `@zstack/i18n/zstack/cloud/locale/${locale}.json`
  );
  return messages.default || messages;
};

// 使用
const zhMessages = await loadLocale("zh-CN");
const enMessages = await loadLocale("en-US");
```

## 可用语言

所有产品都支持以下语言：

- `de-DE` - 德语
- `en-US` - 英语
- `fr-FR` - 法语
- `id-ID` - 印尼语
- `ja-JP` - 日语
- `ko-KR` - 韩语
- `ru-RU` - 俄语
- `th-TH` - 泰语
- `zh-CN` - 简体中文
- `zh-TW` - 繁体中文

## 支持的产品

- `cloud` - ZStack Cloud 产品

## TypeScript 支持

由于直接导出 JSON 文件，TypeScript 会自动推导类型：

```typescript
// TypeScript 会自动推导 JSON 文件的类型
import zhCN from "@zstack/i18n/zstack/cloud/locale/zh-CN.json";

// 可以定义自己的类型
type LocaleMessages = Record<string, string>;

// 类型安全的使用
const messages: LocaleMessages = zhCN;
const welcomeMessage: string = messages.welcome;
```

## Tree Shaking 支持

此包支持 tree shaking，当你按需导入语言包时，只有使用到的语言包会被包含在最终的 bundle 中。

```typescript
// ✅ 只有 Cloud 产品的中文语言包会被打包
import zhCN from "@zstack/i18n/zstack/cloud/locale/zh-CN.json";

// ✅ 只有需要的多个语言包会被打包
import enUS from "@zstack/i18n/zstack/cloud/locale/en-US.json";
import jaJP from "@zstack/i18n/zstack/cloud/locale/ja-JP.json";
```

## 扩展新产品

要添加新产品（如 `zsphere`、`cmp` 等），按以下结构组织：

```text
src/zstack/
├── cloud/
│   └── locale/
├── zsphere/
│   └── locale/
│       ├── zh-CN.json
│       └── ...
└── cmp/
    └── locale/
        ├── zh-CN.json
        └── ...
```

然后在 `package.json` 的 `exports` 中添加对应的导出路径。

## 开发

```bash
# 类型检查
pnpm type-check

# 由于直接导出 JSON 文件，无需构建步骤
```

## 脚本使用方法

```bash
# 翻译所有语言
DEEPSEEK_API_KEY=your_key bun packages/i18n/scripts/translate-diff.ts

# 只翻译指定语言
DEEPSEEK_API_KEY=your_key bun packages/i18n/scripts/translate-diff.ts --lang=zh-TW

# 调整批次大小（默认 30 条/批）
DEEPSEEK_API_KEY=your_key bun packages/i18n/scripts/translate-diff.ts --batch=50



# 预览模式（不实际写入）
bun packages/i18n/scripts/merge-translations.ts --dry-run

# 实际合并
bun packages/i18n/scripts/merge-translations.ts

# 合并并清理 trans 文件
bun packages/i18n/scripts/merge-translations.ts --cleanup



完整工作流
# 1. 提取未翻译条目（你已完成）
bun packages/i18n/scripts/extract-untranslated.ts

# 2. 调用 API 翻译
DEEPSEEK_API_KEY=sk-xxx bun packages/i18n/scripts/translate-diff.ts

# 3. 检查翻译质量（人工审核 *-trans.json）

# 4. 合并到主文件
bun packages/i18n/scripts/merge-translations.ts --cleanup
```
