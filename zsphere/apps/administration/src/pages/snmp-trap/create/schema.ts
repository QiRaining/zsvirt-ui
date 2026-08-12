import { commonNameString, type IntlLike, requiredString } from "@zstack/form";
import { isIP } from "@zstack/zsphere-utils";
import { z } from "zod";

const portValue = (intl: IntlLike) =>
  z
    .union([z.string(), z.number()])
    .refine((value) => value !== "", {
      message: intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      }),
    })
    .transform((value) => Number(value))
    .refine((value) => !Number.isNaN(value) && Number.isInteger(value), {
      message: intl.formatMessage({
        id: "global.field.validator.numberRange.isInteger",
        defaultMessage: "Please enter an integer.",
      }),
    })
    .refine((value) => value >= 1 && value <= 65565, {
      message: intl.formatMessage({
        id: "global.validator.range",
        defaultMessage: "The input must be in the range of 1 to 65565",
      }),
    });

export const createSnmpTrapReceiverSchema = (intl: IntlLike) =>
  z.object({
    trapList: z.array(createSnmpTrapItemSchema(intl)).min(
      1,
      intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      }),
    ),
  });

export const createSnmpTrapItemSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    snmpAddress: requiredString(intl).refine((value) => isIP(value), {
      message: intl.formatMessage({
        id: "snmp.trap.field.ipAddress.validator.format",
        defaultMessage: "Invalid IP address.",
      }),
    }),
    snmpPort: portValue(intl),
  });

export type SnmpTrapItemFormValues = z.infer<
  ReturnType<typeof createSnmpTrapItemSchema>
>;

export type CreateSnmpTrapReceiverFormValues = z.infer<
  ReturnType<typeof createSnmpTrapReceiverSchema>
>;

export interface SnmpTrapListFormValues {
  trapList?: SnmpTrapItemFormValues[];
}
