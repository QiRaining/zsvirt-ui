import type { IntlLike } from "@zstack/form";
import { z } from "zod";

const iqnRegex =
  /^iqn\.[0-9]{4}-[0-9]{2}(?:\.[a-z](?:[a-z0-9-]*[a-z0-9])?)+:[a-z0-9-.:]+$/;
const nqnRegex =
  /^nqn\.[0-9]{4}-[0-9]{2}(?:\.[a-z](?:[a-z0-9-]*[a-z0-9])?)+:[a-z0-9-.:]+$/;

export const createStorageAdapterIdentifierSchema = (
  intl: IntlLike,
  type?: string,
) =>
  z.object({
    identifier: z
      .string()
      .refine((value) => value.trim().length > 0, {
        message: intl.formatMessage({
          id: "global.field.validator.input.required",
          defaultMessage: "This field is required.",
        }),
      })
      .min(
        1,
        intl.formatMessage(
          {
            id: "global.field.validator.lengthRange",
            defaultMessage: "This field must be {min}–{max} characters in length.",
          },
          { min: 1, max: 223 },
        ),
      )
      .max(
        223,
        intl.formatMessage(
          {
            id: "global.field.validator.lengthRange",
            defaultMessage: "This field must be {min}–{max} characters in length.",
          },
          { min: 1, max: 223 },
        ),
      )
      .refine(
        (value) =>
          type !== "NVMe" ? iqnRegex.test(value) : nqnRegex.test(value),
        {
          message:
            type !== "NVMe"
              ? `${intl.formatMessage({
                  id: "storage.adapter.edit.config.field.identifier.validation.invalid.format.iqn",
                  defaultMessage:
                    "An identifier can contain lowercase letters, numbers, hyphens (-), dots (.), and colons (:). It must be formatted as iqn.yyyy-mm.reversed domain name:identifier",
                })}\n${intl.formatMessage({
                  id: "storage.adapter.edit.config.field.identifier.validation.iqn.example",
                  defaultMessage: "Example: iqn.2024-12.com.example:disk2",
                })}`
              : `${intl.formatMessage({
                  id: "storage.adapter.edit.config.field.identifier.validation.invalid.format.nqn",
                  defaultMessage:
                    "An identifier can contain lowercase letters, numbers, hyphens (-), dots (.), and colons (:). It must be formatted as nqn.yyyy-mm.reversed domain name:identifier",
                })}\n${intl.formatMessage({
                  id: "storage.adapter.edit.config.field.identifier.validation.nqn.example",
                  defaultMessage: "Example: nqn.2024-12.com.example:disk2",
                })}`,
        },
      ),
  });

export type StorageAdapterIdentifierFormValues = z.infer<
  ReturnType<typeof createStorageAdapterIdentifierSchema>
>;
