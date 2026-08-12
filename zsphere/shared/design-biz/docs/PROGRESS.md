# 迁移进度追踪

本文档追踪从 `@zstack/zsphere-components` 到 `@zstack/zsphere-design-biz` 的组件迁移进度。

## 📊 总览

| 状态      | 数量   | 百分比   |
| --------- | ------ | -------- |
| ✅ 已完成 | 20     | 39.2%    |
| 🚧 进行中 | 0      | 0%       |
| ⏳ 待迁移 | 31     | 60.8%    |
| **总计**  | **51** | **100%** |

> **说明**：老组件库共 51 个组件，按依赖层级分布：第 0 层 40 个，第 1 层 7 个，第 2 层 4 个。

## 📋 详细进度

### ✅ 已完成组件 (Sprint 1)

| 组件名       | 状态 | 完成时间   | 文档                                | 测试 | 备注                               |
| ------------ | ---- | ---------- | ----------------------------------- | ---- | ---------------------------------- |
| `DialogWeak` | ✅   | 2025-01    | [文档](./components/dialog-weak.md) | ✅   | 基于 `@zstack/design` Dialog       |
| `Username`   | ✅   | 2025-01    | [文档](./components/username.md)    | -    | 用户名显示组件                     |
| `Spinner`    | ✅   | 2026-01-28 | [文档](./components/spinner.md)     | ✅   | 基于 `@zstack/design` Spin         |
| `Empty`      | ✅   | 2026-01-28 | [文档](./components/empty.md)       | ✅   | 空状态组件，含 ConfigEmptyProvider |

### ✅ 已完成组件 (Sprint 2)

| 组件名         | 状态 | 完成时间   | 文档                                      | 测试 | 备注           |
| -------------- | ---- | ---------- | ----------------------------------------- | ---- | -------------- |
| `HeaderList`   | ✅   | 2026-01-28 | [文档](./components/biz/header.md)        | ⏳   | 列表页头部组件 |
| `HeaderDetail` | ✅   | 2026-01-28 | [文档](./components/biz/header.md)        | ⏳   | 详情页头部组件 |
| `Title`        | ✅   | 2026-01-28 | [文档](./components/biz/title.md)         | ⏳   | 标题组件       |
| `DetailDrawer` | ✅   | 2026-01-28 | [文档](./components/biz/detail.md)        | ⏳   | 详情抽屉组件   |
| `ResourceName` | ✅   | 2026-01-28 | [文档](./components/biz/resource-name.md) | ⏳   | 资源名称组件   |

### ✅ 已完成组件 (Sprint 3)

| 组件名          | 状态 | 完成时间   | 文档 | 测试 | 备注             |
| --------------- | ---- | ---------- | ---- | ---- | ---------------- |
| `TagList`       | ✅   | 2026-01-28 | ⏳   | ⏳   | 标签列表组件     |
| `NotFound`      | ✅   | 2026-01-28 | ⏳   | ⏳   | 404 页面组件     |
| `PanicFallback` | ✅   | 2026-01-28 | ⏳   | ⏳   | 错误边界回退组件 |

### ✅ 已完成组件 (Sprint 4)

| 组件名      | 状态 | 完成时间   | 文档 | 测试 | 备注                     |
| ----------- | ---- | ---------- | ---- | ---- | ------------------------ |
| `IconText`  | ✅   | 2026-01-28 | ⏳   | ⏳   | 图标文本按钮组件         |
| `IconState` | ✅   | 2026-01-28 | ⏳   | ⏳   | 带状态指示的资源图标组件 |

### ✅ 已完成组件 (Sprint 5)

| 组件名            | 状态 | 完成时间   | 文档 | 测试 | 备注               |
| ----------------- | ---- | ---------- | ---- | ---- | ------------------ |
| `ResizableLayout` | ✅   | 2026-01-28 | ⏳   | ⏳   | 可调整尺寸布局组件 |
| `Constant`        | ✅   | 2026-01-28 | ⏳   | ⏳   | 常量显示组件       |

### ✅ 已完成组件 (Sprint 6)

| 组件名                | 状态 | 完成时间   | 文档 | 测试 | 备注                 |
| --------------------- | ---- | ---------- | ---- | ---- | -------------------- |
| `TaskDot`             | ✅   | 2026-01-28 | ⏳   | ⏳   | 任务状态点组件       |
| `useShare`            | ✅   | 2026-01-28 | ⏳   | ⏳   | 共享资源判断 Hook    |
| `ConfigEmptyProvider` | ✅   | 2026-01-28 | ⏳   | ⏳   | 配置空状态提供者     |
| `customRenderEmpty`   | ✅   | 2026-01-28 | ⏳   | ⏳   | 自定义空状态渲染函数 |

### 🚧 进行中组件

暂无

### ⏳ 待迁移组件

