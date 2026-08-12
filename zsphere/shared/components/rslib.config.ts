import path from "path";

import { pluginLess } from "@rsbuild/plugin-less";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    entry: {
      index: ["./src/**", "!src/**/*.less"],
    },
  },
  lib: [
    {
      bundle: false,
      dts: true,
      format: "esm",
      redirect: {
        style: {
          path: false,
          extension: false,
        },
      },
      output: {
        copy: [
          { from: "**/*.less", context: path.join(__dirname, "src") },
          { from: "**/*.svg", context: path.join(__dirname, "src") },
          { from: "**/*.webp", context: path.join(__dirname, "src") },
        ],
      },
    },
  ],
  output: {
    target: "web",
    externals: [
      "react",
      "react-dom",
      "@zstack/zsphere-hooks",
      "@zstack/hooks",
      "@zstack/react-markdown",
      "@zstack/zsphere-types",
      "@zstack/icon",
      "@zstack/platform-store-cloud",
      "@zstack/design",
      "antd",
      "ahooks",
      "immer",
      "react-intl",
      "recharts",
    ],
  },

  plugins: [pluginReact(), pluginLess(), pluginSvgr()],
  tools: {
    rspack(config, { addRules }) {
      // addRules([
      //   {
      //     test: /\.css$/,
      //     use: ["postcss-loader"],
      //     type: "css",
      //   },
      // ]);

      // 配置 Less 文件为 CSS Modules
      // 查找 pluginLess 添加的规则并修改为 CSS Modules
      const rules = config.module?.rules;
      if (Array.isArray(rules)) {
        rules.forEach((rule: unknown) => {
          if (rule && typeof rule === "object" && "test" in rule) {
            const ruleObj = rule as {
              test?: RegExp;
              type?: string;
              generator?: Record<string, unknown>;
            };
            const testStr = ruleObj.test?.toString();
            if (testStr && testStr.includes("less")) {
              // 修改为 CSS Modules
              ruleObj.type = "css/module";
              if (!ruleObj.generator) {
                ruleObj.generator = {};
              }
              ruleObj.generator.localIdentName =
                "[name]__[local]___[hash:base64:5]";
            }
          }
        });
      }
    },
  },
});
