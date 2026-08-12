import type { IntlLike } from "@zstack/form";
import { z } from "zod";

const optionalNumberValue = z.union([z.number(), z.literal("")]);
const optionalBooleanValue = z.boolean().optional();
type LegacyRule = {
  required?: boolean;
  message?: string;
  type?: string;
  min?: number;
  max?: number;
  validator?: (rule: LegacyRule, value: unknown) => Promise<unknown> | unknown;
};
type LegacyRuleFactory = (form: {
  getFieldValue: (name: string | string[]) => unknown;
}) => LegacyRule;
type LegacyRuleLike = LegacyRule | LegacyRuleFactory;
type LegacyRuleMap = Record<string, LegacyRuleLike[] | undefined>;

export type DynamicGlobalConfigFormValues = Record<string, unknown>;

export const getDynamicValue = (
  values: DynamicGlobalConfigFormValues,
  name: string | string[],
) => {
  const path = Array.isArray(name) ? name : name.split(".");
  const flatName = Array.isArray(name) ? name.join(".") : name;

  if (Object.prototype.hasOwnProperty.call(values, flatName)) {
    return values[flatName];
  }

  return path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, values);
};

const isEmptyLegacyValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value === "object" && "number" in value) {
    const numberValue = (value as { number?: unknown }).number;
    return (
      numberValue === undefined || numberValue === null || numberValue === ""
    );
  }

  return false;
};

const getLegacyRuleMessage = (
  rule: LegacyRule,
  fallback = "输入内容不能为空",
) => String(rule.message || fallback);

const runLegacyRules = async (
  values: DynamicGlobalConfigFormValues,
  ctx: z.RefinementCtx,
  rulesByField: LegacyRuleMap,
) => {
  for (const [fieldName, rules = []] of Object.entries(rulesByField)) {
    const value = getDynamicValue(values, fieldName);

    for (const rawRule of rules) {
      const rule =
        typeof rawRule === "function"
          ? rawRule({
              getFieldValue: (name) => getDynamicValue(values, name),
            })
          : rawRule;

      if (rule.required && isEmptyLegacyValue(value)) {
        ctx.addIssue({
          code: "custom",
          path: [fieldName],
          message: getLegacyRuleMessage(rule),
        });
        continue;
      }

      if (rule.type === "string" && typeof value === "string") {
        if (typeof rule.min === "number" && value.length < rule.min) {
          ctx.addIssue({
            code: "custom",
            path: [fieldName],
            message: getLegacyRuleMessage(rule),
          });
        }

        if (typeof rule.max === "number" && value.length > rule.max) {
          ctx.addIssue({
            code: "custom",
            path: [fieldName],
            message: getLegacyRuleMessage(rule),
          });
        }
      }

      if (!rule.validator) {
        continue;
      }

      try {
        await rule.validator(rule, value);
      } catch (error) {
        ctx.addIssue({
          code: "custom",
          path: [fieldName],
          message:
            typeof error === "string"
              ? error
              : error instanceof Error
                ? error.message
                : getLegacyRuleMessage(rule),
        });
      }
    }
  }
};

export const createDynamicGlobalConfigSchema = (rulesByField: LegacyRuleMap) =>
  z.record(z.string(), z.unknown()).superRefine(async (values, ctx) => {
    await runLegacyRules(values, ctx, rulesByField);
  });

export const createConditionalDynamicGlobalConfigSchema = (
  shouldValidate: (values: DynamicGlobalConfigFormValues) => boolean,
  rulesByField: LegacyRuleMap,
) =>
  z.record(z.string(), z.unknown()).superRefine(async (values, ctx) => {
    if (shouldValidate(values)) {
      await runLegacyRules(values, ctx, rulesByField);
    }
  });

export const createUiLoginPortalSchema = (
  intl: IntlLike,
  fieldName: string,
  rules: LegacyRuleLike[] = [],
) =>
  createDynamicGlobalConfigSchema({
    [fieldName]: rules,
    acceptRisk: [
      {
        validator: (_rule, value) => {
          if (value) {
            return Promise.resolve();
          }

          return Promise.reject(
            intl.formatMessage({
              id: "please.check.risk.prompt.first",
              defaultMessage: "Acknowledge the risk.",
            }),
          );
        },
      },
    ],
  });

