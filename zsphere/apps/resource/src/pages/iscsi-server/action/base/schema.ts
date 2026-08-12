import { type IntlLike, commonNameString } from "@zstack/form";
import { z } from "zod";

export const createUpdateIscsiServerSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
  });

export type UpdateIscsiServerFormValues = z.infer<
  ReturnType<typeof createUpdateIscsiServerSchema>
>;
