# Security Policy

The ZSvirt project takes security reports seriously and appreciates responsible
disclosure from researchers and users.

## Supported version

Security fixes apply to the latest revision of `main`. The project does not
maintain compatibility branches for older revisions.

## Reporting a vulnerability

Do not disclose an unresolved vulnerability in a public issue, discussion,
pull request, commit, or other public channel.

Use the GitHub repository's **Security → Report a vulnerability** form when it
is available. Otherwise, report suspected vulnerabilities privately to
[zsvirt@zstack.io](mailto:zsvirt@zstack.io) with a subject such as
`[Security] ZSvirt UI vulnerability report`.

Include as much of the following information as is safe and relevant:

- The affected component, branch, version, or commit.
- The vulnerability type and potential impact.
- Reproduction steps or a minimal proof of concept.
- Required configuration, permissions, and preconditions.
- Relevant logs or screenshots with secrets and personal data removed.
- Any suggested mitigation or remediation.
- Your preferred contact details and disclosure expectations.

Do not send live credentials, customer data, private keys, or other secrets.
Use minimal test data and clearly mark any sensitive attachment. Do not test a
suspected vulnerability against systems you are not authorized to access.

## What to expect

Maintainers will review the report, determine whether additional information is
needed, and coordinate remediation and disclosure as appropriate. Investigation
time varies with severity and complexity, so this policy does not promise a
fixed response or release schedule.

Please allow maintainers a reasonable opportunity to investigate and address
the issue before any public disclosure. We will make a good-faith effort to keep
the reporter informed when contact details are provided.

## Scope

This policy covers code and project-owned configuration in this repository.
Issues in third-party services or dependencies may need to be reported to their
respective maintainers, but reports that demonstrate a concrete impact on
ZSvirt UI are welcome.

## Local mock environment

`pnpm start` launches a mock BFF that bypasses real authentication and generates
test data. It is intended only for trusted local development and must not be
bound to a public interface or used as a production service.

For ordinary bugs and feature requests that do not have a security impact, use
the project's public community channels instead.
