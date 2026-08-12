import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";
import UnoCSS from "@unocss/postcss";

export default defineConfig({
  source: {
    entry: {
      index: ["./src/**"],
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
      "@zstack/design",
      "@zstack/auth",
      "@zstack/icon",
      "@zstack/utils",
      "@zstack/hooks",
      "@zstack/zsphere-platform-store",
      "@zstack/alova-instance",
      "uuid",
      "react-router",
      "@hookform/resolvers",
      "@zstack/zsphere-hooks",
    ],
    filename: {
      css: "[name].css",
    },
  },
  plugins: [pluginReact()],
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [UnoCSS()],
      },
    },
  },
});
