import { commonNameString, type IntlLike } from "@zstack/form";
import { z } from "zod";

export const createModifyUsbNameSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
  });

export type ModifyUsbNameValues = z.infer<
  ReturnType<typeof createModifyUsbNameSchema>
>;
