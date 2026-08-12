import {
  commonDescriptionString,
  commonNameString,
  requiredString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createUpdateSnsTextTemplateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type UpdateSnsTextTemplateFormValues = z.infer<
  ReturnType<typeof createUpdateSnsTextTemplateSchema>
>;

export const createEditorSubjectSchema = (
  intl: IntlLike,
  requiresRecoverySubject: boolean,
) =>
  z
    .object({
      subject: requiredString(intl),
      recoverySubject: z.string(),
    })
    .superRefine((values, ctx) => {
      if (
        requiresRecoverySubject &&
        values.recoverySubject.trim().length === 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["recoverySubject"],
          message: intl.formatMessage({
            id: "global.field.validator.input.required",
            defaultMessage: "This field is required.",
          }),
        });
      }
    });

export type EditorSubjectFormValues = z.infer<
  ReturnType<typeof createEditorSubjectSchema>
>;
