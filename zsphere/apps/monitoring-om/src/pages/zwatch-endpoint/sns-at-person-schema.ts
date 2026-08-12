import { type IntlLike } from "@zstack/form";
import { z } from "zod";

const atPersonTextMaxLength = 64;

const addAtPersonMaxLengthIssue = (
  value: string,
  ctx: z.RefinementCtx,
  intl: IntlLike,
) => {
  if (value.length <= atPersonTextMaxLength) {
    return;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: intl.formatMessage({
      id: "userId.validator.succeed_max_limit",
      defaultMessage: "The ID must be 1-64 characters in length.",
    }),
  });
};

const atPersonUserIdString = (intl: IntlLike) =>
  z.string().superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: intl.formatMessage({
          id: "zwatchEndpoint.field.user_id.validator.required",
          defaultMessage: "Please enter user ID.",
        }),
      });
      return;
    }

    addAtPersonMaxLengthIssue(value, ctx, intl);
  });

const atPersonRemarkString = (intl: IntlLike) =>
  z.string().superRefine((value, ctx) => {
    addAtPersonMaxLengthIssue(value, ctx, intl);
  });

export const createUpdateAtPersonSchema = (intl: IntlLike) =>
  z.object({
    atPersonUserId: atPersonUserIdString(intl),
    remark: atPersonRemarkString(intl),
  });

export type UpdateAtPersonFormValues = z.infer<
  ReturnType<typeof createUpdateAtPersonSchema>
>;
