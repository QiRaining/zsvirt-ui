import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import { createUpdateVmTemplateSchema } from "../schema";

const intl = createMockIntl();

describe("vm template action schemas", () => {
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

  it("validates update vm template fields", async () => {
    const schema = createUpdateVmTemplateSchema(intl, "origin-template");

    await expect(
      schema.parseAsync({ name: "", description: "" }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({ name: "template-01", description: "x".repeat(2001) }),
    ).rejects.toThrow("输入内容需在1~2000字符范围内");
    await expect(
      schema.parseAsync({ name: "template-01", description: "" }),
    ).resolves.toEqual({ name: "template-01", description: "" });
  });
});
