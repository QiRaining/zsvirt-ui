# Components

组件目录，存放应用内的可复用组件。

## 组件规范

- 组件文件使用 PascalCase 命名
- 每个组件应该有独立的目录，包含：
  - `index.tsx` - 组件主文件
  - `style.module.less` - 组件样式（如果需要）
  - `types.ts` - 组件类型定义（如果需要）

## 示例

```
components/
  ├── Button/
  │   ├── index.tsx
  │   ├── style.module.less
  │   └── types.ts
  └── Card/
      ├── index.tsx
      └── style.module.less
```
