# 下一步迁移建议

本文档提供 ZSV 组件库迁移的后续工作建议和优先级指导。

## 📊 当前状态

- **已迁移**：20 个组件（39.2%）
- **待迁移**：31 个组件（60.8%）
- **总计**：51 个组件

## 🎯 迁移策略

### 策略一：优先迁移基础 UI 组件

这些组件可以直接使用 `@zstack/design` 的原子组件，只需配置 ZSV 专属的 Tailwind 样式即可。

| 组件          | 对应 @zstack/design 组件 | 迁移难度  | 优先级 |
| ------------- | ------------------------ | --------- | ------ |
| Input         | Input                    | ⭐ 简单   | P0     |
| InputNumber   | Input (type="number")    | ⭐ 简单   | P0     |
| InputPassword | Input (type="password")  | ⭐ 简单   | P0     |
| Radio         | Radio                    | ⭐ 简单   | P0     |
| Switch        | Switch                   | ⭐ 简单   | P0     |
| Progress      | Progress                 | ⭐⭐ 中等 | P1     |
| Steps         | Steps (需自定义)         | ⭐⭐ 中等 | P1     |
| Link          | 自定义 + react-router    | ⭐⭐ 中等 | P1     |

**建议**：这些组件迁移成本低，可以快速完成，建议优先处理。

### 策略二：逐步替换 antd 依赖

以下组件依赖 antd，需要逐个迁移到 `@zstack/design`：

| 组件            | 依赖的 antd 组件 | 迁移难度          | 优先级 |
| --------------- | ---------------- | ----------------- | ------ |
| List            | Field, Auth      | ⭐⭐ 中等         | P1     |
| DetailNav       | Menu, Affix      | ⭐⭐⭐ 复杂       | P2     |
| DetailNavLayout | Menu, Affix      | ⭐⭐⭐ 复杂       | P2     |
| FormTable       | Table, Modal     | ⭐⭐⭐⭐ 非常复杂 | P3     |
| ActionWrapper   | Apollo Client    | ⭐⭐⭐ 复杂       | P2     |
| Upload          | antd Upload      | ⭐⭐⭐ 复杂       | P2     |

**建议**：先完成基础 UI 组件，再逐步处理这些复杂组件。

### 策略三：建立组件映射文档

创建新旧组件的对应关系文档，方便业务代码迁移：

```markdown
## 组件映射表

| 旧组件 (@zstack/zsphere-components) | 新组件 (@zstack/zsphere-design-biz) |
| ----------------------------------- | ----------------------------------- |
| `<Header.List />`                   | `<HeaderList />`                    |
| `<Header.Detail />`                 | `<HeaderDetail />`                  |
| `<Detail.Drawer />`                 | `<DetailDrawer />`                  |
| `<Spin />`                          | `<Spinner />`                       |
| ...                                 | ...                                 |
```

### 策略四：补充单元测试

为已迁移的组件补充测试用例，确保组件质量：

| 组件                | 测试状态  | 优先级 |
| ------------------- | --------- | ------ |
| Spinner             | ✅ 已完成 | -      |
| Empty               | ✅ 已完成 | -      |
| HeaderList          | ⏳ 待补充 | P1     |
| HeaderDetail        | ⏳ 待补充 | P1     |
| Title               | ⏳ 待补充 | P2     |
| DetailDrawer        | ⏳ 待补充 | P1     |
| ResourceName        | ⏳ 待补充 | P1     |
| TagList             | ⏳ 待补充 | P2     |
| NotFound            | ⏳ 待补充 | P2     |
| PanicFallback       | ⏳ 待补充 | P2     |
| IconText            | ⏳ 待补充 | P2     |
| IconState           | ⏳ 待补充 | P2     |
| ResizableLayout     | ⏳ 待补充 | P2     |
| Constant            | ⏳ 待补充 | P2     |
| TaskDot             | ⏳ 待补充 | P2     |
| useShare            | ⏳ 待补充 | P2     |
| ConfigEmptyProvider | ⏳ 待补充 | P2     |

## 📋 待迁移组件详细清单

### 第 0 层组件（无内部依赖）- 31 个待迁移

| #   | 组件名                   | 说明                  | 迁移难度 | 建议优先级 |
| --- | ------------------------ | --------------------- | -------- | ---------- |
| 1   | ActionWrapper            | 操作包装器            | ⭐⭐⭐   | P2         |
| 2   | CodeMirrorEditor         | CodeMirror 代码编辑器 | ⭐⭐⭐⭐ | P3         |
| 3   | CodeMonacoEditor         | Monaco 代码编辑器     | ⭐⭐⭐⭐ | P3         |
| 4   | ColorfulIcon             | 彩色图标              | ⭐       | P1         |
| 5   | DetailNav                | 详情导航              | ⭐⭐⭐   | P2         |
| 6   | DetailNavLayout          | 详情导航布局          | ⭐⭐⭐   | P2         |
| 7   | FormTable                | 表单表格              | ⭐⭐⭐⭐ | P3         |
| 8   | Input                    | 输入框                | ⭐       | P0         |
| 9   | InputNumber              | 数字输入框            | ⭐       | P0         |
| 10  | InputPassword            | 密码输入框            | ⭐       | P0         |
| 11  | ItemList                 | 项目列表              | ⭐⭐     | P1         |
| 12  | Link                     | 链接组件              | ⭐⭐     | P1         |
| 13  | Progress                 | 进度条                | ⭐⭐     | P1         |
| 14  | Radio                    | 单选框                | ⭐       | P0         |
| 15  | ResponsiveDndCardsLayout | 响应式拖拽卡片布局    | ⭐⭐⭐⭐ | P3         |
| 16  | Spin                     | 加载中                | ⭐       | P0         |
| 17  | Steps                    | 步骤条                | ⭐⭐     | P1         |
| 18  | Switch                   | 开关                  | ⭐       | P0         |
| 19  | Upload                   | 上传组件              | ⭐⭐⭐   | P2         |
| 20  | WebTerminalConfirmModal  | Web 终端确认弹窗      | ⭐⭐⭐   | P2         |
| 21  | ZSVForm                  | ZSV 表单              | ⭐⭐⭐   | P2         |
| 22  | systemAlarmUuidList      | 系统告警 UUID 列表    | ⭐       | P2         |
| 23  | useMetricNameConfig      | 指标名称配置 Hook     | ⭐⭐⭐⭐ | P3         |
| 24  | useThirdPartyBuildName   | 第三方构建名称 Hook   | ⭐⭐     | P2         |
| 25  | useThirdPartyConfig      | 第三方配置 Hook       | ⭐⭐     | P2         |