export const createInputWithPasswordSchema = (
  intl: IntlLike,
  fieldName: string,
  rules: LegacyRuleLike[] = [],
) =>
  createDynamicGlobalConfigSchema({
    [fieldName]: rules,
    confirm: [
      {
        required: true,
        message: intl.formatMessage({
          id: "confirm.password.required",
          defaultMessage: "This field is required.",
        }),
      },
      {
        validator: (_rule, value) => {
          if (!value || value === undefined) {
            return Promise.resolve();
          }

          if (value === undefined || value === null || value === "") {
            return Promise.resolve();
          }

          return Promise.resolve();
        },
      },
      ({ getFieldValue }) => ({
        validator: (_rule, value) => {
          if (!value || getFieldValue([fieldName]) === value) {
            return Promise.resolve();
          }

          return Promise.reject(
            intl.formatMessage({
              id: "globalConfig.form.confirm.password.validator.format",
              defaultMessage: "Passwords do not match. Enter passwords again.",
            }),
          );
        },
      }),
    ],
  });

export const createManagementServerLogSizeSchema = (intl: IntlLike) =>
  z
    .object({
      setting: z.boolean(),
      size: optionalNumberValue,
    })
    .superRefine((values, ctx) => {
      if (!values.setting) {
        return;
      }

      addRequiredIntegerIssue(
        values.size,
        ctx,
        intl,
        {
          id: "globalConfig.validate.less.than.or.equal.to.one",
          defaultMessage: "Enter an integer that is equal to or greater than 1.",
        },
        (value) => value >= 1,
        ["size"],
      );
    });

export type ManagementServerLogSizeFormValues = z.infer<
  ReturnType<typeof createManagementServerLogSizeSchema>
>;

const positiveIntegerString = (intl: IntlLike) =>
  z.string().superRefine((value, ctx) => {
    if (value.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "global.field.validator.input.required",
          defaultMessage: "This field is required.",
        }),
      });
      return;
    }

    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "autoScalingGroup.form.validator.please.input.number",
          defaultMessage: "Enter a number.",
        }),
      });
      return;
    }

    if (numberValue <= 0) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage(
          {
            id: "global.field.validator.greatThan",
            defaultMessage: "This field must be greater than {num}.",
          },
          { num: 0 },
        ),
      });
      return;
    }

    if (!Number.isInteger(numberValue)) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "autoScalingGroup.form.validator.please.input.int.number",
          defaultMessage: "Enter an integer.",
        }),
      });
    }
  });

export const createSetCrashRebootSchema = (intl: IntlLike) =>
  z.object({
    duration: positiveIntegerString(intl),
    times: positiveIntegerString(intl),
  });

export type SetCrashRebootFormValues = z.infer<
  ReturnType<typeof createSetCrashRebootSchema>
>;

export const createSwitchModalSchema = () =>
  z.object({
    enabled: z.boolean(),
  });

export type SwitchModalFormValues = z.infer<
  ReturnType<typeof createSwitchModalSchema>
>;

const crashStrategyValues = ["Preserve", "Reboot", "Shutdown"] as const;

export const createSetCrashStrategySchema = () =>
  z.object({
    faultDetection: z.boolean(),
    crashStrategy: z.enum(crashStrategyValues),
  });

export type SetCrashStrategyFormValues = z.infer<
  ReturnType<typeof createSetCrashStrategySchema>
>;

export const getCrashStrategyPayloadValue = (
  values: SetCrashStrategyFormValues,
) => (values.faultDetection ? values.crashStrategy : "None");

const addRequiredIntegerIssue = (
  value: number | "",
  ctx: z.RefinementCtx,
  intl: IntlLike,
  rangeMessage: {
    id: string;
    defaultMessage: string;
  },
  isValid: (value: number) => boolean,
  path: (string | number)[] = ["retentionTime"],
) => {
  if (value === "") {
    ctx.addIssue({
      code: "custom",
      path,
      message: intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      }),
    });
    return;
  }

  if (Number.isInteger(value) && isValid(value)) {
    return;
  }

  ctx.addIssue({
    code: "custom",
    path,
    message: intl.formatMessage(rangeMessage),
  });
};

