import { type IntlLike, requiredString } from "@zstack/form";
import { z } from "zod";

export const createAddVhostPrimaryStoragePoolSchema = (intl: IntlLike) =>
  z.object({
    poolName: requiredString(intl),
    aliasName: z.string(),
  });

export const createUpdateVhostPrimaryStoragePoolSchema = (intl: IntlLike) =>
  z.object({
    aliasName: requiredString(intl),
  });

export type AddVhostPrimaryStoragePoolFormValues = z.infer<
  ReturnType<typeof createAddVhostPrimaryStoragePoolSchema>
>;

export type UpdateVhostPrimaryStoragePoolFormValues = z.infer<
  ReturnType<typeof createUpdateVhostPrimaryStoragePoolSchema>
>;
