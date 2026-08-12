import {
  commonDescriptionString,
  requiredString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

const tagNameString = (intl: IntlLike) =>
  requiredString(intl, {
    id: "global.field.validator.input.required",
    defaultMessage: "This field is required.",
  }).refine((value) => value.trim().length <= 20, {
    message: intl.formatMessage({
      id: "tag.form.length.required",
      defaultMessage: "Tag name cannot exceed 20 characters.",
    }),
  });

export const createUpdateTagSchema = (intl: IntlLike) =>
  z.object({
    name: tagNameString(intl),
    description: commonDescriptionString(intl),
    color: requiredString(intl),
  });

export const createCreateTagSchema = (
  intl: IntlLike,
  tagExists: (name: string, color: string) => boolean,
) =>
  createUpdateTagSchema(intl).superRefine((values, ctx) => {
    if (tagExists(values.name.trim(), values.color)) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: intl.formatMessage({
          id: "tag.field.name.valid.error.duplicate",
          defaultMessage: "A label with the same name and color already exists.",
        }),
      });
    }
  });

export type UpdateTagFormValues = z.infer<
  ReturnType<typeof createUpdateTagSchema>
>;

export type CreateTagFormValues = z.infer<
  ReturnType<typeof createCreateTagSchema>
>;
