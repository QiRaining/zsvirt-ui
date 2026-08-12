import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("telemetry consent state contract", () => {
  it("provides the shared consent parser and gate decision entry points", () => {
    const sourcePath = resolve(__dirname, "../consent-state.ts");

    expect(existsSync(sourcePath)).toBe(true);

    if (!existsSync(sourcePath)) {
      return;
    }

    const source = readFileSync(sourcePath, "utf8");

    expect(source).toContain("parseTelemetryConsent");
    expect(source).toContain("shouldOpenTelemetryGate");
  });
});
