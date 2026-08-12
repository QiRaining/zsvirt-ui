# Module Federation 配置生成器

这个包提供了一个中心化的 Module Federation 配置生成器，用于统一管理所有应用的 Module Federation 配置。

## 功能特性

- 🎯 **中心化管理**：所有 Module Federation 配置都在一个 JSON 文件中管理
- 🔧 **一致性保证**：确保所有应用使用相同的共享依赖版本和配置
- 🚀 **易于维护**：只需要修改 JSON 文件就能更新所有应用的配置
- 💪 **类型安全**：完整的 TypeScript 类型定义
- 🎨 **灵活配置**：支持每个应用的自定义配置

## 安装

```bash
npm install @zstack/mf-hub
# 或
yarn add @zstack/mf-hub
```

## 使用方法

### 1. 配置 JSON 文件

在项目根目录创建或修改 `mf-config.json` 文件：

```json
{
  "devMfFallbackServer": "http://localhost:3000",
  "graphqlProxy": "http://127.0.0.1:3100",
  "globalShared": {
    "react": {
      "singleton": true,
      "eager": true,
      "requiredVersion": "18.3.1"
    },
    "@zstack/design": {
      "eager": true,
      "singleton": true,
      "requiredVersion": false
    }
  },
  "apps": {
    "dashboard": {
      "name": "dashboard",
      "port": 7001,
      "assetPrefix": "dashboard",
      "exposes": {
        "./index": "./src/pages/index.tsx"
      }
    }
  }
}
```

### 2. 在 rsbuild.config.ts 中使用

```typescript
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import {
  generateMFConfig,
  generateServerConfig,
  generateOutputConfig,
  generateDevConfig,
} from "@zstack/mf-hub/config-generator";

const APP_NAME = "dashboard";

export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(generateMFConfig(APP_NAME))],
  server: generateServerConfig(APP_NAME),
  output: generateOutputConfig(APP_NAME),
  dev: generateDevConfig(APP_NAME),
});
```

## 配置文件结构

### 全局配置

| 字段                  | 类型   | 描述                   |
| --------------------- | ------ | ---------------------- |
| `devMfFallbackServer` | string | 开发环境回退服务器地址 |
| `graphqlProxy`        | string | GraphQL 代理地址       |
| `globalShared`        | object | 全局共享依赖配置       |
| `apps`                | object | 所有应用的配置         |

### 应用配置

| 字段             | 类型     | 描述               |
| ---------------- | -------- | ------------------ |
| `name`           | string   | 应用名称           |
| `port`           | number   | 开发服务器端口     |
| `assetPrefix`    | string   | 资源前缀路径       |
| `exposes`        | object   | 暴露的模块         |
| `remotes`        | string[] | 依赖的远程模块列表 |
| `runtimePlugins` | string[] | 运行时插件路径     |
| `customShared`   | object   | 应用特定的共享依赖 |

### 共享依赖配置

```typescript
interface SharedConfig {
  singleton?: boolean; // 是否单例
  eager?: boolean; // 是否预加载
  requiredVersion?: string | false; // 版本要求
}
```

## API 参考

### generateMFConfig(appName: string)

生成指定应用的 Module Federation 配置。

```typescript
const mfConfig = generateMFConfig("dashboard");
```

### generateServerConfig(appName: string)

生成应用的服务器配置，包括端口和代理设置。

```typescript
const serverConfig = generateServerConfig("dashboard");
```

### generateOutputConfig(appName: string)

生成应用的输出配置，包括资源路径和文件分布。

```typescript
const outputConfig = generateOutputConfig("dashboard");
```

### generateDevConfig(appName: string)

生成应用的开发配置，包括热更新和客户端设置。

```typescript
const devConfig = generateDevConfig("dashboard");
```

## 高级用法

### 自定义配置路径

```typescript
import { MFConfigGenerator } from "@zstack/mf-hub/config-generator";

const generator = new MFConfigGenerator("./custom-mf-config.json");
const config = generator.generateAppConfig("dashboard");
```

### 动态添加应用

```typescript
import { mfConfigGenerator } from "@zstack/mf-hub/config-generator";

mfConfigGenerator.addApp("new-app", {
  name: "new-app",
  port: 7100,
  assetPrefix: "new-app",
});
```

### 更新全局配置

```typescript
import { mfConfigGenerator } from "@zstack/mf-hub/config-generator";

mfConfigGenerator.updateConfig({
  devMfFallbackServer: "http://new-server:3000",
});
```

## 环境变量

- `NODE_ENV`: 环境模式，影响远程模块的地址生成
- `DEV_MF`: 是否使用开发模式的 Module Federation
- `PUBLIC_MF_FALLBACK_SERVER`: 公共回退服务器地址

## 迁移指南

### 从现有配置迁移

1. 将现有的 `rsbuild.config.ts` 中的 Module Federation 配置提取到 `mf-config.json`
2. 替换配置生成逻辑为配置生成器函数调用
3. 测试确保配置正确生成

### 批量迁移脚本

```bash
# 创建迁移脚本来批量更新所有应用的配置文件
node scripts/migrate-mf-config.js
```

## 故障排除

### 常见问题

1. **配置文件未找到**：确保 `mf-config.json` 文件路径正确
2. **应用配置缺失**：检查 JSON 文件中是否包含对应的应用配置
3. **类型错误**：确保配置符合 TypeScript 类型定义

### 调试模式

设置环境变量 `DEBUG=mf-config` 来启用调试日志：

```bash
DEBUG=mf-config npm run dev
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个配置生成器。

## 许可证

MIT
