# @zstack/zsphere-illustration

ZStack UI 彩色插画资源库，用于存放和导出项目中使用的彩色插画资源。

## 目录结构

```
illustration/
├── src/
│   ├── assets/           # SVG 插画资源文件目录（只支持 SVG 格式）
│   ├── illustration.tsx  # Illustration 组件
│   ├── illustrations-mapping.ts  # 插画映射文件
│   ├── type.ts           # 类型定义
│   ├── index.ts          # 导出文件
│   └── custom.d.ts       # SVG 类型声明
├── dist/                 # 构建输出目录
├── package.json
├── vite.config.ts        # Vite 构建配置
├── tsconfig.json
└── README.md
```

## 使用方法

### 1. 添加插画资源

将 SVG 格式的彩色插画文件放入 `src/assets/` 目录，然后在 `src/illustrations-mapping.ts` 中导入并添加到映射对象：

```typescript
// src/illustrations-mapping.ts
import emptyState from "./assets/empty-state.svg";
import errorState from "./assets/error-state.svg";
import successState from "./assets/success-state.svg";

export const Illustrations: Record<string, string> = {
  "empty-state": emptyState,
  "error-state": errorState,
  "success-state": successState,
} as const;
```

### 2. 使用 Illustration 组件（推荐）

```tsx
import { Illustration } from '@zstack/zsphere-illustration';

// 基础使用
<Illustration type="empty-state" width={200} height={200} />

// 自定义样式
<Illustration
  type="error-state"
  width="100%"
  height={300}
  className="my-illustration"
  style={{ maxWidth: 500 }}
/>
```

### 3. 直接使用映射对象

```tsx
import { Illustrations } from "@zstack/zsphere-illustration";

// 使用
<img src={Illustrations["empty-state"]} alt="空状态" />;
```

### 4. 在组件中使用示例

```tsx
import React from "react";
import { Illustration } from "@zstack/zsphere-illustration";

const EmptyState: React.FC = () => {
  return (
    <div className="empty-container">
      <Illustration type="empty-state" width={200} height={200} alt="空状态" />
      <p>暂无数据</p>
    </div>
  );
};

export default EmptyState;
```

## 开发

```bash
# 构建
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## 命名规范

- 使用 kebab-case：`empty-state.svg`、`error-page.svg`
- 语义化命名：`no-data.svg`、`network-error.svg`、`success-illustration.svg`
- **只支持 SVG 格式**：所有插画文件必须是 `.svg` 格式
