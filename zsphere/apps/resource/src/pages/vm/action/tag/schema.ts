import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import { z } from "zod";

export const createManagementTagSchema = () =>
  z.object({
    tags: z.array(z.custom<ITag>()).default([]),
  });

export type ManagementTagValues = z.infer<
  ReturnType<typeof createManagementTagSchema>
>;
