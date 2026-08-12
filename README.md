<div align="center">
  <a href="https://zsvirt.io/">
    <img
      src="./zsphere/apps/core-shell/src/assets/images/zsvirt-logo-horizontal-standard.svg"
      alt="ZSvirt Logo"
      width="180"
    >
  </a>

  <p><strong>The web management workspace for ZSvirt.</strong></p>

  <p>
    A unified interface for compute, storage, networking, reliability, data
    protection, operations, and platform administration.
  </p>

  <p>
    <a href="#resources">
      <img src="https://img.shields.io/badge/Resources-2563EB?style=flat-square&logo=readthedocs&logoColor=white" alt="Resources">
    </a>
    <a href="#quick-start">
      <img src="https://img.shields.io/badge/Quick_Start-16A34A?style=flat-square" alt="Quick Start">
    </a>
    <a href="https://zsvirt.io/roadmap/">
      <img src="https://img.shields.io/badge/Roadmap-D97706?style=flat-square&logo=github&logoColor=white" alt="Roadmap">
    </a>
    <a href="./CONTRIBUTING.md">
      <img src="https://img.shields.io/badge/Contributing-181717?style=flat-square&logo=github&logoColor=white" alt="Contributing">
    </a>
  </p>

  <p>
    <strong>English</strong>
    &nbsp;&middot;&nbsp;
    <a href="./README_zh.md">简体中文</a>
  </p>
</div>

## Introduction

ZSvirt UI is the web management workspace for ZSvirt. It brings compute,
storage, networking, reliability, data protection, operations, and platform
administration into one interface.

This repository is a TypeScript monorepo built around a Module Federation host,
domain-focused React applications, shared UI packages, and a NestJS backend for
frontend (BFF). Domain applications can be developed independently while
sharing a common design system, runtime, configuration, and API layer.

Availability of individual features depends on the connected ZSvirt
environment, installed edition, and permissions of the signed-in account.

<a id="resources"></a>

## Resources

