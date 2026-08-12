import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const emptyModule = path.resolve(__dirname, "__mocks__/empty-module.ts");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@zstack\/zsphere-types\/graphql$/,
        replacement: emptyModule,
      },
      {
        find: /^@zstack\/virtualization-resource\/.*/,
        replacement: emptyModule,
      },
    ],
  },
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
    },
  },
});
