import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";
import tailwindcss from "@tailwindcss/postcss";

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
      "@zstack/utils",
      "@apollo/client",
      "@zstack/zsphere-types",
      "@zstack/zsphere-utils",
      "lodash-es",
    ],
    filename: {
      css: "[name].css",
    },
  },
  plugins: [pluginReact()],
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [tailwindcss()],
      },
    },
  },
});
