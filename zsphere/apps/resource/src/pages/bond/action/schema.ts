import { commonDescriptionString, type IntlLike } from "@zstack/form";
import { z } from "zod";

export const createBondDescriptionSchema = (intl: IntlLike) =>
  z.object({
    description: commonDescriptionString(intl),
  });

export type BondDescriptionValues = z.infer<
  ReturnType<typeof createBondDescriptionSchema>
>;

export const createBondPhysicalNetworkTypeSchema = () =>
  z.object({
    serviceTypes: z.array(z.string()).default([]),
  });

export type BondPhysicalNetworkTypeFormValues = z.infer<
  ReturnType<typeof createBondPhysicalNetworkTypeSchema>
>;
