import {
  commonNameString,
  longDescriptionString,
  type IntlLike,
  uniqueResourceName,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { isIP } from "@zstack/zsphere-utils";
import { z } from "zod";

export const createAddDnsSchema = (intl: IntlLike) => {
  const requiredMessage = intl.formatMessage({
    id: "global.field.validator.input.required",
    defaultMessage: "This field is required.",
  });
  const invalidMessage = intl.formatMessage({
    id: "l3Network.field.dns.validator.format",
    defaultMessage: "Invalid DNS.",
  });

  return z
    .object({
      ipVersion: z.union([z.literal(4), z.literal(6)]),
      dns: z.object({
        "4": z.string().optional(),
        "6": z.string().optional(),
      }),
    })
    .superRefine((value, ctx) => {
      const dns = value.dns[String(value.ipVersion) as "4" | "6"] ?? "";

      if (dns.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["dns", String(value.ipVersion)],
          message: requiredMessage,
        });
        return;
      }

      if (!isIP(dns, value.ipVersion)) {
        ctx.addIssue({
          code: "custom",
          path: ["dns", String(value.ipVersion)],
          message: invalidMessage,
        });
      }
    });
};

export const createUpdateL3NetworkSchema = (
  intl: IntlLike,
  originName?: string,
) =>
  z.object({
    name: commonNameString(intl).and(
      uniqueResourceName(
        intl,
        ResourceQueryType.L3Network,
        originName,
        intl.formatMessage({
          id: "l3Network.field.name.validator.duplicate",
          defaultMessage: "This name is already in use. Enter a different name.",
        }),
        true,
      ),
    ),
    description: longDescriptionString(intl),
  });

export type AddDnsFormValues = z.infer<ReturnType<typeof createAddDnsSchema>>;

export type UpdateL3NetworkValues = z.infer<
  ReturnType<typeof createUpdateL3NetworkSchema>
>;
