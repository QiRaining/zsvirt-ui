import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import { createZoneCreateSchema, createZoneUpdateSchema } from "../schema";

const intl = createMockIntl();

describe("zone action schemas", () => {
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

  it("validates create fields", async () => {
    const schema = createZoneCreateSchema(intl);

    await expect(
      schema.parseAsync({ name: "", description: "" }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({ name: "zone-01", description: "" }),
    ).resolves.toEqual({ name: "zone-01", description: "" });
  });

  it("rejects duplicated zone name", async () => {
    (
      window as typeof window & {
        g_main: {
          apolloClient: {
            query: ReturnType<typeof vi.fn>;
          };
        };
      }
    ).g_main.apolloClient.query = vi.fn().mockResolvedValue({
      data: { resourceList: { list: [{ name: "zone-01" }], total: 1 } },
    });
    const schema = createZoneCreateSchema(intl);

    await expect(
      schema.parseAsync({ name: "zone-01", description: "" }),
    ).rejects.toThrow("该名称已被其他数据中心使用，请重新输入");
  });

  it("validates update fields without uniqueness check", () => {
    const schema = createZoneUpdateSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "zone-01", description: "x".repeat(2001) }),
    ).toThrow("输入内容需在1~2000字符范围内");
    expect(schema.parse({ name: "zone-01", description: "" })).toEqual({
      name: "zone-01",
      description: "",
    });
  });
});
