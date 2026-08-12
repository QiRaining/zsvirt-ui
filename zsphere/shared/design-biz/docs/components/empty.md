# Empty 空状态组件

## 概述

`Empty` 是一个空状态展示组件，用于在数据为空时展示友好的提示信息。支持 `Table` 和 `Select` 两种类型，每种类型都有对应的默认图片和样式。

## 基础用法

最简单的用法是直接使用 `Empty` 组件：

```tsx
import { Empty } from "@zstack/zsphere-design-biz";

function App() {
  return <Empty />;
}
```

默认会显示 "暂无数据" 的提示（通过 `react-intl` 国际化）。

## Table 类型

`Table` 类型（默认）适用于表格、列表等场景：

```tsx
import { Empty } from "@zstack/zsphere-design-biz";

function TableComponent() {
  const data = [];

  if (data.length === 0) {
    return <Empty type="Table" />;
  }

  return <table>{/* 表格内容 */}</table>;
}
```

## Select 类型

`Select` 类型适用于下拉选择框等场景：

```tsx
import { Empty } from "@zstack/zsphere-design-biz";

function SelectComponent() {
  const options = [];

  if (options.length === 0) {
    return <Empty type="Select" />;
  }

  return <select>{/* 选项 */}</select>;
}
```

## 自定义描述

通过 `description` 属性可以自定义描述文字：

```tsx
import { Empty } from "@zstack/zsphere-design-biz";

function App() {
  return <Empty description="暂无数据，请稍后再试" />;
}
```

也可以传入 React 节点：

```tsx
import { Empty } from "@zstack/zsphere-design-biz";

function App() {
  return (
    <Empty
      description={
        <div>
          <p>暂无数据</p>
          <button>刷新</button>
        </div>
      }
    />
  );
}
```

## 自定义图片

通过 `image` 属性可以自定义图片：

```tsx
import { Empty } from "@zstack/zsphere-design-biz";

function App() {
  return (
    <Empty
      image={<img src="/custom-empty.png" alt="空状态" />}
      description="自定义空状态"
    />
  );
}
```

## 加载状态

通过 `loading` 和 `isFirst` 属性可以控制加载状态的显示：

```tsx
import { Empty } from "@zstack/zsphere-design-biz";
import { useState, useEffect } from "react";

function App() {
  const [loading, setLoading] = useState(true);
  const [isFirst, setIsFirst] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    // 首次加载时显示白色占位图，不显示描述文字
    fetchData().then((result) => {
      setData(result);
      setLoading(false);
      setIsFirst(false);
    });
  }, []);

  if (data.length === 0) {
    return <Empty loading={loading} isFirst={isFirst} description="暂无数据" />;
  }

  return <div>{/* 数据展示 */}</div>;
}
```

**注意**：当 `loading` 和 `isFirst` 同时为 `true` 时，会显示白色占位图且不显示描述文字。

## ConfigEmptyProvider 使用

`ConfigEmptyProvider` 用于全局配置空状态组件的默认属性，避免在每个 `Empty` 组件中重复设置：

```tsx
import { Empty, ConfigEmptyProvider } from "@zstack/zsphere-design-biz";

function App() {
  return (
    <ConfigEmptyProvider
      type="Table"
      description="全局默认描述"
      imageStyle={{ width: 200, height: 200 }}
    >
      <div>
        {/* 所有 Empty 组件都会继承上述配置 */}
        <Empty /> {/* 使用全局配置 */}
        <Empty description="覆盖描述" /> {/* 可以覆盖全局配置 */}
      </div>
    </ConfigEmptyProvider>
  );
}
```

### useEmptyConfig Hook

如果需要获取当前的空状态配置，可以使用 `useEmptyConfig` Hook：

```tsx
import { useEmptyConfig } from "@zstack/zsphere-design-biz";

function CustomComponent() {
  const config = useEmptyConfig();

  return (
    <div>
      <p>当前类型: {config.type}</p>
      <p>是否加载中: {config.loading ? "是" : "否"}</p>
    </div>
  );
}
```

