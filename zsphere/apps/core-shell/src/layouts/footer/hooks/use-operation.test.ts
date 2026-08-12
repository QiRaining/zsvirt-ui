import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("footer running operation query", () => {
  it("does not emit operationLogProgress from the running task query completion", () => {
    const source = readFileSync(resolve(__dirname, "use-operation.ts"), "utf8");

    expect(source).not.toContain('bus.emit("operationLogProgress"');
  });
});
