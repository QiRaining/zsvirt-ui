<div align="center">
  <a href="https://zsvirt.io/">
    <img
      src="./zsphere/apps/core-shell/src/assets/images/zsvirt-logo-horizontal-standard.svg"
      alt="ZSvirt Logo"
      width="180"
    >
  </a>

  <p><strong>ZSvirt Web 管理工作区</strong></p>

  <p>为计算、存储、网络、可靠性、数据保护、运维和平台管理提供统一操作界面。</p>

  <p>
    <a href="#resources">
      <img src="https://img.shields.io/badge/Resources-2563EB?style=flat-square&logo=readthedocs&logoColor=white" alt="资源入口">
    </a>
    <a href="#quick-start">
      <img src="https://img.shields.io/badge/Quick_Start-16A34A?style=flat-square" alt="快速开始">
    </a>
    <a href="https://zsvirt.io/roadmap/">
      <img src="https://img.shields.io/badge/Roadmap-D97706?style=flat-square&logo=github&logoColor=white" alt="路线图">
    </a>
    <a href="./CONTRIBUTING.md">
      <img src="https://img.shields.io/badge/Contributing-181717?style=flat-square&logo=github&logoColor=white" alt="参与贡献">
    </a>
  </p>

  <p>
    <a href="./README.md">English</a>
    &nbsp;&middot;&nbsp;
    <strong>简体中文</strong>
  </p>
</div>

## 项目介绍

ZSvirt UI 是 ZSvirt 的 Web 管理工作区，将计算、存储、网络、可靠性、数据保护、
运维和平台管理集中在一个界面中。

本仓库是一个 TypeScript 单仓库，由 Module Federation 主壳、React 领域应用、
共享 UI 包和 NestJS BFF 组成。领域应用可以独立开发，同时复用统一设计系统、
运行时、配置和 API 层。

具体功能是否可用取决于所连接的 ZSvirt 环境、安装版本及当前账户权限。

<a id="resources"></a>

## 项目资源

