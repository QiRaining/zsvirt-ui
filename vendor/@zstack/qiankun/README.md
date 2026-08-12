# @zstack/qiankun 2.6.3-beta-1

This directory vendors the exact npm tarball consumed by the ZSphere applications. Keeping the published artifact in the repository makes installation independent of the private `@zstack` registry.

## Artifact

- Package: `@zstack/qiankun@2.6.3-beta-1`
- Published: `2024-01-10T02:31:44.140Z`
- File: `qiankun-2.6.3-beta-1.tgz`
- SHA-1: `6fb9fce8baaedfa81d44b8a82d95e67bb277779f`
- SHA-256: `0b89ee14b1ad1e67d0b708a9df47625d6aa93d57ae9c3e5d3ed027503d262f63`
- License: MIT; the license text is included in the tarball as `package/LICENSE`

The registry metadata points to <https://github.com/kuitos/qiankun>, but the repository does not establish source parity for this `@zstack` fork. Treat this tarball as the canonical artifact until its corresponding fork source is published and verified.

When replacing the artifact, update all checksums in this file and run a frozen-lockfile install plus builds for `zsv-core-shell`, `zsv-dashboard`, `zsv-data-protection`, `zsv-resource`, and `zsv-zwatch`.
