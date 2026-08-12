import path from "path";

import react from "@vitejs/plugin-react-swc";
import preserveDirectives from "rollup-preserve-directives";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      outDir: "dist",
      include: ["src/**/*"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    }),
    preserveDirectives(),
    svgr(),
  ],
  build: {
    outDir: "dist",
    cssTarget: "chrome61",
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      name: "illustration",
      fileName: (format) => `illustration.${format}.js`,
      formats: ["es"],
    },
    target: "chrome66",
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@zstack/utils",
        "@zstack/zsphere-utils",
      ],
      output: {
        preserveModules: true,
        format: "esm",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name) {
            if (assetInfo.name.includes("assets/")) {
              return assetInfo.name.replace("src/", "");
            }
            if (assetInfo.name.endsWith(".svg")) {
              return "assets/[name][extname]";
            }
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