- [ZSvirt 官网](https://zsvirt.io/)
- [产品文档](https://zsvirt.io/docs/)
- [项目路线图](https://zsvirt.io/roadmap/)
- [贡献指南](CONTRIBUTING.md)
- [项目治理](GOVERNANCE.md)
- [安全政策](SECURITY.md)

## 产品导览

<details open>
  <summary><strong>📊 控制台概览 — 统一运维视图</strong></summary>

  <br>

  <p align="center">
    <a href="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-dashboard.png">
      <img
        src="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-dashboard.png"
        alt="ZSvirt 统一运维控制台"
        width="100%"
      >
    </a>
  </p>
</details>

<br>

<details>
  <summary><strong>🗂️ 资源清单 — 集中式基础设施管理</strong></summary>

  <br>

  <p align="center">
    <a href="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-inventory.png">
      <img
        src="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-inventory.png"
        alt="ZSvirt 集中式基础设施资源管理"
        width="100%"
      >
    </a>
  </p>
</details>

<br>

<details>
  <summary><strong>🔄 迁移管理 — 工作负载迁移</strong></summary>

  <br>

  <p align="center">
    <a href="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-migration-management.png">
      <img
        src="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-migration-management.png"
        alt="ZSvirt 迁移管理"
        width="100%"
      >
    </a>
  </p>
</details>

## 主要能力

| 统一资源管理                                           | 可靠性与数据保护                           | 运维与平台管理                                                             |
| ------------------------------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------- |
| 管理主机、虚拟机、镜像、模板、存储、网络和裸金属资源。 | 承载可靠性、快照、备份、迁移和恢复工作流。 | 在统一主壳中使用监控、报警、自动化、身份、访问控制、安全、设置和许可管理。 |

## 技术栈

**前端**

- React 18.3.1、TypeScript 5.9.3
- React Router 7.18.0、React Intl 6.7.0
- Rsbuild 2.0.0、Rspack 2.0.0、Module Federation 2.8.1

**工作区与质量工具**

- pnpm 11.9.0、Nx 22.7.7
- Oxlint 1.56.0、Oxfmt 0.41.0

**BFF**

- NestJS 11.1.28、Fastify 5.11.2
- Apollo Client 3.11.8、Apollo Server 5.5.1、GraphQL 16.11.0
- Sequelize 6.37.8、TypeScript 5.8.2

## 目录结构

```text
.
├── zsphere/
│   ├── apps/       # Core Shell 与各领域微前端
│   ├── bff/        # NestJS GraphQL BFF 与本地 Mock 服务
│   └── shared/     # 共享 UI、运行时、配置、类型和平台模块
├── packages/       # 通用设计、认证、表单、国际化、图标和工具库
├── ci/             # 依赖安全和许可证审计脚本
├── security/       # 依赖审计例外和许可证清单
├── patches/        # pnpm 依赖补丁
├── vendor/         # 必须随源码分发的第三方依赖与许可说明
├── .github/        # GitHub Actions 工作流
├── package.json    # 工作区脚本与根包元数据
└── pnpm-workspace.yaml  # 工作区定义和共享依赖目录
```

## 环境要求

- Node.js 22.13 或更高版本。
- 根目录 `packageManager` 固定的 pnpm 11.9.0。
- macOS 或 Linux；工作区启动命令使用 POSIX shell。

<a id="quick-start"></a>

## 快速开始

```bash
git clone https://github.com/ZSvirt/zsvirt-ui.git
cd zsvirt-ui
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install --frozen-lockfile
pnpm start
```

根启动命令会先构建共享库，然后启用本地 Mock 模式并启动 Core Shell、领域应用和
BFF。Mock 模式使用 SQLite、内存缓存和内存发布订阅，不依赖 Redis、MySQL、内网
或真实的 ZSvirt 管理服务。

各应用显示 ready 后访问：

- Web UI：<http://localhost:3000>
- GraphQL：<http://localhost:3100/graphql>

首次启动会先构建工作区共享库，因此会比后续热启动耗时更长。

> Mock 模式会绕过真实认证并返回模拟数据，只用于本地开发和产品体验，不应暴露
> 到不受信任的网络。

## 开发命令

```bash
pnpm start          # 构建共享库并启动完整 Mock 工作区
pnpm start:apps     # 仅启动 UI 应用
pnpm start:bff      # 仅启动 Mock BFF

pnpm build          # 构建全部可构建项目
pnpm build:apps     # 构建 UI 应用
pnpm build:bff      # 构建 BFF
pnpm build:libs     # 构建共享库

pnpm format:check
pnpm lint:ox
pnpm lint:all
pnpm security:audit:cve
pnpm security:audit:licenses
```

使用 `pnpm show:projects` 查看 Nx 项目，使用 `pnpm graph` 查看项目关系。

如果本机端口冲突，可用 `ZSV_PORT_OFFSET` 为全部 UI 开发端口增加统一偏移量，并用
`ZSV_BFF_PORT` 指定 BFF 端口：

```bash
ZSV_PORT_OFFSET=1000 ZSV_BFF_PORT=4100 pnpm start
```

此时 Web UI 位于 <http://localhost:4000>，GraphQL 位于
<http://localhost:4100/graphql>。

## 环境变量配置

本地 Mock 模式不需要环境变量文件。BFF 变量参考位于
`zsphere/bff/.env.example`；不要将其不经检查地复制到公开或生产环境。

如需连接你有权使用的服务，请创建未跟踪的 `zsphere/bff/.env`。当 `ZSV_MOCK`
未设置或不等于 `1` 时，BFF 使用非 Mock 模式，并需要管理服务、MySQL 和 Redis：

```dotenv
NODE_ENV=production
HOST=127.0.0.1
ZSV_BFF_PORT=3100

ZS_MN_SERVER=https://management-service.example.invalid:<management-port>
ZS_MYSQL_HOST=database.example.invalid
ZS_MYSQL_PORT=<database-port>
ZS_MYSQL_USERNAME=<database-user>
ZS_MYSQL_PASSWORD=<database-password>

ZS_REDIS_HOST=cache.example.invalid
ZS_REDIS_PORT=<cache-port>
# ZS_REDIS_PASSWORD=<cache-password>
```

禁止提交 `.env` 文件、服务地址、凭据、Token、客户数据、私有证书或生产环境配置。

## 参与贡献与项目治理

欢迎提交贡献。开发和评审流程请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)，社区参与
请遵守[行为准则](CODE_OF_CONDUCT.md)，项目角色和决策方式请参阅
[GOVERNANCE.md](GOVERNANCE.md)。

## 安全问题

请勿通过公开 Issue 报告安全漏洞。请按照 [SECURITY.md](SECURITY.md) 私密披露。

## 许可证

本项目采用 GNU General Public License v3.0 only（`GPL-3.0-only`），详见
[LICENSE](LICENSE)。第三方组件及其附加义务见
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和
[security/direct-dependency-licenses.md](security/direct-dependency-licenses.md)。

<br>
<hr>
<br>

<h2 align="center">为统一运维而构建</h2>

<p align="center">
  用一个工作区构建并运行 ZSvirt Web 管理体验。
</p>
