# ZSvirt UI

ZSvirt UI 是基于 React、Rsbuild、Module Federation、NestJS 和 Nx 的虚拟化管理界面单仓库。仓库默认提供本地 Mock 模式，不依赖内网、MySQL、Redis 或真实 ZStack 管理节点即可启动完整前端和 BFF。

## 快速开始

要求：

- Node.js 22.13 或更高版本
- pnpm 11.9.0
- macOS 或 Linux（启动命令使用 POSIX shell）

```bash
git clone https://github.com/ZSvirt/zsvirt-ui.git
cd zsvirt-ui
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install --frozen-lockfile
pnpm start
```

启动完成后访问：

- Web UI：<http://localhost:3000>
- GraphQL：<http://localhost:3100/graphql>

首次启动会先构建工作区共享库，再并行启动 BFF 和所有前端微应用，因此会比后续热启动耗时更长。

> Mock 模式会绕过真实认证并返回模拟数据，只用于本地开发和功能预览，不应暴露到公网。

## 常用命令

```bash
pnpm start                 # 构建共享库并启动完整 Mock 环境
pnpm start:apps            # 仅启动前端微应用
pnpm start:bff             # 仅启动 Mock BFF
pnpm build                 # 构建所有共享库、应用和 BFF
pnpm lint:all              # 运行全仓静态检查
pnpm security:audit:cve    # 检查高危依赖漏洞
pnpm security:audit:licenses
```

如本机端口冲突，可通过 `ZSV_PORT_OFFSET` 为全部前端开发端口增加统一偏移量，并用 `ZSV_BFF_PORT` 调整 BFF 端口。例如：

```bash
ZSV_PORT_OFFSET=1000 ZSV_BFF_PORT=4100 pnpm start
```

此时 Web UI 位于 <http://localhost:4000>，GraphQL 位于 <http://localhost:4100/graphql>。

## 仓库结构

```text
packages/                 通用 React 基础包
zsphere/apps/             前端微应用
zsphere/shared/           ZSvirt 共享业务包
zsphere/bff/              NestJS GraphQL BFF 与 Mock 服务
ci/security/              依赖许可证检查脚本
security/                 已提交的依赖许可证清单
vendor/                   必须随源码分发的第三方归档
```

Module Federation 应用和端口的唯一配置位于 `zsphere/shared/mf-hub/src/mf-config.ts`。本地开发默认从 localhost 加载各微应用；若显式设置 `ZSV_DEV_MF=true`，还必须提供 `ZSV_MF_FALLBACK_SERVER`，配置缺失时构建会直接失败。

## 贡献与安全

提交代码前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。安全问题请按 [SECURITY.md](SECURITY.md) 私下报告，不要创建公开 Issue。

## 许可证

本项目采用 [GNU General Public License v3.0](LICENSE)。第三方组件及其附加义务见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 [security/direct-dependency-licenses.md](security/direct-dependency-licenses.md)。
