import type { IntlLike } from "@zstack/form";
import { z } from "zod";

export const createNoVncPasswordSchema = (intl: IntlLike) =>
  z.object({
    novncpassword: z.string().refine((value) => value.trim().length > 0, {
      message: intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      }),
    }),
  });

export type NoVncPasswordFormValues = z.infer<
  ReturnType<typeof createNoVncPasswordSchema>
>;

export const createNoVncPasteSchema = (intl: IntlLike) =>
  z.object({
    text: z.string().superRefine((value, ctx) => {
      if (value.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          message: intl.formatMessage({
            id: "global.field.validator.input.required",
            defaultMessage: "This field is required.",
          }),
        });
        return;
      }

      if (value.length > 2000) {
        ctx.addIssue({
          code: "custom",
          message: intl.formatMessage({
            id: "vnc.paste.content.limit",
            defaultMessage: "A maximum of 2,000 letters is supported.",
          }),
        });
        return;
      }

      if (!/^[0-9a-zA-Z~`!@#$%^&*()_+={}[\]|\\/:;"'<>,.? \n-]+$/.test(value)) {
        ctx.addIssue({
          code: "custom",
          message: intl.formatMessage({
            id: "vnc.paste.content.error",
            defaultMessage: "Invalid command.",
          }),
        });
      }
    }),
  });

export type NoVncPasteFormValues = z.infer<
  ReturnType<typeof createNoVncPasteSchema>
>;
