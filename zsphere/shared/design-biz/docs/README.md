# @zstack/zsphere-design-biz

ZSV 产品业务组件库，基于 `@zstack/design` 设计系统构建。

## 📦 简介

`@zstack/zsphere-design-biz` 是 ZSV 产品的业务组件库，从基于 Ant Design 的老组件库（`@zstack/zsphere-components`）迁移而来。新组件库基于 `@zstack/design` 设计系统，提供更现代化的组件 API 和更好的类型支持。

## 🚀 安装

```bash
pnpm add @zstack/zsphere-design-biz
```

## 📖 使用

### 基础使用

```tsx
import { DialogWeak, Username } from "@zstack/zsphere-design-biz";
import "@zstack/zsphere-design-biz/dist/style.css";

function App() {
  return (
    <div>
      <DialogWeak open={true} onOpenChange={(open) => console.log(open)}>
        内容
      </DialogWeak>
      <Username />
    </div>
  );
}
```

### 样式导入

组件库的样式文件需要在使用组件前导入：

```tsx
import "@zstack/zsphere-design-biz/dist/style.css";
```

## 📚 组件列表

### 已迁移组件

| 组件         | 状态      | 文档                                           |
| ------------ | --------- | ---------------------------------------------- |
| `DialogWeak` | ✅ 已完成 | [DialogWeak 文档](./components/dialog-weak.md) |
| `Username`   | ✅ 已完成 | [Username 文档](./components/username.md)      |

### 迁移中组件

暂无

### 待迁移组件

详见 [迁移进度](./PROGRESS.md)

## 🔗 相关文档

- [应用接入指南](./APP-INTEGRATION.md) - 如何在应用中使用本组件库
- [迁移指南](./MIGRATION.md) - 从老组件库迁移到新组件库
- [迁移进度](./PROGRESS.md) - 组件迁移进度追踪

## 🛠️ 开发

### 构建

```bash
pnpm build
```

### 开发模式（监听文件变化）

```bash
pnpm dev
```

### 测试

```bash
pnpm test
```

### 测试覆盖率

```bash
pnpm test:coverage
```

## 📝 技术栈

- **基础设计系统**: `@zstack/design`
- **构建工具**: `@rslib/core`
- **样式**: Tailwind CSS v4 + PostCSS
- **测试**: Vitest + Testing Library
- **类型**: TypeScript 5.8.2

## 🤝 贡献

在添加新组件或修改现有组件时，请遵循以下规范：

1. 基于 `@zstack/design` 设计系统构建
2. 提供完整的 TypeScript 类型定义
3. 编写单元测试（覆盖率要求 80%+）
4. 更新组件文档
5. 更新 [迁移进度](./PROGRESS.md)

## 📄 许可证

内部项目，遵循 ZStack 内部许可证协议。