- [ZSvirt website](https://zsvirt.io/)
- [Product documentation](https://zsvirt.io/docs/)
- [Project roadmap](https://zsvirt.io/roadmap/)
- [Contribution guide](CONTRIBUTING.md)
- [Governance](GOVERNANCE.md)
- [Security policy](SECURITY.md)

## Product tour

<details open>
  <summary><strong>📊 Dashboard — unified operations overview</strong></summary>

  <br>

  <p align="center">
    <a href="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-dashboard.png">
      <img
        src="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-dashboard.png"
        alt="ZSvirt Unified Operations Dashboard"
        width="100%"
      >
    </a>
  </p>
</details>

<br>

<details>
  <summary><strong>🗂️ Inventory — centralized infrastructure management</strong></summary>

  <br>

  <p align="center">
    <a href="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-inventory.png">
      <img
        src="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-inventory.png"
        alt="ZSvirt Centralized Infrastructure Inventory"
        width="100%"
      >
    </a>
  </p>
</details>

<br>

<details>
  <summary><strong>🔄 Migration management — workload migration</strong></summary>

  <br>

  <p align="center">
    <a href="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-migration-management.png">
      <img
        src="https://raw.githubusercontent.com/ZSvirt/.github/main/assets/zsvirt-migration-management.png"
        alt="ZSvirt Migration Management"
        width="100%"
      >
    </a>
  </p>
</details>

## Core capabilities

| Unified resource management                                                                     | Reliability and data protection                                           | Operations and administration                                                                                   |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Manage hosts, virtual machines, images, templates, storage, networks, and bare-metal resources. | Operate reliability, snapshot, backup, migration, and recovery workflows. | Use monitoring, alarms, automation, identity, access control, security, settings, and licensing from one shell. |

## Technology

**Frontend**

- React 18.3.1 and TypeScript 5.9.3
- React Router 7.18.0 and React Intl 6.7.0
- Rsbuild 2.0.0, Rspack 2.0.0, and Module Federation 2.8.1

**Workspace and quality**

- pnpm 11.9.0 and Nx 22.7.7
- Oxlint 1.56.0 and Oxfmt 0.41.0

**BFF**

- NestJS 11.1.28 and Fastify 5.11.2
- Apollo Client 3.11.8, Apollo Server 5.5.1, and GraphQL 16.11.0
- Sequelize 6.37.8 and TypeScript 5.8.2

## Repository layout

```text
.
├── zsphere/
│   ├── apps/       # Core Shell and domain micro-frontends
│   ├── bff/        # NestJS GraphQL backend-for-frontend and local mock server
│   └── shared/     # Shared UI, runtime, configuration, types, and platform modules
├── packages/       # Reusable design, auth, form, i18n, icon, and utility libraries
├── ci/             # Dependency security and license audit scripts
├── security/       # Dependency audit exceptions and license inventory
├── patches/        # pnpm dependency patches
├── vendor/         # Vendored compatibility dependencies and their notices
├── .github/        # GitHub Actions workflows
├── package.json    # Workspace scripts and root package metadata
└── pnpm-workspace.yaml  # Workspace definitions and shared dependency catalog
```

## Prerequisites

- Node.js 22.13 or later.
- pnpm 11.9.0, as pinned by the root `packageManager` setting.
- macOS or Linux. The workspace start commands use a POSIX shell.

<a id="quick-start"></a>

## Quick start

```bash
git clone https://github.com/ZSvirt/zsvirt-ui.git
cd zsvirt-ui
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install --frozen-lockfile
pnpm start
```

The root start command builds shared libraries, enables local mock mode, and
starts the Core Shell, domain applications, and BFF. Mock mode uses SQLite plus
in-memory cache and pub/sub implementations, so it does not require Redis,
MySQL, an internal network, or a ZSvirt management service.

Open the following endpoints after the applications report that they are ready:

- Web UI: <http://localhost:3000>
- GraphQL: <http://localhost:3100/graphql>

The first start takes longer because the workspace libraries are built before
the development servers are launched.

> Mock mode bypasses real authentication and returns generated data. Use it
> only for local development and product evaluation. Do not expose it to an
> untrusted network.

## Development commands

```bash
pnpm start          # build shared libraries and start the complete mock workspace
pnpm start:apps     # start UI applications only
pnpm start:bff      # start the mock BFF only

pnpm build          # build all buildable projects
pnpm build:apps     # build UI applications
pnpm build:bff      # build the BFF
pnpm build:libs     # build shared libraries

pnpm format:check
pnpm lint:ox
pnpm lint:all
pnpm security:audit:cve
pnpm security:audit:licenses
```

Use `pnpm show:projects` to list Nx projects and `pnpm graph` to inspect their
relationships.

If local ports conflict, use `ZSV_PORT_OFFSET` to add a uniform offset to all UI
development ports and `ZSV_BFF_PORT` to select the BFF port:

```bash
ZSV_PORT_OFFSET=1000 ZSV_BFF_PORT=4100 pnpm start
```

In this example, the Web UI is available at <http://localhost:4000> and GraphQL
at <http://localhost:4100/graphql>.

## Environment configuration

No environment file is required for local mock mode. The BFF variable reference
is available in `zsphere/bff/.env.example`; do not copy it unchanged into a
public or production environment.

For development against services you are authorized to use, create an untracked
`zsphere/bff/.env`. Non-mock mode is selected whenever `ZSV_MOCK` is unset or is
not `1` and requires a management service, MySQL, and Redis:

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

Never commit `.env` files, service addresses, credentials, tokens, customer
data, private certificates, or production configuration.

## Contributing and governance

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the
development and review workflow, follow our
[Code of Conduct](CODE_OF_CONDUCT.md), and read
[GOVERNANCE.md](GOVERNANCE.md) for project roles and decision-making.

## Security

Do not report vulnerabilities through a public issue. Follow
[SECURITY.md](SECURITY.md) to disclose them privately.

## License

This project is licensed under the GNU General Public License v3.0 only
(`GPL-3.0-only`). See [LICENSE](LICENSE). Third-party components and additional
obligations are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
and [security/direct-dependency-licenses.md](security/direct-dependency-licenses.md).

<br>
<hr>
<br>

<h2 align="center">Built for Unified Operations</h2>

<p align="center">
  One workspace for building and operating the ZSvirt web management experience.
</p>
