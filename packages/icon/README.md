# @zstack/icon

ZStack UI Next 的图标源包。ZSV 新增和消费图标时统一使用本包。

## 使用方式

### 通过 type 使用

适合菜单、Action、配置项等已经以图标名驱动的场景。

```tsx
import { Icon } from "@zstack/icon";

<Icon type="vm-snapshot-policy" className="h-4 w-4" />;
```

### 应用图标和插图图标

```tsx
import { AppIcon, IllusIconSuccess } from "@zstack/icon";

<AppIcon type="backup" className="h-6 w-6" />;
<IllusIconSuccess className="h-20 w-20" />;
```

## 图标目录

| 类型     | SVG 目录                  | 导出形式                                |
| -------- | ------------------------- | --------------------------------------- |
| 普通图标 | `src/assets/icons/`       | `IconXxx` / `<Icon type="xxx" />`       |
| 应用图标 | `src/assets/app-icons/`   | `AppIconXxx` / `<AppIcon type="xxx" />` |
| 插图图标 | `src/assets/illus-icons/` | `IllusIconXxx`                          |

普通业务图标默认放到 `src/assets/icons/`。只有明确是应用入口图标或插图图标时，才放到 `app-icons` 或 `illus-icons`。

## 新增图标流程

1. 放入 SVG 文件，文件名使用 kebab-case。

```text
packages/icon/src/assets/icons/vm-snapshot-policy.svg
```

2. 生成导出和映射。

```bash
pnpm --filter @zstack/icon gen
```

3. 校验生成文件和 SVG 规范。

```bash
pnpm --filter @zstack/icon check
```

4. 构建图标包。

```bash
pnpm --filter @zstack/icon build
```

5. 在 ZSV 中使用。

```tsx
import { Icon } from "@zstack/icon";

<Icon type="vm-snapshot-policy" />;
```

## ZSV 使用约束

ZSV 代码统一从 `@zstack/icon` 导入图标：

```tsx
import { Icon } from "@zstack/icon";

<Icon className="h-4 w-4" type="close" />;
```

不要从业务代码中直接导入 `IconClose` 这类图标组件。

## 常用命令

```bash
pnpm --filter @zstack/icon gen
pnpm --filter @zstack/icon check
pnpm --filter @zstack/icon type-check
pnpm --filter @zstack/icon build
```

## 兼容说明

ZSV 开发者新增和使用图标时，只需要面对 `@zstack/icon`。
