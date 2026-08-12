# Header 头部组件

## 概述

Header 组件用于页面头部区域，包含两个子组件：

- `HeaderList` - 列表页头部
- `HeaderDetail` - 详情页头部

## 基础用法

### HeaderList - 列表页头部

```tsx
import { HeaderList } from "@zstack/zsphere-design-biz";

<HeaderList
  title="虚拟机列表"
  description="管理所有虚拟机资源"
  extra={<Button>创建虚拟机</Button>}
/>;
```

### HeaderDetail - 详情页头部

```tsx
import { HeaderDetail } from "@zstack/zsphere-design-biz";

<HeaderDetail
  icon="IconVm"
  title="虚拟机-001"
  actions={
    <>
      <Button>启动</Button>
      <Button>停止</Button>
    </>
  }
  fields={<StatusBadge status="running" />}
/>;
```

## HeaderList Props

| 属性              | 类型                   | 默认值 | 说明                         |
| ----------------- | ---------------------- | ------ | ---------------------------- |
| title             | string                 | -      | 标题（必填）                 |
| description       | ReactNode              | -      | 描述文本                     |
| extra             | ReactNode              | -      | 额外操作区域                 |
| docReaderPath     | string                 | -      | 文档路径，用于"了解更多"链接 |
| customDescription | ReactNode              | -      | 自定义描述区域               |
| onDocClick        | (path: string) => void | -      | 点击"了解更多"的回调         |
| className         | string                 | -      | 自定义类名                   |

## HeaderDetail Props

| 属性      | 类型                     | 默认值 | 说明         |
| --------- | ------------------------ | ------ | ------------ |
| title     | string \| ReactElement   | -      | 标题（必填） |
| icon      | IconName \| ReactElement | -      | 图标         |
| actions   | ReactElement             | -      | 操作按钮区域 |
| fields    | ReactElement             | -      | 字段信息区域 |
| suffix    | ComponentType            | -      | 标题后缀组件 |
| className | string                   | -      | 自定义类名   |

## 与老组件差异

| 老组件                     | 新组件                         | 说明                       |
| -------------------------- | ------------------------------ | -------------------------- |
| `Header.List`              | `HeaderList`                   | 命名方式变化，支持单独导入 |
| `Header.Detail`            | `HeaderDetail`                 | 命名方式变化，支持单独导入 |
| antd 样式                  | Tailwind CSS                   | 样式系统变化               |
| `docReaderPath` + bus.emit | `docReaderPath` + `onDocClick` | 文档链接改为回调函数       |

## 迁移示例

```tsx
// 老代码
import Header from "@zstack/zsphere-components/Header";

<Header.List
  title="虚拟机列表"
  description="管理虚拟机"
  docReaderPath="/docs/vm"
/>;

// 新代码
import { HeaderList } from "@zstack/zsphere-design-biz";
import { bus } from "@zstack/zsphere-utils";

<HeaderList
  title="虚拟机列表"
  description="管理虚拟机"
  docReaderPath="/docs/vm"
  onDocClick={(path) => bus.emit("CHANGE_GLOBAL_DOC_READER_PATH", path)}
/>;
```
