# Title 标题组件

## 概述

Title 组件用于显示页面或区块的标题，可选择性地显示资源名称。

## 基础用法

```tsx
import { Title } from "@zstack/zsphere-design-biz";

// 基础用法
<Title title="虚拟机" />

// 带资源名称
<Title title="虚拟机" resourceName="vm-001" />
```

## Props

| 属性         | 类型   | 默认值 | 说明             |
| ------------ | ------ | ------ | ---------------- |
| title        | string | -      | 标题文本（必填） |
| resourceName | string | -      | 资源名称（可选） |
| className    | string | -      | 自定义类名       |

## 与老组件差异

| 老组件                    | 新组件           | 说明             |
| ------------------------- | ---------------- | ---------------- |
| Less 样式                 | Tailwind CSS     | 样式系统变化     |
| `.titleResourceName` 类名 | 内联 Tailwind 类 | 样式定义方式变化 |

## 迁移示例

```tsx
// 老代码
import Title from "@zstack/zsphere-components/Title";

<Title title="虚拟机" resourceName="vm-001" />;

// 新代码
import { Title } from "@zstack/zsphere-design-biz";

<Title title="虚拟机" resourceName="vm-001" />;
```

API 完全兼容，无需修改使用方式。