### 第 1 层组件（依赖第 0 层）- 待迁移

| #   | 组件名                | 依赖                       | 迁移难度 | 建议优先级 |
| --- | --------------------- | -------------------------- | -------- | ---------- |
| 1   | List                  | ResourceName               | ⭐⭐     | P1         |
| 2   | MonitorSelect         | ConfigEmptyProvider, Empty | ⭐⭐     | P1         |
| 3   | ResourceUsageProgress | Progress                   | ⭐⭐     | P1         |
| 4   | ShareType             | useShare                   | ⭐⭐     | P1         |
| 5   | SubAppLayout          | Header, ResizableLayout    | ⭐⭐⭐   | P2         |

### 第 2 层组件（依赖第 1 层）- 待迁移

| #   | 组件名                           | 依赖                  | 迁移难度 | 建议优先级 |
| --- | -------------------------------- | --------------------- | -------- | ---------- |
| 1   | DetailList                       | List                  | ⭐⭐     | P2         |
| 2   | DetailResourceUsageProgress      | ResourceUsageProgress | ⭐⭐     | P2         |
| 3   | ResourceUsageProgressWithTooltip | ResourceUsageProgress | ⭐⭐     | P2         |
| 4   | SubAppLayoutWithErrorBoundary    | SubAppLayout          | ⭐⭐⭐   | P2         |

## 🚀 推荐的下一步 Sprint 计划

### Sprint 7：基础输入组件

**目标**：迁移基础输入组件，使用 `@zstack/design` 原子组件

- [ ] Input
- [ ] InputNumber
- [ ] InputPassword
- [ ] Radio
- [ ] Switch

**预计工作量**：1-2 天

### Sprint 8：进度和步骤组件

**目标**：迁移进度展示相关组件

- [ ] Progress
- [ ] Steps
- [ ] ColorfulIcon

**预计工作量**：1-2 天

### Sprint 9：列表和导航组件

**目标**：迁移列表和导航相关组件

- [ ] List
- [ ] Link
- [ ] ItemList

**预计工作量**：2-3 天

### Sprint 10：复杂业务组件

**目标**：迁移复杂业务组件

- [ ] DetailNav
- [ ] DetailNavLayout
- [ ] SubAppLayout

**预计工作量**：3-5 天

### Sprint 11：表单和上传组件

**目标**：迁移表单相关复杂组件

- [ ] FormTable
- [ ] Upload
- [ ] ZSVForm

**预计工作量**：5-7 天

### Sprint 12：代码编辑器和特殊组件

**目标**：迁移代码编辑器和其他特殊组件

- [ ] CodeMirrorEditor
- [ ] CodeMonacoEditor
- [ ] ResponsiveDndCardsLayout
- [ ] WebTerminalConfirmModal

**预计工作量**：5-7 天

## 📝 迁移注意事项

### 1. 保持 API 兼容性

迁移时尽量保持组件 API 与旧组件一致，减少业务代码改动：

```tsx
// ❌ 避免：大幅修改 API
// 旧：<Header.List title="标题" />
// 新：<HeaderList headerTitle="标题" />

// ✅ 推荐：保持 API 一致
// 旧：<Header.List title="标题" />
// 新：<HeaderList title="标题" />
```

### 2. 使用 Tailwind CSS 替代 Less

所有新组件使用 Tailwind CSS，不再使用 Less：

```tsx
// ❌ 避免
import styles from "./style.module.less";
<div className={styles.container}>

// ✅ 推荐
import { cn } from "@zstack/utils";
<div className={cn("flex items-center gap-2 p-4")}>
```

### 3. 使用 @zstack/design 原子组件

优先使用 `@zstack/design` 提供的原子组件：

```tsx
// ❌ 避免：直接使用 antd
import { Button, Input } from "antd";

// ✅ 推荐：使用 @zstack/design
import { Button, Input } from "@zstack/design";
```

### 4. 解耦路由依赖

组件不应直接依赖 `react-router-dom`，通过 props 传入：

```tsx
// ❌ 避免
import { Link } from "react-router-dom";
<Link to={path}>{name}</Link>;

// ✅ 推荐
interface Props {
  LinkComponent?: React.ComponentType<{
    to: string;
    children: React.ReactNode;
  }>;
}
const { LinkComponent = "a" } = props;
<LinkComponent to={path}>{name}</LinkComponent>;
```

### 5. 国际化

所有用户可见文本使用 `react-intl`：

```tsx
import { useIntl } from "react-intl";

const intl = useIntl();
const message = intl.formatMessage({
  id: "component.button.submit",
  defaultMessage: "提交",
});
```

## 📚 相关文档

- [迁移进度追踪](./PROGRESS.md)
- [应用接入指南](./APP-INTEGRATION.md)
- [迁移指南](./MIGRATION.md)
- [组件文档](./components/)
