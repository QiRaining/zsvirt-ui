import path from "path";

import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    entry: {
      index: ["./src/index.ts"],
    },
  },
  lib: [
    {
      bundle: true,
      dts: true,
      format: "esm",
      output: {
        filename: {
          js: "[name].js",
        },
        copy: [
          { from: "assets/**/*", context: path.join(__dirname, "src") },
          { from: "color/light/**/*", context: path.join(__dirname, "src") },
          { from: "color/dark/**/*", context: path.join(__dirname, "src") },
          { from: "style/**/*", context: path.join(__dirname, "src") },
        ],
      },
    },
  ],
  output: {
    target: "node",
    externals: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@apollo/client",
      "graphql",
      "antd",
      "uuid",
      "crypto-js",
      "classnames",
      "lodash-es",
    ],
  },
});
