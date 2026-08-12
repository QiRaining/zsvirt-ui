import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createCloneRoleSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type CloneRoleFormValues = z.infer<
  ReturnType<typeof createCloneRoleSchema>
>;
