import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    alias: {
      uuid: resolve(
        __dirname,
        "../../shared/utils/node_modules/uuid/dist/esm-browser/index.js",
      ),
    },
  },
});
