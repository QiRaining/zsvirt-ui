# Overlay 自动 z-index 管理系统

## 概述

Overlay 管理系统通过 Context + Hook 方案自动处理多层弹窗（Dialog、Drawer、Popover）的 z-index 问题，无需手动管理层级关系。

## 特性

✅ **自动层级管理**：根据打开顺序自动分配 z-index  
✅ **类型隔离**：不同类型的弹窗（Dialog/Drawer/Popover）有独立的基础 z-index  
✅ **向后兼容**：保留原有的 `zIndex` prop，可以手动覆盖  
✅ **零侵入**：对现有代码改动最小  
✅ **SSR 友好**：优雅降级，没有 Provider 也能正常工作

## 快速开始

### 1. 在应用根组件注入 Provider

```tsx
// packages/products/zsv/apps/core-shell/src/App.tsx
import { OverlayProvider } from "@zstack/design";

function App() {
  return (
    <OverlayProvider>
      {/* 你的应用内容 */}
      <Router>
        <Routes />
      </Router>
    </OverlayProvider>
  );
}

export default App;
```

### 2. 使用自动 z-index

改造后的组件会自动管理 z-index，无需手动传入：

#### Dialog 示例

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@zstack/design";

function MyComponent() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  return (
    <>
      {/* 第一个弹窗 - 自动 z-index: 1000 */}
      <Dialog open={open1} onOpenChange={setOpen1}>
        <DialogContent open={open1}>
          <DialogHeader>
            <DialogTitle>第一个弹窗</DialogTitle>
          </DialogHeader>

          {/* 在第一个弹窗内打开第二个弹窗 */}
          <button onClick={() => setOpen2(true)}>打开嵌套弹窗</button>
        </DialogContent>
      </Dialog>

      {/* 第二个弹窗 - 自动 z-index: 1010（自动递增） */}
      <Dialog open={open2} onOpenChange={setOpen2}>
        <DialogContent open={open2}>
          <DialogHeader>
            <DialogTitle>嵌套弹窗</DialogTitle>
          </DialogHeader>
          <p>这个弹窗会自动显示在上层</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

#### Drawer 示例

```tsx
import { Drawer } from "@zstack/design";

function MyDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} setOpen={setOpen}>
      {/* 自动 z-index: 1000 */}
      <DrawerHeader>侧边栏标题</DrawerHeader>
      <DrawerBody>内容</DrawerBody>
    </Drawer>
  );
}
```

#### Popover 示例

```tsx
import { Popover, PopoverTrigger, PopoverContent } from "@zstack/design";

function MyPopover() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>触发器</PopoverTrigger>
      <PopoverContent open={open}>
        {/* 自动 z-index: 1030 */}
        弹出内容
      </PopoverContent>
    </Popover>
  );
}
```

## 高级用法

### 1. 手动覆盖 z-index（向后兼容）

如果需要特殊的 z-index，仍然可以手动指定：

```tsx
<DialogContent
  open={open}
  zIndex={9999} // 手动指定，会覆盖自动计算的值
>
  内容
</DialogContent>
```

### 2. 禁用自动管理

某些场景下可能不需要自动管理：

```tsx
<DialogContent
  open={open}
  disableAutoZIndex={true} // 禁用自动管理，使用默认值
>
  内容
</DialogContent>
```

### 3. 获取当前层级信息

如果需要在业务逻辑中使用层级信息：

```tsx
import { useOverlay } from "@zstack/design";

function MyComponent({ open }) {
  const { zIndex, isTop } = useOverlay({
    type: "dialog",
    open,
  });

  return <div style={{ zIndex }}>{isTop && <div>我是最顶层</div>}</div>;
}
```

## z-index 规则

### 基础 z-index 配置

参考 Ant Design 的设计：

| 组件类型 | 基础 z-index | 说明        |
| -------- | ------------ | ----------- |
| Dialog   | 1000         | 模态对话框  |
| Drawer   | 1000         | 抽屉/侧边栏 |
| Toast    | 1010         | 消息提示    |
| Popover  | 1030         | 弹出框      |
| Tooltip  | 1070         | 提示文本    |

### 递增规则

- 同类型的每个实例 z-index 递增 **10**
- 例如：
  - 第一个 Dialog: 1000
  - 第二个 Dialog: 1010
  - 第三个 Dialog: 1020
- 递增 10 而不是 1，是为内部子元素留出空间（如 overlay 和 content）

### 层级关系

在同一个弹窗内：

- Overlay（遮罩层）: `zIndex`
- Content（内容区）: `zIndex + 1`

这样确保内容始终在遮罩层之上。

## 架构设计

### 核心文件

```
packages/design/src/
├── utils/
│   ├── overlay-context.tsx    # Context 状态管理
│   ├── use-overlay.ts          # 自动 z-index Hook
│   └── use-container.ts        # 容器管理 Hook（预留）
└── components/primitive/
    ├── dialog.tsx              # 集成自动 z-index
    ├── drawer.tsx              # 集成自动 z-index
    └── popover.tsx             # 集成自动 z-index
```

### 工作原理

1. **OverlayProvider** 维护全局弹窗注册表
2. 组件打开时调用 `useOverlay` Hook 注册
3. 根据类型和已有数量计算 z-index
4. 组件关闭时自动注销

## 注意事项

### ⚠️ 必须注入 Provider

虽然系统会优雅降级，但强烈建议在应用根组件注入 `OverlayProvider`：

```tsx
// ✅ 推荐
<OverlayProvider>
  <App />
</OverlayProvider>

// ❌ 不推荐（会使用默认 z-index，无法自动管理）
<App />
```

### ⚠️ 传递 open 状态

确保将 `open` 状态传递给 `DialogContent` 等组件：

```tsx
// ✅ 正确
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent open={open}>  {/* 传递 open */}
    内容
  </DialogContent>
</Dialog>

// ❌ 错误（无法触发 z-index 计算）
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>  {/* 缺少 open */}
    内容
  </DialogContent>
</Dialog>
```

### ⚠️ 渐进式迁移

对于老代码，系统完全向后兼容：

```tsx
// 老代码：手动管理 z-index
<DialogContent zIndex={1050}>
  内容
</DialogContent>

// 新代码：自动管理
<DialogContent open={open}>
  内容
</DialogContent>

// 两种方式都能正常工作！
```

## 常见问题

### Q: 弹窗嵌套时层级不对？

**A:** 确保所有弹窗都传递了 `open` 状态：

```tsx
<DialogContent open={open}>  {/* 必须传递 open */}
```

### Q: 需要禁用某个弹窗的自动管理？

**A:** 使用 `disableAutoZIndex` 属性：

```tsx
<DialogContent disableAutoZIndex={true} open={open}>
```

### Q: 如何在表格内的 Select/Popover 中使用？

**A:** 这些组件已经集成了自动管理，直接使用即可：

```tsx
<Table>
  <TableCell>
    <Select>
      {/* Select 的下拉菜单会自动获得正确的 z-index */}
      <SelectContent open={open} />
    </Select>
  </TableCell>
</Table>
```

### Q: 性能影响？

**A:** 极小。系统使用 `useRef` 存储状态，只在必要时触发重渲染。

## 未来扩展

- [ ] 支持独立容器管理（`useContainer`）
- [ ] 支持 ESC 键只关闭最顶层弹窗
- [ ] 支持焦点陷阱管理
- [ ] 开发环境调试工具

## 参考

- [Ant Design Z-Index 管理](https://ant.design/docs/spec/z-index)
- [Radix UI Portal](https://www.radix-ui.com/docs/primitives/utilities/portal)
