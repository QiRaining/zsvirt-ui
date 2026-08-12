import path from "path";
import { fileURLToPath } from "url";

import { CopyRspackPlugin } from "@rspack/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('@rspack/core').Configuration} */
export default {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: {
      type: "module",
    },
    clean: true,
  },
  target: "node",
  mode: "production",
  experiments: {
    outputModule: true, // 启用 ES 模块输出
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                },
                target: "es2017",
                transform: {
                  react: {
                    runtime: "automatic",
                  },
                },
              },
            },
          },
        ],
      },
    ],
  },
  externals: {
    "@zstack/zsphere-types": "@zstack/zsphere-types",
    "es-toolkit/object": "es-toolkit/object",
    "es-toolkit/compat": "es-toolkit/compat",
  },
  plugins: [
    new CopyRspackPlugin({
      patterns: [
        {
          from: "src/menu",
          to: "menu",
        },
      ],
    }),
  ],
  optimization: {
    minimize: false, // 保持代码可读性
  },
};
