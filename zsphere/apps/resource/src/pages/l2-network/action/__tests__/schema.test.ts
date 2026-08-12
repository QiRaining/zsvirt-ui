import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  formatProp: (value: unknown) => (value == null ? "" : String(value).trim()),
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import {
  createEditBondConfigSchema,
  createUpdateL2NetworkSchema,
} from "../schema";

const intl = createMockIntl();

describe("l2 network action schemas", () => {
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

  it("normalizes and validates update fields", async () => {
    const schema = createUpdateL2NetworkSchema(intl, "origin");

    await expect(
      schema.parseAsync({ name: "  l2-network  ", description: "" }),
    ).resolves.toEqual({ name: "l2-network", description: "" });
    await expect(
      schema.parseAsync({ name: "bad#", description: "" }),
    ).rejects.toThrow("输入内容只能包含中文汉字");
    await expect(
      schema.parseAsync({ name: "l2-network", description: "x".repeat(2001) }),
    ).rejects.toThrow("输入内容需在1~2000字符范围内");
  });

  it("keeps original name without uniqueness query", async () => {
    const schema = createUpdateL2NetworkSchema(intl, "origin");

    await expect(
      schema.parseAsync({ name: "origin", description: "" }),
    ).resolves.toEqual({ name: "origin", description: "" });
    expect(
      (
        window as typeof window & {
          g_main: {
            apolloClient: {
              query: ReturnType<typeof vi.fn>;
            };
          };
        }
      ).g_main.apolloClient.query,
    ).not.toHaveBeenCalled();
  });

  it("validates edit bond config defaults and conditional hash policy", () => {
    const schema = createEditBondConfigSchema(intl);

    expect(schema.parse({ mode: "active-backup", xmitHashPolicy: "" })).toEqual(
      {
        mode: "active-backup",
        xmitHashPolicy: "",
      },
    );
    expect(() => schema.parse({ mode: "802.3ad", xmitHashPolicy: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(
      schema.parse({ mode: "802.3ad", xmitHashPolicy: "layer2+3" }),
    ).toEqual({
      mode: "802.3ad",
      xmitHashPolicy: "layer2+3",
    });
  });
});
