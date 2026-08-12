import { type IntlLike } from "@zstack/form";
import { z } from "zod";

const createNonNegativeIntegerUnitSchema = (
  intl: IntlLike,
  message: { id: string; defaultMessage: string },
) =>
  z
    .object({
      number: z.union([z.string(), z.number()]).optional(),
      unit: z.string().optional(),
    })
    .superRefine((value, ctx) => {
      if (
        value.number === undefined ||
        value.number === null ||
        String(value.number).trim() === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: intl.formatMessage({
            id: "globalConfig.edit.validator.cannot.be.empty",
            defaultMessage: "Specify a number.",
          }),
          path: ["number"],
        });
        return;
      }

      const numberValue = Number(value.number);

      if (!Number.isInteger(numberValue) || numberValue < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: intl.formatMessage(message),
          path: ["number"],
        });
      }
    });

export const createModifyMigrationStrategySchema = (intl: IntlLike) =>
  z.object({
    hostBusinessNic: z.boolean(),
    hostStorageState: z.boolean(),
    hostBusinessNicHostStorageState: z.boolean(),
    hostSelfFencerInterval: createNonNegativeIntegerUnitSchema(intl, {
      id: "globalConfig.validate.zero.seconds",
      defaultMessage: "Enter an integer that is equal to or greater than 0.",
    }),
    hostSelfFencerMaxAttempts: createNonNegativeIntegerUnitSchema(intl, {
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.zero.times",
      defaultMessage: "Enter an integer that is equal to or greater than 0.",
    }),
  });

export type ModifyMigrationStrategyFormValues = z.infer<
  ReturnType<typeof createModifyMigrationStrategySchema>
>;