> **待完善**：需要从 `@zstack/zsphere-components` 中梳理出所有需要迁移的组件列表。

常见待迁移组件类型（待确认）：

- [ ] 表单组件（Form, Input, Select 等）
- [ ] 数据展示组件（Table, List, Card 等）
- [ ] 反馈组件（Message, Notification, Loading 等）
- [ ] 导航组件（Menu, Breadcrumb, Tabs 等）
- [ ] 其他业务组件

## 📈 迁移计划

### 阶段一：基础组件（当前阶段）

- [x] DialogWeak
- [x] Username
- [ ] 其他基础组件...

### 阶段二：表单组件

- [ ] Form
- [ ] Input
- [ ] Select
- [ ] DatePicker
- [ ] 其他表单组件...

### 阶段三：数据展示组件

- [ ] Table
- [ ] List
- [ ] Card
- [ ] 其他数据展示组件...

### 阶段四：反馈组件

- [ ] Message
- [ ] Notification
- [ ] Loading
- [ ] 其他反馈组件...

### 阶段五：导航组件

- [ ] Menu
- [ ] Breadcrumb
- [ ] Tabs
- [ ] 其他导航组件...

## 🎯 迁移优先级

### P0 - 高优先级（核心组件）

- [ ] Form
- [ ] Table
- [ ] Input
- [ ] Select

### P1 - 中优先级（常用组件）

- [ ] Dialog
- [ ] Message
- [ ] Loading
- [ ] Card

### P2 - 低优先级（辅助组件）

- [ ] Breadcrumb
- [ ] Tabs
- [ ] 其他辅助组件

## 📝 更新日志

### 2026-01-28 (Sprint 6)

- ✅ 完成 `TaskDot` 组件迁移（任务状态点）
- ✅ 完成 `useShare` Hook 迁移（共享资源判断）
- ✅ 完成 `ConfigEmptyProvider` 组件迁移（配置空状态提供者）
- ✅ 完成 `customRenderEmpty` 函数迁移（自定义空状态渲染）
- 📦 添加 `@zstack/zsphere-platform-store` 和 `@zstack/zsphere-types` 依赖
- 📝 注：复杂组件（Steps, DetailNav, Link, FormTable 等）依赖较多内部模块，暂缓迁移

### 2026-01-28 (Sprint 5)

- ✅ 完成 `ResizableLayout` 组件迁移（可调整尺寸布局，支持 localStorage 持久化）
- ✅ 完成 `Constant` 组件迁移（常量显示，支持多种显示类型）
- 📦 添加 `@zstack/zsphere-constant` 依赖

### 2026-01-28 (Sprint 4)

- ✅ 完成 `IconText` 组件迁移（图标文本按钮）
- ✅ 完成 `IconState` 组件迁移（带状态指示的资源图标）
- 📦 添加 `@zstack/zsphere-illustration` 依赖

### 2026-01-28 (Sprint 3)

- ✅ 完成 `TagList` 组件迁移（标签列表，支持溢出展开/收起）
- ✅ 完成 `NotFound` 组件迁移（404 页面）
- ✅ 完成 `PanicFallback` 组件迁移（错误边界回退 UI）
- 📝 注：`SubAppLayout` 组件依赖较多内部模块，暂缓迁移

### 2026-01-28 (Sprint 2)

- ✅ 创建 ZSV Tailwind 配置（antd 风格）：`src/styles/zsv-theme.css`
- ✅ 创建业务组件目录结构：`src/components/biz/`
- ✅ 完成 `HeaderList` 组件迁移
- ✅ 完成 `HeaderDetail` 组件迁移
- ✅ 完成 `Title` 组件迁移
- ✅ 完成 `DetailDrawer` 组件迁移
- ✅ 完成 `ResourceName` 组件迁移
- ✅ 创建业务组件文档

### 2026-01-28 (Sprint 1)

- ✅ 样式系统迁移：UnoCSS → Tailwind CSS v4
- ✅ 完成 `Spinner` 组件迁移（含测试和文档）
- ✅ 完成 `Empty` 组件迁移（含测试和文档）
- ✅ 搭建文档框架（README, MIGRATION, APP-INTEGRATION）
- ✅ core-shell 试点接入验证

### 2025-01-28

- ✅ 创建迁移进度文档
- ✅ 完成 `DialogWeak` 组件迁移
- ✅ 完成 `Username` 组件迁移

## 🔄 如何更新进度

1. 完成组件迁移后，更新对应组件的状态
2. 添加完成时间
3. 创建或更新组件文档
4. 更新总览统计数据
5. 在更新日志中记录变更

## 📚 相关文档

- [组件库总览](./README.md)
- [应用接入指南](./APP-INTEGRATION.md)
- [迁移指南](./MIGRATION.md)
- [下一步建议](./NEXT-STEPS.md) ⭐ **新增**
- [组件文档](./components/)