## customRenderEmpty 函数

`customRenderEmpty` 是一个兼容函数，用于在其他组件中渲染空状态，兼容老 API：

```tsx
import { customRenderEmpty } from "@zstack/zsphere-design-biz";

function TableComponent() {
  const data = [];

  if (data.length === 0) {
    return (
      <div>
        {customRenderEmpty({
          type: "Table",
          description: "暂无数据",
          loading: false,
        })}
      </div>
    );
  }

  return <table>{/* 表格内容 */}</table>;
}
```

## Props

| 属性        | 类型                  | 默认值       | 说明       |
| ----------- | --------------------- | ------------ | ---------- |
| type        | `'Table' \| 'Select'` | `'Table'`    | 类型       |
| description | `ReactNode`           | `'暂无数据'` | 描述文字   |
| loading     | `boolean`             | -            | 加载状态   |
| isFirst     | `boolean`             | -            | 首次加载   |
| image       | `ReactNode`           | -            | 自定义图片 |
| imageStyle  | `CSSProperties`       | -            | 图片样式   |
| className   | `string`              | -            | 自定义类名 |
| style       | `CSSProperties`       | -            | 自定义样式 |
| children    | `ReactNode`           | -            | 子元素     |

## ConfigEmptyProvider Props

| 属性        | 类型                  | 默认值 | 说明             |
| ----------- | --------------------- | ------ | ---------------- |
| type        | `'Table' \| 'Select'` | -      | 默认类型         |
| loading     | `boolean`             | -      | 默认加载状态     |
| isFirst     | `boolean`             | -      | 默认首次加载状态 |
| description | `ReactNode`           | -      | 默认描述文字     |
| imageStyle  | `CSSProperties`       | -      | 默认图片样式     |
| children    | `ReactNode`           | -      | 子元素           |

## 与老组件的差异

### API 兼容性

- API 保持兼容，可以直接替换使用
- 移除了对 Ant Design 的依赖
- 使用 Tailwind CSS 样式系统

### 样式改进

- 使用 Tailwind CSS 原子化类名
- 更好的响应式支持
- 更灵活的样式定制

### 功能增强

- 新增 `ConfigEmptyProvider` 全局配置能力
- 新增 `useEmptyConfig` Hook 获取配置
- 新增 `customRenderEmpty` 兼容函数
- 支持首次加载时的特殊显示逻辑

## 迁移指南

从老组件迁移到新组件：

```tsx
// 老组件
import { Empty } from "@zstack/zsphere-components";

<Empty type="Table" description="暂无数据" />;

// 新组件
import { Empty } from "@zstack/zsphere-design-biz";

<Empty type="Table" description="暂无数据" />;
```

主要变更：

- 包名：`@zstack/zsphere-components` → `@zstack/zsphere-design-biz`
- API 保持兼容，可以直接替换
- 样式系统从 Less 迁移到 Tailwind CSS

## 使用场景示例

### 表格空状态

```tsx
import { Empty } from "@zstack/zsphere-design-biz";

function DataTable({ data }) {
  if (!data || data.length === 0) {
    return <Empty type="Table" description="暂无数据" />;
  }

  return <table>{/* 表格内容 */}</table>;
}
```

### 下拉选择框空状态

```tsx
import { Empty } from "@zstack/zsphere-design-biz";

function CustomSelect({ options }) {
  if (!options || options.length === 0) {
    return <Empty type="Select" description="暂无选项" />;
  }

  return (
    <select>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
```

### 全局配置空状态

```tsx
import { Empty, ConfigEmptyProvider } from "@zstack/zsphere-design-biz";

function App() {
  return (
    <ConfigEmptyProvider
      type="Table"
      description="暂无数据"
      imageStyle={{ width: 200 }}
    >
      <DataTable />
      <DataList />
      {/* 所有 Empty 组件都会使用全局配置 */}
    </ConfigEmptyProvider>
  );
}
```
