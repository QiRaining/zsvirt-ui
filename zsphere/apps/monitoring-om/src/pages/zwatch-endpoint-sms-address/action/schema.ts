import type { IntlLike } from "@zstack/form";
import { isPhoneNumber } from "@zstack/zsphere-utils";
import { z } from "zod";

export const createModifySmsAddressSchema = (intl: IntlLike) =>
  z.object({
    areaCodePhoneNumber: z.object({
      areaCode: z
        .string()
        .min(
          1,
          intl.formatMessage({
            id: "zwatchEndpoint.field.areaCode.validator.required",
            defaultMessage: "Enter an international telephone code.",
          }),
        )
        .regex(
          /^[1-9][0-9]{0,2}$/,
          intl.formatMessage({
            id: "zwatchEndpoint.field.areaCode.validator.format",
            defaultMessage: "Enter a valid international telephone code.",
          }),
        ),
      phoneNumber: z
        .string()
        .min(
          1,
          intl.formatMessage({
            id: "zwatch.endpoint.form.sms.address.validator.required",
            defaultMessage: "This field is required.",
          }),
        )
        .refine(
          (value) => isPhoneNumber(value),
          intl.formatMessage({
            id: "zwatch.endpoint.form.sms.address.validator.format",
            defaultMessage: "Invalid phone number.",
          }),
        ),
    }),
  });

export type ModifySmsAddressFormValues = z.infer<
  ReturnType<typeof createModifySmsAddressSchema>
>;
