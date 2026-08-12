import {
  type IntlLike,
  commonNameString,
  longDescriptionString,
} from "@zstack/form";
import { z } from "zod";

export const createSecurityGroupSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: longDescriptionString(intl),
  });

export type SecurityGroupFormValues = z.infer<
  ReturnType<typeof createSecurityGroupSchema>
>;
