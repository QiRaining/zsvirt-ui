# GraphQL

GraphQL 查询和变更定义目录。

## 规范

- GraphQL 文件使用 kebab-case 命名
- 查询命名使用 PascalCase + Query/Mutation 后缀
- 优先把 gql 写在组件的 TS/TSX 文件中，不要写在单独的 gql 文件中

## 示例

```typescript
// 在组件文件中直接定义
import { gql } from "@apollo/client";

const USER_LIST_QUERY = gql`
  query UserListQuery($filter: UserFilter) {
    users(filter: $filter) {
      id
      name
      email
    }
  }
`;
```
