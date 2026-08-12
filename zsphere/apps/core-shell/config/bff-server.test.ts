import { describe, expect, it } from "vitest";

import { getConfiguredZsvBffPort, getLocalZsvBffServer } from "./bff-server";

describe("ZSV local BFF server config", () => {
  it("uses ZSV_BFF_PORT when configured", () => {
    expect(getConfiguredZsvBffPort({ ZSV_BFF_PORT: "3150" })).toBe(3150);
  });

  it("rejects an invalid configured port", () => {
    expect(() =>
      getConfiguredZsvBffPort({ ZSV_BFF_PORT: "not-a-port" }),
    ).toThrow("ZSV_BFF_PORT must be an integer between 1 and 65535");
  });

  it("uses the default local BFF port when not configured", () => {
    expect(getConfiguredZsvBffPort({})).toBe(3100);
  });

  it("builds the local proxy target from the configured port", () => {
    expect(getLocalZsvBffServer("zstack.test", { ZSV_BFF_PORT: "3150" })).toBe(
      "http://zstack.test:3150",
    );
  });
});
