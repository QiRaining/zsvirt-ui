import type { IntlLike } from "@zstack/form";
import { z } from "zod";

const oneYearMinutes = 365 * 24 * 60;

export const createHandleAlarmMessageSchema = (intl: IntlLike) =>
  z
    .object({
      period: z.string(),
      customTime: z.string(),
      customTimeUnit: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.period !== "auto") {
        return;
      }

      if (values.customTime.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["customTime"],
          message: intl.formatMessage({
            id: "global.field.validator.input.required",
            defaultMessage: "This field is required.",
          }),
        });
        return;
      }

      const unit = Number(values.customTimeUnit);
      const value = Number(values.customTime);
      const minutes = (value * unit) / 60;

      if (Number.isNaN(minutes)) {
        ctx.addIssue({
          code: "custom",
          path: ["customTime"],
          message: intl.formatMessage({
            id: "please.input.number",
            defaultMessage: "Enter a number.",
          }),
        });
        return;
      }

      if (minutes > oneYearMinutes) {
        ctx.addIssue({
          code: "custom",
          path: ["customTime"],
          message: intl.formatMessage({
            id: "please.input.number.max",
            defaultMessage: "The duration cannot be longer than 1 year.",
          }),
        });
        return;
      }

      if (!(Number.isSafeInteger(value) && value >= 0)) {
        ctx.addIssue({
          code: "custom",
          path: ["customTime"],
          message: intl.formatMessage({
            id: "please.input.positive.int.number",
            defaultMessage: "Enter a positive integer.",
          }),
        });
      }
    });

export type HandleAlarmMessageFormValues = z.infer<
  ReturnType<typeof createHandleAlarmMessageSchema>
>;
