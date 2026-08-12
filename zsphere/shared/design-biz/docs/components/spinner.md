# Spinner 加载组件

## 概述

`Spinner` 是一个加载状态展示组件，基于 `@zstack/design` 的 `Spin` 组件封装，提供统一的加载状态展示。支持包裹内容显示遮罩、全屏加载、延迟显示等多种使用场景。

## 基础用法

最简单的用法是直接使用 `Spinner` 组件：

```tsx
import { Spinner } from "@zstack/zsphere-design-biz";

function App() {
  return <Spinner spinning />;
}
```

## 不同尺寸

`Spinner` 支持三种尺寸：`sm`（小）、`md`（中，默认）、`lg`（大）。

```tsx
import { Spinner } from "@zstack/zsphere-design-biz";

function App() {
  return (
    <div className="flex gap-4">
      <Spinner size="sm" spinning />
      <Spinner size="md" spinning />
      <Spinner size="lg" spinning />
    </div>
  );
}
```

## 带提示文字

通过 `tip` 属性可以添加加载提示文字：

```tsx
import { Spinner } from "@zstack/zsphere-design-biz";

function App() {
  return <Spinner spinning tip="加载中..." />;
}
```

## 包裹内容

`Spinner` 可以包裹任何内容，当 `spinning` 为 `true` 时会在内容上方显示加载遮罩：

```tsx
import { Spinner } from "@zstack/zsphere-design-biz";
import { useState } from "react";

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <Spinner spinning={loading} tip="数据加载中...">
      <div className="p-4">
        <h2>内容区域</h2>
        <p>这是被包裹的内容</p>
      </div>
    </Spinner>
  );
}
```

## 延迟显示

通过 `delay` 属性可以设置延迟显示加载效果的时间（单位：毫秒），用于防止快速切换时的闪烁：

```tsx
import { Spinner } from "@zstack/zsphere-design-biz";

function App() {
  return (
    <Spinner spinning tip="加载中..." delay={300}>
      <div>内容</div>
    </Spinner>
  );
}
```

## 全屏显示

通过 `fullscreen` 属性可以让加载效果全屏显示：

```tsx
import { Spinner } from "@zstack/zsphere-design-biz";

function App() {
  return <Spinner spinning tip="加载中..." fullscreen />;
}
```

## 自定义加载指示器

通过 `indicator` 属性可以自定义加载指示器：

```tsx
import { Spinner } from "@zstack/zsphere-design-biz";

function App() {
  return (
    <Spinner
      spinning
      indicator={<div className="custom-loader">自定义加载器</div>}
    />
  );
}
```

## Props

| 属性               | 类型                   | 默认值  | 说明                   |
| ------------------ | ---------------------- | ------- | ---------------------- |
| spinning           | `boolean`              | `true`  | 是否加载中             |
| size               | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸                   |
| tip                | `ReactNode`            | -       | 加载提示文字           |
| children           | `ReactNode`            | -       | 包裹内容               |
| delay              | `number`               | `0`     | 延迟显示(ms)           |
| fullscreen         | `boolean`              | `false` | 全屏显示               |
| indicator          | `ReactNode`            | -       | 自定义加载指示器       |
| className          | `string`               | -       | 自定义类名             |
| indicatorClassName | `string`               | -       | 自定义加载指示器的类名 |
| tipClassName       | `string`               | -       | 自定义 tip 的类名      |

## 与老组件 (Spin) 的差异

### 尺寸命名差异

| 老组件           | 新组件      | 说明             |
| ---------------- | ----------- | ---------------- |
| `size="small"`   | `size="sm"` | 小尺寸           |
| `size="default"` | `size="md"` | 中等尺寸（默认） |
| `size="large"`   | `size="lg"` | 大尺寸           |

### 其他改进

- 基于 `@zstack/design` 的 `Spin` 组件封装，提供更好的类型支持
- 使用 Tailwind CSS 样式系统
- 移除了对 Ant Design 的依赖
- 默认 `spinning` 值为 `true`，使用更便捷

## 迁移指南

从老组件 `Spin` 迁移到新组件 `Spinner`：

```tsx
// 老组件
import { Spin } from "@zstack/zsphere-components";

<Spin size="small" spinning={true} tip="加载中...">
  <div>内容</div>
</Spin>;

// 新组件
import { Spinner } from "@zstack/zsphere-design-biz";

<Spinner size="sm" spinning tip="加载中...">
  <div>内容</div>
</Spinner>;
```

主要变更：

- 组件名：`Spin` → `Spinner`
- 尺寸值：`small/default/large` → `sm/md/lg`
- 包名：`@zstack/zsphere-components` → `@zstack/zsphere-design-biz`
