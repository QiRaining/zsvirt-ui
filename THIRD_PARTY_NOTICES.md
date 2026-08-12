# 第三方声明

ZSvirt UI 采用 GPL-3.0-only 许可证发布，并依赖或分发采用其他许可证的软件与资源。使用或再分发本仓库时，仍需遵守相应第三方许可证。

重点项目包括：

| 组件或资源 | 许可证 | 说明 |
| --- | --- | --- |
| `@novnc/novnc` | MPL-2.0，以及其资源各自附带的许可证 | 保留 MPL 文件级义务及随包许可证文件。 |
| `mariadb` Node.js Connector | LGPL-2.1-or-later | 保留 LGPL 文本、源码获取方式及重新链接权利。 |
| `vendor/@zstack/qiankun/qiankun-2.6.3-beta-1.tgz` | MIT | 归档内包含上游许可证。 |
| `zsphere/bff/public/font/NotoSansCJKscRegular.otf` | SIL Open Font License 1.1 | 许可证文本位于同目录的 `LICENSE-NOTO-SANS-CJK.txt`。 |

完整的直接依赖清单由以下命令基于锁文件生成：

```bash
pnpm security:report:licenses
```

生成结果保存在 [security/direct-dependency-licenses.md](security/direct-dependency-licenses.md)。该清单用于工程审计，不构成法律意见，也不替代依赖包内的原始许可证和版权声明。
