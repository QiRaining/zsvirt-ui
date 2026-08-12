import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import { createBatchSnapshotSchema, createUpdateVmSchema } from "../schema";

const intl = createMockIntl();

describe("vm base action schemas", () => {
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

  it("validates update vm fields", async () => {
    const schema = createUpdateVmSchema(intl, "origin-vm");

    await expect(
      schema.parseAsync({ name: "", description: "" }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({ name: "vm-01", description: "x".repeat(2001) }),
    ).rejects.toThrow("输入内容需在1~2000字符范围内");
    await expect(
      schema.parseAsync({ name: "vm-01", description: "" }),
    ).resolves.toEqual({ name: "vm-01", description: "" });
  });

  it("rejects duplicated vm name", async () => {
    (
      window as typeof window & {
        g_main: { apolloClient: { query: ReturnType<typeof vi.fn> } };
      }
    ).g_main.apolloClient.query = vi.fn().mockResolvedValue({
      data: { resourceList: { list: [{ name: "vm-01" }], total: 1 } },
    });
    const schema = createUpdateVmSchema(intl, "origin-vm");

    await expect(
      schema.parseAsync({ name: "vm-01", description: "" }),
    ).rejects.toThrow("已存在相同名称的虚拟机或模版");
  });

  it("validates batch snapshot fields", () => {
    const schema = createBatchSnapshotSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "x".repeat(65), description: "" }),
    ).toThrow("输入内容需在1~64字符范围内");
    expect(() => schema.parse({ name: "bad#", description: "" })).toThrow(
      "输入内容只能包含中文汉字",
    );
    expect(schema.parse({ name: "快照-01", description: "" })).toEqual({
      name: "快照-01",
      description: "",
    });
  });
});
