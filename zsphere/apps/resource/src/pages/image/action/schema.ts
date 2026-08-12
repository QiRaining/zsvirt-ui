import {
  commonNameString,
  longDescriptionString,
  type IntlLike,
  uniqueResourceName,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { z } from "zod";

export const createImageUpdateSchema = (intl: IntlLike, originName?: string) =>
  z.object({
    name: commonNameString(intl).and(
      uniqueResourceName(
        intl,
        ResourceQueryType.Image,
        originName,
        intl.formatMessage({
          id: "image.field.name.validator.duplicate",
          defaultMessage: "This name is already in use. Enter a different name.",
        }),
        true,
      ),
    ),
    description: longDescriptionString(intl),
  });

export type ImageUpdateValues = z.infer<
  ReturnType<typeof createImageUpdateSchema>
>;

export const createImageExportSchema = () =>
  z.object({
    exportType: z.enum(["ExportAndDownload", "ExportOnly"]),
  });

export type ImageExportFormValues = z.infer<
  ReturnType<typeof createImageExportSchema>
>;
