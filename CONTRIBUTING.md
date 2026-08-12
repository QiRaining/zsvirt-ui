# 贡献指南

感谢参与 ZSvirt UI。

## 开发流程

1. 从最新 `main` 创建功能或修复分支。
2. 按根目录 README 完成依赖安装和本地启动。
3. 只提交与当前改动相关的文件，不提交凭据、内部地址、构建产物或本地配置。
4. 提交 Pull Request 前至少运行受影响项目的构建和测试；跨项目改动应运行：

```bash
pnpm build
pnpm lint:all
pnpm security:audit:licenses
```

## 代码原则

- 优先修复根因，不吞掉错误。
- 保持模块边界清晰，复用仓库已有依赖。
- 删除过时实现，不增加兼容层或隐式 fallback。
- 新配置必须有公开、安全的示例；任何秘密只能通过未提交的环境变量提供。
- 影响启动、架构或安全边界的改动必须同步更新 README 或相关文档。

## 提交与 Pull Request

提交信息建议使用 Conventional Commits，例如：

```text
fix(bff): resolve public assets from the project root
feat(resource): add virtual machine filter
docs: clarify local mock startup
```

Pull Request 应说明目标、主要改动、验证命令和仍存在的限制。界面改动请附截图或录屏。
