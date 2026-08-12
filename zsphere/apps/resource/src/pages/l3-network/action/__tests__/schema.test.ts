import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => {
  const isIpv4 = (value: string) =>
    /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/.test(
      value,
    );
  const isIpv6 = (value: string) =>
    value.charAt(value.length - 1) !== ":" &&
    (/:/.test(value) && value.match(/:/g)!.length < 8 && /::/.test(value)
      ? value.match(/::/g)!.length === 1 &&
        /^::$|^(::)?([\da-f]{1,4}(:|::))*[\da-f]{1,4}(:|::)?$/i.test(value)
      : /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(value));

  return {
    isIP: (value: string, ipVersion: 4 | 6 = 4) =>
      ipVersion === 4 ? isIpv4(value) : isIpv6(value),
  };
});

import { createMockIntl } from "@zstack/form/testing";

import { createAddDnsSchema, createUpdateL3NetworkSchema } from "../schema";

const intl = createMockIntl();

describe("l3 network action schemas", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      g_main: {
        apolloClient: {
          query: vi.fn().mockResolvedValue({
            data: { resourceList: { list: [], total: 0 } },
          }),
        },
      },
    });
  });

  it("validates ipv4 dns according to selected ip version", () => {
    const schema = createAddDnsSchema(intl);

    expect(() =>
      schema.parse({ ipVersion: 4, dns: { "4": "", "6": "" } }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({ ipVersion: 4, dns: { "4": "240c::6644", "6": "" } }),
    ).toThrow("无效的DNS");
    expect(
      schema.parse({ ipVersion: 4, dns: { "4": "223.5.5.5", "6": "" } }),
    ).toEqual({
      ipVersion: 4,
      dns: { "4": "223.5.5.5", "6": "" },
    });
  });

  it("validates ipv6 dns according to selected ip version", () => {
    const schema = createAddDnsSchema(intl);

    expect(() =>
      schema.parse({ ipVersion: 6, dns: { "4": "", "6": "223.5.5.5" } }),
    ).toThrow("无效的DNS");
    expect(
      schema.parse({ ipVersion: 6, dns: { "4": "", "6": "240c::6644" } }),
    ).toEqual({
      ipVersion: 6,
      dns: { "4": "", "6": "240c::6644" },
    });
  });

  it("validates update fields", async () => {
    const schema = createUpdateL3NetworkSchema(intl, "origin-l3");

    await expect(
      schema.parseAsync({ name: "", description: "" }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({ name: "l3-network", description: "x".repeat(2001) }),
    ).rejects.toThrow("输入内容需在1~2000字符范围内");
    await expect(
      schema.parseAsync({ name: "l3-network", description: "" }),
    ).resolves.toEqual({ name: "l3-network", description: "" });
  });

  it("rejects duplicated l3 network name", async () => {
    (
      window as typeof window & {
        g_main: { apolloClient: { query: ReturnType<typeof vi.fn> } };
      }
    ).g_main.apolloClient.query = vi.fn().mockResolvedValue({
      data: { resourceList: { list: [{ name: "l3-network" }], total: 1 } },
    });
    const schema = createUpdateL3NetworkSchema(intl, "origin-l3");

    await expect(
      schema.parseAsync({ name: "l3-network", description: "" }),
    ).rejects.toThrow("已存在相同名称的分布式端口组");
  });
});
