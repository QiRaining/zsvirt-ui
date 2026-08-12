# @zstack/zsphere-constant

ZSV (ZStack Sphere Virtualization) 产品专属的常量映射包。

## 功能

提供 ZSV 产品中使用的常量枚举和映射函数，包括：

- `ConstantEnum` - 常量枚举定义
- `ConstantType` - 常量类型枚举
- `useConstantMap` - React Hook，用于获取国际化的常量映射

## 使用方式

```tsx
import { useConstantMap, ConstantEnum } from "@zstack/zsphere-constant";
import { useIntl } from "react-intl";

function MyComponent() {
  const intl = useIntl();
  const { constantMap, constantGroupMap } = useConstantMap(intl);

  // 使用常量映射
  const stateProps = constantMap.get(ConstantEnum.Running);

  return <div>{stateProps?.name}</div>;
}
```

## 与 @zstack/constant 的区别

- `@zstack/constant` - Cloud 产品线的常量包
- `@zstack/zsphere-constant` - ZSV 产品线的常量包

两个包相互独立，互不依赖。

## 构建

```bash
pnpm build
```

## 开发

```bash
pnpm dev  # 监听模式
```
