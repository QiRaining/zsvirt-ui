# ResourceName 资源名称组件

## 概述

ResourceName 组件用于显示资源名称，支持链接、图标、省略等功能。

## 基础用法

```tsx
import { ResourceName } from "@zstack/zsphere-design-biz";

// 基础用法
<ResourceName value="vm-001" />

// 带图标
<ResourceName value="vm-001" icon={<StatusIcon />} />

// 带链接
<ResourceName
  value="vm-001"
  link={{ uuid: "xxx", to: "/vm/xxx" }}
/>

// 使用 react-router Link
import { Link } from "react-router-dom";

<ResourceName
  value="vm-001"
  link={{ uuid: "xxx", to: "/vm/xxx" }}
  LinkComponent={Link}
/>
```

## Props

| 属性            | 类型                                | 默认值 | 说明                       |
| --------------- | ----------------------------------- | ------ | -------------------------- |
| value           | string \| number \| boolean \| null | -      | 显示值                     |
| canModify       | boolean                             | false  | 是否可修改（影响空值显示） |
| icon            | ReactNode                           | -      | 前置图标                   |
| copyable        | boolean                             | false  | 是否可复制（暂不支持）     |
| ellipsis        | boolean                             | true   | 是否显示省略号             |
| link            | ResourceNameLinkProps               | -      | 链接配置                   |
| className       | string                              | -      | 自定义类名                 |
| isRouterManaged | boolean                             | true   | 是否由 Router 管理         |
| LinkComponent   | ComponentType                       | -      | 自定义链接组件             |

### ResourceNameLinkProps

| 属性         | 类型   | 说明      |
| ------------ | ------ | --------- |
| uuid         | string | 资源 UUID |
| to           | string | 链接路径  |
| resourceType | string | 资源类型  |

## 与老组件差异

| 老组件                 | 新组件                  | 说明           |
| ---------------------- | ----------------------- | -------------- |
| 内置 react-router Link | 通过 LinkComponent 传入 | 解耦路由依赖   |
| copyable 支持          | 暂不支持                | 复制功能待实现 |
| antd Text              | @zstack/design Text     | 底层组件变化   |

## 迁移示例

```tsx
// 老代码
import ResourceName from "@zstack/zsphere-components/ResourceName";

<ResourceName value="vm-001" link={{ uuid: "xxx", to: "/vm/xxx" }} copyable />;

// 新代码
import { ResourceName } from "@zstack/zsphere-design-biz";
import { Link } from "react-router-dom";

<ResourceName
  value="vm-001"
  link={{ uuid: "xxx", to: "/vm/xxx" }}
  LinkComponent={Link}
/>;
```

注意：

1. 需要显式传入 `LinkComponent` 以支持 react-router 链接
2. `copyable` 功能暂不支持，后续版本会添加
