# Contributing to ZSvirt UI

Thank you for helping improve ZSvirt UI. Contributions may include code,
documentation, translations, bug reports, and design feedback.

By participating, you agree to follow our
[Code of Conduct](CODE_OF_CONDUCT.md). See [GOVERNANCE.md](GOVERNANCE.md) for
project roles, responsibilities, and decision-making.

## Before you start

- Search existing issues and discussions before proposing duplicate work.
- Keep each change focused. Separate unrelated fixes into different changes.
- For a substantial feature or architecture change, discuss the approach with
  maintainers before investing in a large implementation.
- Never include credentials, private endpoints, customer information, or
  proprietary data in an issue, commit, screenshot, or log.

## Contributor License Agreement

External contributors are required to complete the ZSvirt Contributor License
Agreement (CLA) before their contributions can be merged. The CLA confirms that
the contributor has the right to submit the contribution and grants the rights
needed for the ZSvirt project to use, modify, reproduce, distribute, sublicense,
and relicense it as part of project-maintained distributions.

Contributors acting on behalf of an employer or another organization may need a
Corporate CLA. A contribution that has not completed the required CLA check
will not be merged.

If the CLA check does not provide signing instructions, contact
[zsvirt@zstack.io](mailto:zsvirt@zstack.io) before submitting a contribution.

## Development setup

Use Node.js 22.13 or later and pnpm 11.9.0, as pinned by the repository:

```bash
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install --frozen-lockfile
pnpm start
```

The root start command enables local mock mode automatically. It uses SQLite
and in-memory cache/pub-sub implementations, so no Redis, MySQL, internal
network, or management service is required. See [README.md](README.md) for the
repository layout, ports, environment configuration, and additional commands.

## Making a change

1. Fork the repository and create a branch from the latest `main`.
2. Follow the existing structure and conventions in the area you change.
3. Update user-facing or developer documentation when applicable.
4. Keep generated files and dependency changes limited to what the change
   requires.

Use a clear branch name, for example:

```text
fix/resource-list-loading
feature/virtual-machine-console
docs/update-ui-setup
```

Use `pnpm show:projects` to find project names.

## Validation

Run checks in proportion to the change. Every pull request should at least run
the affected project build and tests. Cross-workspace changes should run:

```bash
pnpm build
pnpm security:audit:licenses
```

Run the relevant formatter and linter checks for files you modify. The complete
repository commands are:

```bash
pnpm format:check
pnpm lint:ox
pnpm lint:all
```

When dependencies change, also run:

```bash
pnpm security:audit:cve
pnpm security:audit:licenses
pnpm security:report:licenses
git diff --exit-code -- security/direct-dependency-licenses.md
```

Commands such as `pnpm format` and `pnpm lint:fix` modify files. Review their
output before committing it.

## Commit and review guidance

- Write clear commit messages that explain the intent of the change.
- Describe the problem, solution, validation, and any known limitations in the
  pull request.
- Include screenshots or recordings for visible UI changes, after removing any
  sensitive information.
- Call out configuration changes, breaking behavior, security impact, and new
  dependencies explicitly.
- Respond to review feedback with follow-up commits or a clear explanation.

Use Conventional Commits, for example:

```text
fix(resource): resolve virtual machine list loading state
docs: update local UI setup
fix(bff): validate the configured listener port
```

## Dependency and license changes

This repository is licensed under `GPL-3.0-only`. New dependencies must be
compatible with the project license and must pass the committed direct
dependency license audit. The inventory in
`security/direct-dependency-licenses.md` covers direct workspace dependencies;
it is not a complete software bill of materials or a substitute for required
third-party notices.

## Reporting security issues

Do not open a public issue for a suspected vulnerability. Follow
[SECURITY.md](SECURITY.md) instead.
