import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    entry: {
      index: ["./src/**"],
    },
    define: {
      "process.env.ZSV_MF_FALLBACK_SERVER": JSON.stringify(
        process.env.ZSV_MF_FALLBACK_SERVER || "",
      ),
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
    externals: ["@module-federation/retry-plugin"],
  },
  plugins: [pluginReact()],
});
