import {
  commonDescriptionString,
  commonNameString,
  requiredString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createBaremetalChassisUpdateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type BaremetalChassisUpdateFormValues = z.infer<
  ReturnType<typeof createBaremetalChassisUpdateSchema>
>;

export const createBaremetalChassisUpdateIpmiSchema = (intl: IntlLike) =>
  z.object({
    ipmiUsername: requiredString(intl, {
      id: "baremetalChassis.field.ipmiUsername.validator.required",
      defaultMessage: "This field is required.",
    }),
    ipmiPassword: requiredString(intl),
  });

export type BaremetalChassisUpdateIpmiFormValues = z.infer<
  ReturnType<typeof createBaremetalChassisUpdateIpmiSchema>
>;
