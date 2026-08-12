import { createMockIntl } from "@zstack/form/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCreateResourceAttributeKeySchema,
  createEditResourceAttributeKeySchema,
  createResourceAttributeConstraintsSchema,
} from "../schema";

const intl = createMockIntl();

describe("resource attribute key action schemas", () => {
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

  it("keeps edit name required, format, length, and description validation", async () => {
    const schema = createEditResourceAttributeKeySchema(intl, "origin-key");

    await expect(
      schema.parseAsync({ name: "", description: "" }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({ name: " invalid", description: "" }),
    ).rejects.toThrow("输入内容只能包含中文汉字");
    await expect(
      schema.parseAsync({ name: "x".repeat(81), description: "" }),
    ).rejects.toThrow("输入内容需在1~80字符范围内");
    await expect(
      schema.parseAsync({
        name: "attribute-key",
        description: "x".repeat(257),
      }),
    ).rejects.toThrow("输入内容需在1~256字符范围内");
    await expect(
      schema.parseAsync({ name: "attribute-key", description: "" }),
    ).resolves.toEqual({
      name: "attribute-key",
      description: "",
    });
  });

  it("keeps edit duplicate name validation and skips the original name", async () => {
    const apolloClient = (
      window as typeof window & {
        g_main: { apolloClient: { query: ReturnType<typeof vi.fn> } };
      }
    ).g_main.apolloClient;
    apolloClient.query = vi.fn().mockResolvedValue({
      data: { resourceList: { list: [{ name: "new-key" }], total: 1 } },
    });

    const schema = createEditResourceAttributeKeySchema(intl, "origin-key");

    await expect(
      schema.parseAsync({ name: "new-key", description: "" }),
    ).rejects.toThrow("已存在相同属性键");
    await expect(
      schema.parseAsync({ name: "origin-key", description: "" }),
    ).resolves.toEqual({
      name: "origin-key",
      description: "",
    });
    expect(apolloClient.query).toHaveBeenCalledTimes(1);
  });

  it("keeps create key validation and optional constraint values", async () => {
    const schema = createCreateResourceAttributeKeySchema(intl);

    await expect(
      schema.parseAsync({
        resourceType: "ResourceAttributeKeyVO",
        name: "",
        description: "",
        options: [{ value: "" }],
      }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({
        resourceType: "ResourceAttributeKeyVO",
        name: "attribute-key",
        description: "",
        options: [{ value: "invalid$value" }],
      }),
    ).rejects.toThrow("输入内容只能包含中文汉字");
    await expect(
      schema.parseAsync({
        resourceType: "VmInstanceVO",
        name: "attribute-key",
        description: "",
        options: [{ value: "" }, { value: "online" }],
      }),
    ).resolves.toEqual({
      resourceType: "VmInstanceVO",
      name: "attribute-key",
      description: "",
      options: [{ value: "" }, { value: "online" }],
    });
  });

  it("keeps required constraint value and duplicate validation", async () => {
    const schema = createResourceAttributeConstraintsSchema(intl, {
      constraints: [{ parameter: "ready" }],
    } as never);

    await expect(schema.parseAsync({ options: [] })).rejects.toThrow(
      "请添加属性值",
    );
    await expect(
      schema.parseAsync({ options: [{ value: "" }] }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({
        options: [{ value: "ready" }],
      }),
    ).rejects.toThrow("已存在相同属性值");
    await expect(
      schema.parseAsync({
        options: [{ value: "new" }, { value: "new" }],
      }),
    ).rejects.toThrow("已存在相同属性值");
    await expect(
      schema.parseAsync({
        options: [{ value: "new" }],
      }),
    ).resolves.toEqual({
      options: [{ value: "new" }],
    });
  });
});
