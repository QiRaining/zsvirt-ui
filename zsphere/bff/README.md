# ZSvirt BFF

ZSvirt BFF 是基于 NestJS、GraphQL 和 Fastify 的后端聚合服务。

## 本地 Mock 模式

从仓库根目录运行：

```bash
pnpm start:bff
```

服务默认监听 `127.0.0.1:3100`，GraphQL 地址为 <http://localhost:3100/graphql>。

Mock 模式会：

- 使用 `@graphql-tools/mock` 为 GraphQL 请求生成结构化模拟数据；
- 绕过真实认证并注入模拟会话头；
- 使用内存 SQLite，不要求 MySQL 或 Redis；
- 开启 GraphQL introspection。

可通过 `ZSV_MOCK_LIST_LEN=<n>` 调整列表型模拟数据的默认长度。

> Mock 模式不提供真实鉴权，仅限受信任的本地开发环境。

## 单独开发

```bash
pnpm --dir zsphere/bff dev
pnpm --dir zsphere/bff build
pnpm --dir zsphere/bff test:unit
```

BFF 的公开静态资源目录固定为本项目下的 `public/`，无需配置部署服务器的绝对路径。
