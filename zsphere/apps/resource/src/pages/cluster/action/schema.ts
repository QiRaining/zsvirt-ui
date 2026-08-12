import {
  commonNameString,
  longDescriptionString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createClusterUpdateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: longDescriptionString(intl),
  });

export type ClusterUpdateFormValues = z.infer<
  ReturnType<typeof createClusterUpdateSchema>
>;
