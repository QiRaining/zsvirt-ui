import {
  commonNameString,
  longDescriptionString,
  type IntlLike,
  uniqueResourceName,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { z } from "zod";

export const createUpdateVmTemplateSchema = (
  intl: IntlLike,
  originName?: string,
) =>
  z.object({
    name: commonNameString(intl).and(
      uniqueResourceName(
        intl,
        ResourceQueryType.VmInstance,
        originName,
        intl.formatMessage({
          id: "instance.field.name.validator.duplicate",
          defaultMessage: "This name is already in use. Enter a different name.",
        }),
        true,
      ),
    ),
    description: longDescriptionString(intl),
  });

export type UpdateVmTemplateValues = z.infer<
  ReturnType<typeof createUpdateVmTemplateSchema>
>;
