import {
  commonDescriptionString,
  lengthRangeString,
  requiredString,
  type IntlLike,
  uniqueResourceName,
  validNameString,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import { z } from "zod";

const resourceAttributeKeyGlobalType = "ResourceAttributeKeyVO";

const resourceAttributeKeyNameString = (intl: IntlLike, originName?: string) =>
  requiredString(intl)
    .and(lengthRangeString(intl, 1, 80))
    .and(validNameString(intl))
    .and(
      uniqueResourceName(
        intl,
        ResourceQueryType.ResourceAttributeKey,
        originName,
        intl.formatMessage({
          id: "resource.attribute.key.validator.duplicate",
          defaultMessage: "Duplicated attribute key.",
        }),
        true,
      ),
    );

const optionalResourceAttributeValueString = (intl: IntlLike) =>
  z.string().superRefine((value, ctx) => {
    if (!value) {
      return;
    }

    const lengthResult = lengthRangeString(intl, 1, 80).safeParse(value);
    if (!lengthResult.success) {
      const issue = lengthResult.error.issues[0];
      if (issue) {
        ctx.addIssue(issue);
      }
      return;
    }

    const validNameResult = validNameString(intl).safeParse(value);
    if (!validNameResult.success) {
      const issue = validNameResult.error.issues[0];
      if (issue) {
        ctx.addIssue(issue);
      }
    }
  });

const requiredResourceAttributeValueString = (intl: IntlLike) =>
  requiredString(intl)
    .and(lengthRangeString(intl, 1, 80))
    .and(validNameString(intl));

const resourceAttributeConstraintsArray = (
  intl: IntlLike,
  required: boolean,
  source?: ResourceAttributeKey,
) =>
  z
    .array(
      z.object({
        value: required
          ? requiredResourceAttributeValueString(intl)
          : optionalResourceAttributeValueString(intl),
      }),
    )
    .superRefine((values, ctx) => {
      if (required && !values.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: intl.formatMessage({
            id: "resource.attribute.value.validator.required",
            defaultMessage: "Add an attribute value.",
          }),
        });
      }

      values.forEach((item, index) => {
        if (!item.value) {
          return;
        }

        const duplicatedInCurrent =
          values.filter((value) => value.value === item.value).length > 1;
        const duplicatedInSource = source?.constraints?.some(
          (constraint) => constraint.parameter === item.value,
        );

        if (duplicatedInCurrent || duplicatedInSource) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "value"],
            message: intl.formatMessage({
              id: "resource.attribute.constraint.validator.duplicate.value",
              defaultMessage: "Duplicated attribute value.",
            }),
          });
        }
      });
    });

export const createResourceAttributeConstraintsSchema = (
  intl: IntlLike,
  source?: ResourceAttributeKey,
) =>
  z.object({
    options: resourceAttributeConstraintsArray(intl, true, source),
  });

export type ResourceAttributeConstraintsFormValues = z.infer<
  ReturnType<typeof createResourceAttributeConstraintsSchema>
>;

export const createCreateResourceAttributeKeySchema = (intl: IntlLike) =>
  z.object({
    resourceType: z.string().default(resourceAttributeKeyGlobalType),
    name: resourceAttributeKeyNameString(intl),
    description: commonDescriptionString(intl),
    options: resourceAttributeConstraintsArray(intl, false),
  });

export type CreateResourceAttributeKeyFormValues = z.infer<
  ReturnType<typeof createCreateResourceAttributeKeySchema>
>;

export const createEditResourceAttributeKeySchema = (
  intl: IntlLike,
  originName?: string,
) =>
  z.object({
    name: resourceAttributeKeyNameString(intl, originName),
    description: commonDescriptionString(intl),
  });

export type EditResourceAttributeKeyFormValues = z.infer<
  ReturnType<typeof createEditResourceAttributeKeySchema>
>;
