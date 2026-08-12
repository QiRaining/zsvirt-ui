import type { IntlLike } from "@zstack/form";
import { z } from "zod";

export interface DirectoryGroupNameItem {
  groupName?: string;
  parentUuid?: string;
}

export interface CreateDirectorySchemaOptions {
  intl: IntlLike;
  dirUuid?: string;
  zoneUuid?: string;
  listSubDirectoryGroups: (params: {
    dirUuid?: string;
    zoneUuid?: string;
  }) => Promise<DirectoryGroupNameItem[]>;
}

const vmGroupNamePattern = /^[\u4e00-\u9fa5a-zA-Z0-9\s()（）【】@._+-]+$/;

const createDirectoryNameSchema = (intl: IntlLike) => {
  const requiredMessage = intl.formatMessage({
    id: "global.field.validator.input.required",
    defaultMessage: "This field is required.",
  });
  const lengthMessage = intl.formatMessage(
    {
      id: "global.field.validator.lengthRange",
      defaultMessage: "This field must be {min}–{max} characters in length.",
    },
    { min: 1, max: 20 },
  );
  const invalidMessage = intl.formatMessage({
    id: "global.field.validator.vm.group.input.valid",
    defaultMessage:
      "The name can contain Chinese characters, English letters, digits, spaces, and the following characters: ()（）【】@._-+.",
  });

  return z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: requiredMessage,
    })
    .min(1, { message: lengthMessage })
    .max(20, { message: lengthMessage })
    .regex(vmGroupNamePattern, { message: invalidMessage });
};

export const createDirectoryCreateSchema = ({
  intl,
  dirUuid,
  zoneUuid,
  listSubDirectoryGroups,
}: CreateDirectorySchemaOptions) => {
  const duplicateMessage = intl.formatMessage({
    id: "vm.group.name.validate.should.be.uniq",
    defaultMessage: "Duplicated group name. Try again.",
  });

  return z.object({
    name: createDirectoryNameSchema(intl).refine(
      async (value) => {
        const list = await listSubDirectoryGroups({ dirUuid, zoneUuid });
        const checkDirList = list.filter((item) => {
          if (["-1", "-2"].includes(dirUuid ?? "")) {
            return !item.parentUuid;
          }
          return true;
        });

        return !checkDirList.some((item) => {
          const name = item.groupName?.split("/")?.pop();
          return name === value;
        });
      },
      { message: duplicateMessage },
    ),
  });
};

export const createDirectoryUpdateSchema = (intl: IntlLike) =>
  z.object({
    name: createDirectoryNameSchema(intl),
  });

export interface DirectoryTreeNode {
  uuid?: string;
  name?: string;
  childNodes?: DirectoryTreeNode[];
}

export const createDirectoryListCreateSchema = (intl: IntlLike) =>
  z
    .object({
      name: createDirectoryNameSchema(intl),
      groupType: z.enum(["new", "sub"]),
      parent: z.custom<DirectoryTreeNode | null>().optional(),
      treeData: z.array(z.custom<DirectoryTreeNode>()).optional(),
    })
    .superRefine((values, ctx) => {
      if (values.groupType === "sub" && !values.parent?.uuid) {
        ctx.addIssue({
          code: "custom",
          path: ["parent"],
          message: intl.formatMessage({
            id: "vm.group.field.validator.select.required",
            defaultMessage: "The selection cannot be empty.",
          }),
        });
        return;
      }

      const duplicateSource =
        values.groupType === "sub"
          ? values.parent?.childNodes
          : values.treeData;

      if (duplicateSource?.some((node) => node.name === values.name)) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: intl.formatMessage({
            id: "vm.group.field.validator.name.duplicate",
            defaultMessage: "This name has been used by another group, please re-input.",
          }),
        });
      }
    });

export type DirectoryCreateFormValues = z.infer<
  ReturnType<typeof createDirectoryCreateSchema>
>;

export type DirectoryUpdateFormValues = z.infer<
  ReturnType<typeof createDirectoryUpdateSchema>
>;

export type DirectoryListCreateFormValues = z.infer<
  ReturnType<typeof createDirectoryListCreateSchema>
>;
