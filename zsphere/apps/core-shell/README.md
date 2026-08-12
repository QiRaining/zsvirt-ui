# ZSvirt Core Shell

Core Shell 是 ZSvirt Module Federation 前端的入口应用。本地完整开发请在仓库根目录运行：

```bash
pnpm start
```

入口地址为 <http://localhost:3000>。应用会从 localhost 上由同一命令启动的其他微应用加载远程模块。

如需显式启用远程 fallback，必须同时提供两个环境变量：

```bash
ZSV_DEV_MF=true \
ZSV_MF_FALLBACK_SERVER=http://localhost:7202 \
pnpm --dir zsphere/apps/core-shell build
```

启用 fallback 但未提供服务器地址时，构建会直接失败。
