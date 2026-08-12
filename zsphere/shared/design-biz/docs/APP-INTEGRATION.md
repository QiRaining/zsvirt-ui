# 应用接入指南

本文档介绍如何在 ZSV 应用中接入 `@zstack/zsphere-design-biz` 组件库。

## 📋 前置条件

- 应用已配置好 `@zstack/design` 设计系统
- 应用支持 ES Modules
- 使用 pnpm 作为包管理器

## 🚀 接入步骤

### 1. 安装依赖

在应用的 `package.json` 中添加依赖：

```bash
pnpm add @zstack/zsphere-design-biz
```

或直接在 `package.json` 中添加：

```json
{
  "dependencies": {
    "@zstack/zsphere-design-biz": "workspace:*"
  }
}
```

### 2. 导入样式

在应用的入口文件（如 `src/App.tsx` 或 `src/main.tsx`）中导入组件库样式：

```tsx
import "@zstack/zsphere-design-biz/dist/style.css";
```

**注意**：样式导入顺序很重要，建议在应用全局样式之前导入，以确保样式优先级正确。

### 3. 使用组件

在组件中导入并使用：

```tsx
import { DialogWeak, Username } from "@zstack/zsphere-design-biz";

function MyComponent() {
  return (
    <div>
      <DialogWeak open={true} onOpenChange={(open) => {}}>
        对话框内容
      </DialogWeak>
      <Username />
    </div>
  );
}
```

## 🎯 试点应用：zsv-core-shell

`zsv-core-shell` 是第一个接入新组件库的试点应用。

### 当前状态

- ✅ 已添加依赖
- ⏳ 样式导入待配置
- ⏳ 组件替换进行中

### 接入示例

在 `zsv-core-shell` 中的接入步骤：

1. **添加依赖**（已完成）

```json
// packages/products/zsv/apps/core-shell/package.json
{
  "dependencies": {
    "@zstack/zsphere-design-biz": "workspace:*"
  }
}
```

2. **导入样式**（待完成）

在 `src/App.tsx` 中添加：

```tsx
import "@zstack/zsphere-design-biz/dist/style.css";
```

3. **替换组件**（进行中）

逐步将 `@zstack/zsphere-components` 的组件替换为 `@zstack/zsphere-design-biz` 的对应组件。

## ⚠️ 样式优先级处理

### 样式加载顺序

为确保样式正确应用，建议按以下顺序导入样式：

```tsx
// 1. 基础设计系统样式
import "@zstack/design/dist/style.css";

// 2. 业务组件库样式
import "@zstack/zsphere-design-biz/dist/style.css";

// 3. 应用全局样式
import "./global.less";
```

### 样式冲突处理

如果遇到样式冲突，可以通过以下方式解决：

1. **调整导入顺序**：确保新组件库样式在应用样式之后导入
2. **使用 CSS Modules**：为应用样式使用 CSS Modules 避免全局污染
3. **提高选择器优先级**：在必要时使用更高优先级的选择器

## 🔄 渐进式替换策略

### 阶段一：并行使用（当前阶段）

- 保持 `@zstack/zsphere-components` 继续使用
- 新功能优先使用 `@zstack/zsphere-design-biz`
- 逐步替换现有组件

### 阶段二：全面迁移

- 完成所有组件的迁移
- 移除 `@zstack/zsphere-components` 依赖
- 统一使用新组件库

### 迁移检查清单

- [ ] 添加 `@zstack/zsphere-design-biz` 依赖
- [ ] 导入组件库样式
- [ ] 识别需要迁移的组件
- [ ] 逐个替换组件
- [ ] 测试功能完整性
- [ ] 验证样式显示
- [ ] 更新类型定义
- [ ] 移除旧组件库依赖（迁移完成后）

## 🐛 常见问题

### Q: 样式不生效？

**A**: 检查样式导入顺序，确保组件库样式在应用样式之前导入。

### Q: TypeScript 类型错误？

**A**: 确保已安装 `@zstack/zsphere-design-biz` 并正确导入类型：

```tsx
import type { DialogWeakProps } from "@zstack/zsphere-design-biz";
```

### Q: 组件渲染异常？

**A**: 确保已导入组件库样式文件，并检查是否正确安装了依赖。

### Q: 如何同时使用新旧组件库？

**A**: 在迁移期间可以同时使用，但建议尽快完成迁移以避免样式冲突。

## 📚 相关资源

- [组件库总览](./README.md)
- [迁移指南](./MIGRATION.md)
- [迁移进度](./PROGRESS.md)
