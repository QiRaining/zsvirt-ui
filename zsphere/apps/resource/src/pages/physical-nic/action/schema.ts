import {
  commonDescriptionString,
  requiredString,
  type IntlLike,
} from "@zstack/form";
import { isIP, isValidNetMask } from "@zstack/zsphere-utils";
import { z } from "zod";

export const createPhysicalNicUpdateSchema = (intl: IntlLike) =>
  z.object({
    description: commonDescriptionString(intl),
  });

export type PhysicalNicUpdateFormValues = z.infer<
  ReturnType<typeof createPhysicalNicUpdateSchema>
>;

export const createPhysicalNicLldpModeSchema = (intl: IntlLike) =>
  z.object({
    mode: requiredString(intl, {
      id: "global.field.validator.select.required",
      defaultMessage: "This field is required.",
    }),
  });

export type PhysicalNicLldpModeFormValues = z.infer<
  ReturnType<typeof createPhysicalNicLldpModeSchema>
>;

export const createPhysicalNicNetworkTypeSchema = () =>
  z.object({
    serviceTypes: z.array(z.string()).default([]),
  });

export type PhysicalNicNetworkTypeFormValues = z.infer<
  ReturnType<typeof createPhysicalNicNetworkTypeSchema>
>;

const optionalNumberValue = z.union([z.number(), z.literal("")]);

export const createPhysicalNicSriovSchema = (
  intl: IntlLike,
  maxPartNum: number,
) =>
  z
    .object({
      sriovState: z.boolean(),
      vfNicNum: optionalNumberValue,
    })
    .superRefine((values, ctx) => {
      if (!values.sriovState) {
        return;
      }

      if (values.vfNicNum === "") {
        ctx.addIssue({
          code: "custom",
          path: ["vfNicNum"],
          message: intl.formatMessage({
            id: "global.field.validator.input.required",
            defaultMessage: "This field is required.",
          }),
        });
        return;
      }

      if (
        !Number.isInteger(values.vfNicNum) ||
        values.vfNicNum < 1 ||
        values.vfNicNum > maxPartNum
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["vfNicNum"],
          message: intl.formatMessage(
            {
              id: "vf.nic.field.num.validate.range",
              defaultMessage:
                "maxPartNum",
            },
            { maxPartNum },
          ),
        });
      }
    });

export type PhysicalNicSriovFormValues = z.infer<
  ReturnType<typeof createPhysicalNicSriovSchema>
>;

export const createPhysicalNicIpv4AddressSchema = (
  intl: IntlLike,
  validateIpAvailability: (ip: string) => Promise<void>,
  required = true,
) =>
  z
    .object({
      enabled: z.boolean(),
      ipv4Address: z.string(),
      netmask: z.string(),
    })
    .superRefine(async (values, ctx) => {
      if (!values.enabled) {
        return;
      }

      if (required && values.ipv4Address.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["ipv4Address"],
          message: intl.formatMessage({
            id: "global.field.validator.input.required",
            defaultMessage: "This field is required.",
          }),
        });
        return;
      }

      if (values.ipv4Address && !isIP(values.ipv4Address, 4)) {
        ctx.addIssue({
          code: "custom",
          path: ["ipv4Address"],
          message: intl.formatMessage({
            id: "vpc.field.requiredIp.validator.format",
            defaultMessage: "Invalid IP address",
          }),
        });
        return;
      }

      if (values.ipv4Address) {
        try {
          await validateIpAvailability(values.ipv4Address);
        } catch (error) {
          ctx.addIssue({
            code: "custom",
            path: ["ipv4Address"],
            message:
              error instanceof Error
                ? error.message
                : intl.formatMessage({
                    id: "vpc.field.requiredIp.validator.used.case.used",
                    defaultMessage: "The IP address is already in use.",
                  }),
          });
        }
      }

      if (required && values.netmask.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["netmask"],
          message: intl.formatMessage({
            id: "global.field.validator.input.required",
            defaultMessage: "This field is required.",
          }),
        });
        return;
      }

      if (values.netmask && !isValidNetMask(values.netmask)) {
        ctx.addIssue({
          code: "custom",
          path: ["netmask"],
          message: intl.formatMessage({
            id: "l3Network.field.netmask.validator.format",
            defaultMessage: "Invalid netmask.",
          }),
        });
      }
    });

export type PhysicalNicIpv4AddressFormValues = z.infer<
  ReturnType<typeof createPhysicalNicIpv4AddressSchema>
>;
