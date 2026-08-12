import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import { createImageExportSchema, createImageUpdateSchema } from "../schema";

const intl = createMockIntl();

describe("image action schemas", () => {
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

  it("validates update fields", async () => {
    const schema = createImageUpdateSchema(intl, "origin-image");

    await expect(
      schema.parseAsync({ name: "", description: "" }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({ name: "image-01", description: "x".repeat(2001) }),
    ).rejects.toThrow("输入内容需在1~2000字符范围内");
    await expect(
      schema.parseAsync({ name: "image-01", description: "" }),
    ).resolves.toEqual({ name: "image-01", description: "" });
  });

  it("rejects duplicated image name", async () => {
    (
      window as typeof window & {
        g_main: { apolloClient: { query: ReturnType<typeof vi.fn> } };
      }
    ).g_main.apolloClient.query = vi.fn().mockResolvedValue({
      data: { resourceList: { list: [{ name: "image-01" }], total: 1 } },
    });
    const schema = createImageUpdateSchema(intl, "origin-image");

    await expect(
      schema.parseAsync({ name: "image-01", description: "" }),
    ).rejects.toThrow("已存在相同名称的镜像");
  });

  it("keeps image export type options", () => {
    const schema = createImageExportSchema();

    expect(schema.parse({ exportType: "ExportAndDownload" })).toEqual({
      exportType: "ExportAndDownload",
    });
    expect(schema.parse({ exportType: "ExportOnly" })).toEqual({
      exportType: "ExportOnly",
    });
    expect(() => schema.parse({ exportType: "" })).toThrow();
  });
});
