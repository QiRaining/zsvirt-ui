import {
  commonNameString,
  lengthRangeString,
  longDescriptionString,
  requiredString,
  type IntlLike,
  uniqueResourceName,
  validNameString,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { z } from "zod";

const vmNameDuplicateMessage = (intl: IntlLike) =>
  intl.formatMessage({
    id: "instance.field.name.validator.duplicate",
    defaultMessage: "This name is already in use. Enter a different name.",
  });

export const createUpdateVmSchema = (intl: IntlLike, originName?: string) =>
  z.object({
    name: commonNameString(intl).and(
      uniqueResourceName(
        intl,
        ResourceQueryType.VmInstance,
        originName,
        vmNameDuplicateMessage(intl),
        true,
      ),
    ),
    description: longDescriptionString(intl),
  });

export const createBatchSnapshotSchema = (intl: IntlLike) =>
  z.object({
    name: requiredString(intl)
      .and(lengthRangeString(intl, 1, 64))
      .and(validNameString(intl)),
    description: longDescriptionString(intl),
  });

export type UpdateVmValues = z.infer<ReturnType<typeof createUpdateVmSchema>>;

export type BatchSnapshotValues = z.infer<
  ReturnType<typeof createBatchSnapshotSchema>
>;
