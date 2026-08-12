import {
  type IntlLike,
  commonNameString,
  longDescriptionString,
  requiredString,
  uniqueResourceName,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { formatProp } from "@zstack/zsphere-utils";
import { z } from "zod";

export const createUpdateL2NetworkSchema = (
  intl: IntlLike,
  originName?: string,
) =>
  z.object({
    name: z
      .string()
      .transform((value) => formatProp(value))
      .pipe(
        commonNameString(intl).and(
          uniqueResourceName(
            intl,
            ResourceQueryType.L2Network,
            originName,
            intl.formatMessage({
              id: "l2Network.field.name.validator.duplicate",
              defaultMessage: "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ),
      ),
    description: longDescriptionString(intl),
  });

export type UpdateL2NetworkFormValues = z.infer<
  ReturnType<typeof createUpdateL2NetworkSchema>
>;

export const createEditBondConfigSchema = (intl: IntlLike) =>
  z
    .object({
      mode: requiredString(intl),
      xmitHashPolicy: z.string(),
    })
    .superRefine((value, ctx) => {
      if (value.mode !== "802.3ad") {
        return;
      }

      const xmitHashPolicyResult = requiredString(intl).safeParse(
        value.xmitHashPolicy,
      );
      if (!xmitHashPolicyResult.success) {
        ctx.addIssue({
          code: "custom",
          path: ["xmitHashPolicy"],
          message: xmitHashPolicyResult.error.issues[0]?.message ?? "",
        });
      }
    });

export type EditBondConfigValues = z.infer<
  ReturnType<typeof createEditBondConfigSchema>
>;
