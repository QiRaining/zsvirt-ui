import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it, vi } from "vitest";

import {
  createDirectoryCreateSchema,
  createDirectoryListCreateSchema,
  createDirectoryUpdateSchema,
} from "../schema";

const intl = createMockIntl();

describe("createDirectoryCreateSchema", () => {
  it("rejects blank, invalid, and duplicate directory names", async () => {
    const listSubDirectoryGroups = vi.fn().mockResolvedValue([
      { groupName: "root/重复名称", parentUuid: undefined },
      { groupName: "root/其它层级重复", parentUuid: "nested-parent" },
    ]);

    const schema = createDirectoryCreateSchema({
      intl,
      dirUuid: "-1",
      zoneUuid: "zone-1",
      listSubDirectoryGroups,
    });

    await expect(schema.parseAsync({ name: "   " })).rejects.toThrow(
      "输入内容不能为空",
    );
    await expect(schema.parseAsync({ name: "bad#name" })).rejects.toThrow(
      "输入内容只能包含中文汉字",
    );
    await expect(schema.parseAsync({ name: "重复名称" })).rejects.toThrow(
      "该名称已被其它分组使用，请重新输入",
    );
    await expect(schema.parseAsync({ name: "其它层级重复" })).resolves.toEqual({
      name: "其它层级重复",
    });
    expect(listSubDirectoryGroups).toHaveBeenCalledWith({
      dirUuid: "-1",
      zoneUuid: "zone-1",
    });
  });
});

describe("createDirectoryUpdateSchema", () => {
  it("rejects blank, too long, and invalid directory names", () => {
    const schema = createDirectoryUpdateSchema(intl);

    expect(() => schema.parse({ name: "   " })).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({ name: "超过二十个字符的虚拟机分组名称测试再加几个字" }),
    ).toThrow("输入内容需在1~20字符范围内");
    expect(() => schema.parse({ name: "bad#name" })).toThrow(
      "输入内容只能包含中文汉字",
    );
    expect(schema.parse({ name: "有效名称-01" })).toEqual({
      name: "有效名称-01",
    });
  });
});

describe("createDirectoryListCreateSchema", () => {
  it("validates local duplicate and parent selection", () => {
    const schema = createDirectoryListCreateSchema(intl);

    expect(() =>
      schema.parse({
        name: "新分组",
        groupType: "sub",
        parent: null,
        treeData: [],
      }),
    ).toThrow("选择不能为空");
    expect(() =>
      schema.parse({
        name: "重复",
        groupType: "new",
        parent: null,
        treeData: [{ name: "重复" }],
      }),
    ).toThrow("该名称已被其它分组使用，请重新输入");
    expect(() =>
      schema.parse({
        name: "子重复",
        groupType: "sub",
        parent: {
          uuid: "parent-1",
          name: "父分组",
          childNodes: [{ name: "子重复" }],
        },
        treeData: [],
      }),
    ).toThrow("该名称已被其它分组使用，请重新输入");
    expect(
      schema.parse({
        name: "有效名称",
        groupType: "new",
        parent: null,
        treeData: [],
      }),
    ).toEqual({
      name: "有效名称",
      groupType: "new",
      parent: null,
      treeData: [],
    });
  });
});