export const createManagementServerLogLastModifiedSchema = (intl: IntlLike) =>
  z
    .object({
      setting: z.boolean(),
      retentionTime: optionalNumberValue,
    })
    .superRefine((values, ctx) => {
      if (!values.setting) {
        return;
      }

      addRequiredIntegerIssue(
        values.retentionTime,
        ctx,
        intl,
        {
          id: "globalConfig.validate.less.than.or.equal.to.one",
          defaultMessage: "Enter an integer that is equal to or greater than 1.",
        },
        (value) => value >= 1,
      );
    });

export type ManagementServerLogLastModifiedFormValues = z.infer<
  ReturnType<typeof createManagementServerLogLastModifiedSchema>
>;

export const createAuditRetentionDurationSchema = (intl: IntlLike) =>
  z
    .object({
      setting: z.boolean(),
      retentionTime: optionalNumberValue,
    })
    .superRefine((values, ctx) => {
      if (!values.setting) {
        return;
      }

      addRequiredIntegerIssue(
        values.retentionTime,
        ctx,
        intl,
        {
          id: "globalConfig.validate.audit.retention.duration.range",
          defaultMessage: "Input should be an integer number, set value within [1, 365].",
        },
        (value) => value >= 1 && value <= 365,
      );
    });

export type AuditRetentionDurationFormValues = z.infer<
  ReturnType<typeof createAuditRetentionDurationSchema>
>;

export const createLinkageCpuModeSchema = () =>
  z.object({
    cpuMode: z.string().min(1),
  });

export type LinkageCpuModeFormValues = z.infer<
  ReturnType<typeof createLinkageCpuModeSchema>
>;

export const createCpuModeSelectSchema = () =>
  z.object({
    firstSelect: z.string().min(1),
    secondSelect: z.string().optional(),
  });

export type CpuModeSelectFormValues = z.infer<
  ReturnType<typeof createCpuModeSelectSchema>
>;

type PasswordRangeSchemaOptions = {
  min: number;
  max: number;
  minimumTooSmallMessage: {
    id: string;
    defaultMessage: string;
  };
  maximumTooLargeMessage: {
    id: string;
    defaultMessage: string;
  };
  requireInteger?: boolean;
};

const addPasswordRangeIssue = (
  value: number | "",
  ctx: z.RefinementCtx,
  intl: IntlLike,
  path: string,
  options: PasswordRangeSchemaOptions,
  type: "minimum" | "maximum",
) => {
  if (options.requireInteger && !Number.isInteger(value)) {
    ctx.addIssue({
      code: "custom",
      path: [path],
      message: intl.formatMessage({
        id: "validator.please.enter.an.integer",
        defaultMessage: "Enter an integer.",
      }),
    });
    return;
  }

  if (type === "minimum" && Number(value) < options.min) {
    ctx.addIssue({
      code: "custom",
      path: [path],
      message: intl.formatMessage(options.minimumTooSmallMessage),
    });
  }

  if (type === "maximum" && Number(value) > options.max) {
    ctx.addIssue({
      code: "custom",
      path: [path],
      message: intl.formatMessage(options.maximumTooLargeMessage),
    });
  }
};

export const createPasswordRangeSchema = (
  intl: IntlLike,
  options: PasswordRangeSchemaOptions,
) =>
  z
    .object({
      enabled: z.boolean(),
      minimum: optionalNumberValue,
      maximum: optionalNumberValue,
      checkOther: optionalBooleanValue,
    })
    .superRefine((values, ctx) => {
      if (!values.enabled) {
        return;
      }

      addPasswordRangeIssue(
        values.minimum,
        ctx,
        intl,
        "minimum",
        options,
        "minimum",
      );
      addPasswordRangeIssue(
        values.maximum,
        ctx,
        intl,
        "maximum",
        options,
        "maximum",
      );

      if (Number(values.minimum) > Number(values.maximum)) {
        ctx.addIssue({
          code: "custom",
          path: ["maximum"],
          message: intl.formatMessage({
            id: "cannot.be.less.than.the.minimum.value",
            defaultMessage: "Enter an integer no smaller than the minimum value.",
          }),
        });
      }
    });

export type PasswordRangeFormValues = z.infer<
  ReturnType<typeof createPasswordRangeSchema>
>;
