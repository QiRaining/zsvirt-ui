import {
  commonNameString,
  longDescriptionString,
  type IntlLike,
  uniqueResourceName,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import { z } from "zod";

const vmNameDuplicateMessage = (intl: IntlLike) =>
  intl.formatMessage({
    id: "instance.field.name.validator.duplicate",
    defaultMessage: "This name is already in use. Enter a different name.",
  });

export const createCloneVmToTemplateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl).and(
      uniqueResourceName(
        intl,
        ResourceQueryType.VmInstance,
        undefined,
        vmNameDuplicateMessage(intl),
        true,
      ),
    ),
    description: longDescriptionString(intl),
    tags: z.array(z.custom<ITag>()).default([]),
  });

export type CloneVmToTemplateValues = z.infer<
  ReturnType<typeof createCloneVmToTemplateSchema>
>;
