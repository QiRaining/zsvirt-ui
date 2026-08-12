# Utils

工具函数目录，存放应用内的通用工具函数。

## 规范

- 工具函数文件使用 kebab-case 命名
- 每个工具函数应该有清晰的类型定义
- 导出时使用命名导出

## 示例

```typescript
// format-date.ts
export const formatDate = (date: Date): string => {
  // ...
};
```
