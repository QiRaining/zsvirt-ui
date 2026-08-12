import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
    globals: true,
    server: {
      deps: {
        inline: [/uuid/],
      },
    },
    alias: {
      crypto: "node:crypto",
      uuid: resolve(
        __dirname,
        "../../shared/utils/node_modules/uuid/dist/esm-browser/index.js",
      ),
    },
  },
});
