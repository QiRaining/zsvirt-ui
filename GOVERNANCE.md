# ZSvirt UI Governance

This document describes how the ZSvirt UI project is maintained and how
technical decisions are made. It applies to the UI applications, BFF, shared
packages, design system, documentation, and supporting repository tooling.

## Principles

The project is guided by the following principles:

- Decisions should serve the long-term health of ZSvirt and its users.
- Technical discussion should be open, respectful, and based on evidence.
- Contributors should have a clear path to increasing responsibility through
  sustained, constructive participation.
- Security, accessibility, maintainability, and user experience are part of the
  definition of quality.
- Project authority is a responsibility to the community, not a privilege.

All participants must follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Roles

Project roles describe responsibilities rather than employment status. One
person may participate in more than one area.

### Contributors

Contributors improve the project through code, documentation, translations,
design, issue reports, reviews, or community support.

Contributors are expected to:

- Follow the contribution guidelines and code of conduct.
- Keep changes focused and explain their intent and validation.
- Protect credentials, private endpoints, customer information, and other
  sensitive data.
- Respond constructively to review feedback.

### Reviewers

Reviewers are experienced contributors trusted to evaluate changes in one or
more project areas. They help contributors understand project conventions and
identify correctness, security, accessibility, and maintenance concerns.

A review is a technical recommendation. Approval to merge remains subject to
the repository's configured permissions and required checks.

### Maintainers

Maintainers are responsible for the health of one or more project areas. Their
responsibilities include:

- Triaging issues and coordinating planned work.
- Reviewing and merging changes within their areas of responsibility.
- Maintaining architecture, quality, and security expectations.
- Coordinating releases, breaking changes, removals, and incident response.
- Helping active contributors grow into reviewer or maintainer roles.
- Applying the code of conduct and handling reports confidentially.

Repository permissions identify who can perform privileged actions. This
document does not grant access by itself.

## Areas of responsibility

Because this repository is a monorepo, ownership may be organized by area,
including:

- Core shell and Module Federation runtime.
- Domain micro-frontends.
- Shared components, design system, forms, icons, and internationalization.
- GraphQL BFF, persistence, and service integrations.
- Build tooling, dependency management, testing, security, and documentation.

Changes that cross areas should involve reviewers from every materially
affected area. The repository may record more specific ownership rules in its
review configuration as the maintainer group evolves.

## Decision-making

Routine changes are decided through normal review. The author should describe
the problem, proposed solution, alternatives considered when relevant, and
validation performed.

Decisions should normally be made by consensus: reviewers identify concerns,
the author addresses or explains them, and the participants work toward an
outcome that no responsible maintainer considers harmful to the project.

Substantial changes require broader discussion before implementation. Examples
include:

- Changes to public APIs, shared contracts, or Module Federation boundaries.
- Major architecture, framework, persistence, or build-system changes.
- Breaking behavior or removal of supported functionality.
- New security-sensitive capabilities or changes to authentication and
  authorization.
- Changes to project governance, licensing, or contribution policy.

For these changes, record the motivation, scope, alternatives, user and API
impact, security considerations, and testing strategy in a trackable proposal
or review discussion.

If consensus cannot be reached, maintainers for the affected areas make the
final decision after documenting the unresolved concerns and rationale. A
maintainer with a direct conflict of interest should disclose it and, when
practical, defer the decision to another maintainer.

## Becoming a reviewer or maintainer

Role changes are based on demonstrated project work, judgment, collaboration,
and availability rather than a fixed contribution count.

Candidates for reviewer or maintainer responsibilities should show:

- Sustained, constructive contributions in the relevant area.
- Sound technical judgment and careful review practices.
- Respectful communication and reliable follow-through.
- Understanding of security, testing, and documentation needs.
- Willingness to support contributors and act in the project's interest.

Existing maintainers evaluate nominations by consensus. Role changes should be
recorded through the repository's normal auditable process. Access is granted
only after the candidate accepts the responsibilities and any required account
security controls.

## Inactivity and role changes

Reviewers and maintainers may step down at any time. Responsibilities or access
may also be adjusted when a person is inactive for an extended period, cannot
meet the role's obligations, creates an unresolved security risk, or repeatedly
violates project policy.

Whenever possible, maintainers should discuss non-urgent changes with the
affected person and support a later return. Urgent action may be taken to
protect the project or community.

## Security and conduct matters

Security vulnerabilities must be handled according to
[SECURITY.md](SECURITY.md), not in a public issue.

Code-of-conduct reports are handled privately by uninvolved maintainers when
possible. Access to reports should be limited to people needed to investigate
and respond. Retaliation against a reporter or participant in an investigation
is not acceptable.

## Amending this document

Governance changes follow the substantial-change process above. A proposal
must explain the reason for the change and its effect on roles,
decision-making, or community participation. Amendments require maintainer
consensus and should be communicated clearly to contributors.
