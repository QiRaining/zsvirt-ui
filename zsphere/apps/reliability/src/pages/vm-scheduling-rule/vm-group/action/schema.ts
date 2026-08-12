import { z } from "zod";

interface IntlLike {
  formatMessage: (
    descriptor: { id: string; defaultMessage: string },
    values?: Record<string, number | string>,
  ) => string;
}

const requiredString = (intl: IntlLike) =>
  z.string().refine((value) => value.trim().length > 0, {
    message: intl.formatMessage({
      id: "global.field.validator.input.required",
      defaultMessage: "This field is required.",
    }),
  });

const lengthRangeString = (intl: IntlLike, min: number, max: number) =>
  z.string().refine((value) => value.length >= min && value.length <= max, {
    message: intl.formatMessage(
      {
        id: "global.field.validator.lengthRange",
        defaultMessage: "This field must be {min}–{max} characters in length.",
      },
      { min, max },
    ),
  });

const commonDescriptionString = (intl: IntlLike) =>
  z.string().max(256, {
    message: intl.formatMessage(
      {
        id: "global.field.validator.lengthRange",
        defaultMessage: "This field must be {min}–{max} characters in length.",
      },
      { min: 1, max: 256 },
    ),
  });

const vmGroupNameString = (intl: IntlLike) =>
  requiredString(intl)
    .and(lengthRangeString(intl, 1, 128))
    .and(
      z
        .string()
        .regex(
          /^[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()/]+(\s+[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()/]+)*$/,
          {
            message: intl.formatMessage({
              id: "global.field.validator.input.valid",
              defaultMessage:
                "A name can contain Chinese characters, letters, digits, spaces, hyphens (-), underscores (_), periods (.), parenthesis (), colons (:), and plus signs (+) and cannot begin or end with spaces.",
            }),
          },
        ),
    );

export const createUpdateVmGroupSchema = (intl: IntlLike) =>
  z.object({
    name: vmGroupNameString(intl),
    description: commonDescriptionString(intl),
  });

export type UpdateVmGroupFormValues = z.infer<
  ReturnType<typeof createUpdateVmGroupSchema>
>;
