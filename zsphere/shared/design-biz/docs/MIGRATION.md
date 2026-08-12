# 迁移指南

本文档介绍如何从老组件库 `@zstack/zsphere-components` 迁移到新组件库 `@zstack/zsphere-design-biz`。

## 📋 迁移概述

### 迁移原因

- **现代化设计系统**：基于 `@zstack/design` 设计系统，提供更一致的设计语言
- **更好的类型支持**：完整的 TypeScript 类型定义
- **性能优化**：更小的包体积，更好的 Tree Shaking 支持
- **维护性提升**：统一的组件 API，更易于维护和扩展

### 迁移原则

1. **渐进式迁移**：逐步替换，不要求一次性完成
2. **向后兼容**：尽量保持 API 相似，减少迁移成本
3. **功能对等**：确保迁移后功能保持一致
4. **测试验证**：每个组件迁移后都要进行充分测试

## 🔄 API 差异对照表

### DialogWeak

#### 老组件库 (`@zstack/zsphere-components`)

```tsx
import { Modal } from "@zstack/zsphere-components";

<Modal.Base visible={visible} onCancel={() => setVisible(false)} title="标题">
  内容
</Modal.Base>;
```

#### 新组件库 (`@zstack/zsphere-design-biz`)

```tsx
import { DialogWeak } from "@zstack/zsphere-design-biz";

<DialogWeak open={open} onOpenChange={(open) => setOpen(open)} title="标题">
  内容
</DialogWeak>;
```

#### 主要差异

| 属性     | 老组件库   | 新组件库       | 说明                                      |
| -------- | ---------- | -------------- | ----------------------------------------- |
| 显示控制 | `visible`  | `open`         | 属性名变更                                |
| 关闭回调 | `onCancel` | `onOpenChange` | 回调函数变更，新 API 提供完整的 open 状态 |

### Username

#### 老组件库

```tsx
// 如果老组件库有 Username 组件
import { Username } from "@zstack/zsphere-components";
```

#### 新组件库

```tsx
import { Username } from "@zstack/zsphere-design-biz";
```

## 📝 迁移步骤

### 1. 识别需要迁移的组件

在项目中搜索 `@zstack/zsphere-components` 的使用：

```bash
grep -r "@zstack/zsphere-components" src/
```

### 2. 安装新组件库

```bash
pnpm add @zstack/zsphere-design-biz
```

### 3. 导入样式

在应用入口文件添加：

```tsx
import "@zstack/zsphere-design-biz/dist/style.css";
```

### 4. 替换导入语句

将：

```tsx
import { ComponentName } from "@zstack/zsphere-components";
```

替换为：

```tsx
import { ComponentName } from "@zstack/zsphere-design-biz";
```

### 5. 更新组件属性

根据 [API 差异对照表](#-api-差异对照表) 更新组件属性。

### 6. 测试验证

- 功能测试：确保组件功能正常
- 样式测试：检查样式显示是否正确
- 交互测试：验证用户交互是否正常

### 7. 移除旧依赖（迁移完成后）

当所有组件都迁移完成后，从 `package.json` 中移除：

```json
{
  "dependencies": {
    // "@zstack/zsphere-components": "workspace:*" // 已移除
  }
}
```

## 🔍 迁移检查清单

### 导入检查

- [ ] 已安装 `@zstack/zsphere-design-biz`
- [ ] 已导入组件库样式
- [ ] 已更新所有导入语句

### 组件检查

- [ ] 组件属性已更新（如 `visible` → `open`）
- [ ] 回调函数已更新（如 `onCancel` → `onOpenChange`）
- [ ] 类型定义已更新

### 测试检查

- [ ] 功能测试通过
- [ ] 样式显示正确
- [ ] 交互功能正常
- [ ] 无控制台错误

### 清理检查

- [ ] 已移除未使用的导入
- [ ] 已移除旧组件库依赖（迁移完成后）
- [ ] 已更新相关文档

## ⚠️ 常见问题

### Q: 某些组件在新组件库中找不到？

**A**: 该组件可能尚未迁移。请查看 [迁移进度](./PROGRESS.md)，或暂时继续使用老组件库。

### Q: API 差异较大，如何迁移？

**A**: 参考组件文档了解新 API，或联系组件库维护者获取迁移建议。

### Q: 迁移后样式显示异常？

**A**:

1. 检查样式导入顺序
2. 确认 CSS 变量是否正确配置
3. 检查是否有样式冲突

### Q: 如何回退到老组件库？

**A**: 如果遇到问题需要回退，可以：

1. 恢复导入语句
2. 恢复组件属性
3. 暂时移除新组件库样式导入

## 📚 相关资源

- [组件库总览](./README.md)
- [应用接入指南](./APP-INTEGRATION.md)
- [迁移进度](./PROGRESS.md)
- [组件文档](./components/)

## 🆘 获取帮助

如果在迁移过程中遇到问题：

1. 查看组件文档
2. 检查 [常见问题](#-常见问题)
3. 联系组件库维护团队
