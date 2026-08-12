import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createUpdateThirdPartyAuthSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type UpdateThirdPartyAuthFormValues = z.infer<
  ReturnType<typeof createUpdateThirdPartyAuthSchema>
>;
