import {
  type IntlLike,
  commonNameString,
  longDescriptionString,
  uniqueResourceName,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { z } from "zod";

export const createZoneCreateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl).and(
      uniqueResourceName(
        intl,
        ResourceQueryType.Zone,
        undefined,
        intl.formatMessage({
          id: "zone.name.by.used",
          defaultMessage: "The name is already used by another data center. Enter another name.",
        }),
        true,
      ),
    ),
    description: longDescriptionString(intl),
  });

export type ZoneCreateFormValues = z.infer<
  ReturnType<typeof createZoneCreateSchema>
>;

export const createZoneUpdateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: longDescriptionString(intl),
  });

export type ZoneUpdateFormValues = z.infer<
  ReturnType<typeof createZoneUpdateSchema>
>;
