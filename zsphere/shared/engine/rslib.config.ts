import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    entry: {
      index: ["./src/**", "./utils/**", "./core/**"],
    },
  },
  lib: [
    {
      bundle: false,
      dts: true,
      format: "esm",
    },
  ],
  output: {
    target: "web",
    externals: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "zod",
      "react-intl",
      "react-hook-form",
      "@zstack/zsphere-design",
      "@zstack/zsphere-utils",
      "@zstack/zsphere-hooks",
      "@zstack/zsphere-componentss",
      "@apollo/client",
      "@zstack/zsphere-types",
      "antd",
      "lodash-es",
    ],
    filename: {
      css: "[name].css",
    },
  },
  plugins: [pluginReact()],
  tools: {
    rspack(config, { addRules }) {
      addRules([
        {
          test: /\.css$/,
          use: ["postcss-loader"],
          type: "css",
        },
      ]);
    },
  },
});
