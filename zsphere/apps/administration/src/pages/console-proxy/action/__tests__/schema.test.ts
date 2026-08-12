import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createUpdateConsoleProxySchema } from "../schema";

const intl = createMockIntl();

describe("console proxy schemas", () => {
  it("keeps address validation", () => {
    const schema = createUpdateConsoleProxySchema(intl);

    expect(() => schema.parse({ name: "", consoleProxyPort: 443 })).toThrow(
      "请输入控制台代理地址",
    );
    expect(() =>
      schema.parse({ name: "invalid/address", consoleProxyPort: 443 }),
    ).toThrow("无效的CIDR");
    expect(
      schema.parse({ name: "192.168.1.10", consoleProxyPort: 443 }),
    ).toEqual({
      name: "192.168.1.10",
      consoleProxyPort: 443,
    });
    expect(
      schema.parse({ name: "console.example.com", consoleProxyPort: 443 }),
    ).toEqual({
      name: "console.example.com",
      consoleProxyPort: 443,
    });
  });

  it("keeps non-zero port validation", () => {
    const schema = createUpdateConsoleProxySchema(intl);

    expect(() =>
      schema.parse({ name: "192.168.1.10", consoleProxyPort: 0 }),
    ).toThrow("无效端口");
    expect(() =>
      schema.parse({ name: "192.168.1.10", consoleProxyPort: 65_536 }),
    ).toThrow("无效端口");
  });
});
