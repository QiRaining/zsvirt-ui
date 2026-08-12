import path from "path";

import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/**/*"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    }),
  ],
  build: {
    outDir: "dist",
    cssTarget: "chrome61",
    lib: {
      entry: {
        index: path.resolve(__dirname, "./src/index.ts"),
        diagnostics: path.resolve(__dirname, "./src/diagnostics.ts"),
      },
      name: "errorBoundary",
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ["es"],
    },
    target: "chrome66",
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-error-boundary",
        "react-intl",
        "@zstack/design",
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: path.resolve(__dirname, "./src"),
        entryFileNames: "[name].js",
        format: "esm",
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
