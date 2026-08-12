# Pages

页面组件目录，存放应用的页面级组件。

## 规范

- 页面文件使用 kebab-case 命名
- 每个页面应该有独立的目录（如果包含多个文件）
- 页面组件应该使用 PascalCase 命名

## 示例

```
pages/
  ├── index.tsx          # 首页
  ├── 404.tsx            # 404 页面
  └── user/
      ├── index.tsx      # 用户列表页
      └── detail.tsx     # 用户详情页
```
