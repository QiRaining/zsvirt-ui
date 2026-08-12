# Detail 详情组件

## 概述

Detail 组件用于显示资源详情，目前包含：

- `DetailDrawer` - 详情抽屉组件

## 基础用法

### DetailDrawer - 详情抽屉

```tsx
import { DetailDrawer } from "@zstack/zsphere-design-biz";

const [visible, setVisible] = useState(false);

<DetailDrawer
  open={visible}
  setOpen={setVisible}
  tabTabPanes={[
    {
      key: "info",
      tab: "基本信息",
      children: <InfoPanel />,
    },
    {
      key: "config",
      tab: "配置",
      children: <ConfigPanel />,
      action: <Button>编辑</Button>,
    },
  ]}
/>;
```

### 自定义内容

```tsx
<DetailDrawer open={visible} setOpen={setVisible} width={800}>
  <div>自定义内容</div>
</DetailDrawer>
```

## DetailDrawer Props

| 属性        | 类型                    | 默认值 | 说明                             |
| ----------- | ----------------------- | ------ | -------------------------------- |
| open        | boolean                 | -      | 是否显示抽屉（必填）             |
| setOpen     | (open: boolean) => void | -      | 设置显示状态                     |
| onClose     | (e?: any) => void       | -      | 关闭回调                         |
| tabTabPanes | DetailDrawerTabPane[]   | []     | Tab 面板配置                     |
| children    | ReactNode               | -      | 自定义内容（优先于 tabTabPanes） |
| width       | string \| number        | 600    | 抽屉宽度                         |
| className   | string                  | -      | 自定义类名                       |

### DetailDrawerTabPane

| 属性     | 类型             | 说明           |
| -------- | ---------------- | -------------- |
| key      | string \| number | Tab 的唯一标识 |
| tab      | ReactNode        | Tab 标题       |
| children | ReactNode        | Tab 内容       |
| action   | ReactNode        | 操作按钮配置   |
| auth     | object           | 权限配置       |

## 与老组件差异

| 老组件          | 新组件                | 说明         |
| --------------- | --------------------- | ------------ |
| `Detail.Drawer` | `DetailDrawer`        | 命名方式变化 |
| antd Drawer     | @zstack/design Dialog | 底层组件变化 |
| `getContainer`  | 暂不支持              | 挂载容器配置 |
| `mask`          | 暂不支持              | 遮罩配置     |
| `placement`     | 固定右侧              | 位置配置     |

## 迁移示例

```tsx
// 老代码
import Detail from "@zstack/zsphere-components/Detail";

<Detail.Drawer
  open={visible}
  setOpen={setVisible}
  tabTabPanes={[...]}
/>

// 新代码
import { DetailDrawer } from "@zstack/zsphere-design-biz";

<DetailDrawer
  open={visible}
  setOpen={setVisible}
  tabTabPanes={[...]}
/>
```

注意：新组件基于 `@zstack/design` 的 Dialog 实现，部分 antd Drawer 特有的属性暂不支持。
