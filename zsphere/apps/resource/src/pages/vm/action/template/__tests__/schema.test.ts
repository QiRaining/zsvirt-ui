import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import { createCloneVmToTemplateSchema } from "../schema";

const intl = createMockIntl();

describe("clone vm to template schema", () => {
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

  it("validates name and description fields", async () => {
    const schema = createCloneVmToTemplateSchema(intl);

    await expect(
      schema.parseAsync({ name: "", description: "", tags: [] }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({
        name: "template-01",
        description: "x".repeat(2001),
        tags: [],
      }),
    ).rejects.toThrow("输入内容需在1~2000字符范围内");
    await expect(
      schema.parseAsync({ name: "template-01", description: "", tags: [] }),
    ).resolves.toEqual({ name: "template-01", description: "", tags: [] });
  });

  it("rejects duplicated vm or template name", async () => {
    (
      window as typeof window & {
        g_main: { apolloClient: { query: ReturnType<typeof vi.fn> } };
      }
    ).g_main.apolloClient.query = vi.fn().mockResolvedValue({
      data: { resourceList: { list: [{ name: "template-01" }], total: 1 } },
    });
    const schema = createCloneVmToTemplateSchema(intl);

    await expect(
      schema.parseAsync({ name: "template-01", description: "", tags: [] }),
    ).rejects.toThrow("已存在相同名称的虚拟机或模版");
  });

  it("defaults tags to an empty array", async () => {
    const schema = createCloneVmToTemplateSchema(intl);

    await expect(
      schema.parseAsync({ name: "template-01", description: "" }),
    ).resolves.toEqual({
      name: "template-01",
      description: "",
      tags: [],
    });
  });
});
