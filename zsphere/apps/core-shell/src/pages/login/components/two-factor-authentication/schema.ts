import type { IntlLike } from "@zstack/form";
import { z } from "zod";

export const createTwoFactorAuthenticationSchema = (intl: IntlLike) =>
  z.object({
    username: z.string(),
    authCode: z
      .string()
      .refine((value) => value.trim().length > 0, {
        message: intl.formatMessage({
          id: "indentity.authentication.auth.code.required",
          defaultMessage: "Enter the authentication code.",
        }),
      })
      .regex(/^[0-9]{6}$/, {
        message: intl.formatMessage({
          id: "indentity.authentication.auth.code.format",
          defaultMessage: "Authentication code must be 6 digits.",
        }),
      }),
  });

export type TwoFactorAuthenticationFormValues = z.infer<
  ReturnType<typeof createTwoFactorAuthenticationSchema>
>;
