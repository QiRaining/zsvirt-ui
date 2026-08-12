import type { IntlLike } from "@zstack/form";
import { Decrypt, Encrypt } from "@zstack/utils";
import { z } from "zod";

export const LOG_TYPES = ["management", "platform"] as const;
export type LogServerLogType = (typeof LOG_TYPES)[number];

export const DELIVERY_TARGETS = [
  "Syslog",
  "Elasticsearch",
  "Forward",
  "Kafka",
  "Loki",
] as const;
export type LogServerDeliveryTarget = (typeof DELIVERY_TARGETS)[number];

export const SYSLOG_PROTOCOLS = ["UDP", "TCP"] as const;
export const SYSLOG_FACILITIES = [
  "LOCAL0",
  "LOCAL1",
  "LOCAL2",
  "LOCAL3",
  "LOCAL4",
  "LOCAL5",
  "LOCAL6",
  "LOCAL7",
] as const;
export const SYSLOG_SEVERITIES = [
  "ALL",
  "TRACE",
  "DEBUG",
  "INFO",
  "WARN",
  "ERROR",
  "FATAL",
] as const;

export type SyslogProtocol = (typeof SYSLOG_PROTOCOLS)[number];
export type SyslogFacility = (typeof SYSLOG_FACILITIES)[number];
export type SyslogSeverity = (typeof SYSLOG_SEVERITIES)[number];

export interface LogServerFormValues {
  name: string;
  description: string;
  logType: LogServerLogType;
  deliveryTarget: LogServerDeliveryTarget | "";
  host: string;
  port: string;
  protocol: SyslogProtocol | "";
  facility: SyslogFacility | "";
  severity: SyslogSeverity | "";
  esIndex: string;
  esTls: boolean;
  esUsername: string;
  esPassword: string;
  kafkaTopics: string;
  lokiLabelsJob: string;
  lokiTls: boolean;
  lokiUsername: string;
  lokiPassword: string;
}

export type AddLogServerFormValues = LogServerFormValues;
export type UpdateLogServerFormValues = Pick<
  LogServerFormValues,
  "name" | "description"
>;

export interface LogServerConfigurationPayload {
  name: string;
  category: "ManagementNodeLog" | "PlatformOperationLog";
  type: "Log4j2" | "FluentBit";
  level: SyslogSeverity;
  configuration: string;
  description?: string;
  systemTags?: string[];
}

export type TestLogServerConfigurationPayload = Omit<
  LogServerConfigurationPayload,
  "description"
>;

interface LogServerTargetConfiguration {
  host?: string;
  hostname?: string;
  port: string;
  protocol?: SyslogProtocol;
  mode?: SyslogProtocol;
  facility?: string;
  severity?: SyslogSeverity;
  index?: string;
  tls?: boolean | "on";
  username?: string;
  password?: string;
  httpUser?: string;
  httpPassword?: string;
  topics?: string;
  labels?: string;
  labelsJob?: string;
}

interface LogServerConfigurationEnvelope {
  type?: LogServerDeliveryTarget;
  logType?: LogServerLogType;
  deliveryTarget?: LogServerDeliveryTarget;
  appenderType?: LogServerDeliveryTarget;
  configuration?: string;
}

interface LogServerLabelValue {
  name?: string;
  description?: string;
  category?: "ManagementNodeLog" | "PlatformOperationLog";
  type?: "Log4j2" | "FluentBit";
  level?: SyslogSeverity;
  configuration?: string;
}

export const DEFAULT_LOG_SERVER_FORM_VALUES: LogServerFormValues = {
  name: "",
  description: "",
  logType: "management",
  deliveryTarget: "Syslog",
  host: "",
  port: "514",
  protocol: "UDP",
  facility: "LOCAL0",
  severity: "WARN",
  esIndex: "",
  esTls: false,
  esUsername: "",
  esPassword: "",
  kafkaTopics: "",
  lokiLabelsJob: "job=operator",
  lokiTls: false,
  lokiUsername: "",
  lokiPassword: "",
};

const RECOMMENDED_PORTS: Record<LogServerDeliveryTarget, string> = {
  Syslog: "514",
  Elasticsearch: "9200",
  Forward: "24224",
  Kafka: "9092",
  Loki: "3100",
};

export const getDeliveryTargetOptions = (
  logType: LogServerLogType,
): LogServerDeliveryTarget[] =>
  logType === "management" ? ["Syslog"] : [...DELIVERY_TARGETS];

export const getRecommendedPort = (
  deliveryTarget: LogServerDeliveryTarget,
): string => RECOMMENDED_PORTS[deliveryTarget];

export const getLogServerValuesAfterLogTypeChange = (
  values: LogServerFormValues,
  logType: LogServerLogType,
): LogServerFormValues => {
  const deliveryTarget =
    logType === "management" ||
    !values.deliveryTarget ||
    !getDeliveryTargetOptions(logType).includes(values.deliveryTarget)
      ? "Syslog"
      : values.deliveryTarget;

  return {
    ...values,
    logType,
    deliveryTarget,
    port: getRecommendedPort(deliveryTarget),
  };
};

export const getLogServerValuesAfterDeliveryTargetChange = (
  values: LogServerFormValues,
  deliveryTarget: LogServerDeliveryTarget | "",
): LogServerFormValues => ({
  ...values,
  deliveryTarget: values.logType === "management" ? "Syslog" : deliveryTarget,
  port: getRecommendedPort(
    values.logType === "management" || !deliveryTarget
      ? "Syslog"
      : deliveryTarget,
  ),
});

const requiredTrimmedString = (message: string) =>
  z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({ code: "custom", message });
    }
  });

const portString = (intl: IntlLike) =>
  z.string().superRefine((value, ctx) => {
    const message = intl.formatMessage({
      id: "logServer.form.port.validator.invalid",
      defaultMessage: "Enter a valid port (1–65535).",
    });
    const trimmedValue = value.trim();
    const port = Number(trimmedValue);

    if (!trimmedValue || !Number.isInteger(port) || port < 1 || port > 65535) {
      ctx.addIssue({ code: "custom", message });
    }
  });

const createNameDescriptionSchema = (intl: IntlLike) => ({
  name: requiredTrimmedString(
    intl.formatMessage({
      id: "logServer.form.name.validator.required",
      defaultMessage: "This field is required.",
    }),
  ).superRefine((value, ctx) => {
    if (value.length > 128) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "logServer.form.name.validator.max",
          defaultMessage: "The name must not exceed 128 characters.",
        }),
      });
    }
  }),
  description: z.string().superRefine((value, ctx) => {
    if (value.length > 2000) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "logServer.form.description.validator.max",
          defaultMessage: "The description must not exceed 2000 characters.",
        }),
      });
    }
  }),
});

const createLogServerSchema = (intl: IntlLike) =>
  z
    .object({
      ...createNameDescriptionSchema(intl),
      logType: z.enum(LOG_TYPES),
      deliveryTarget: z.union([z.enum(DELIVERY_TARGETS), z.literal("")]),
      host: z.string(),
      port: portString(intl),
      protocol: z.union([z.enum(SYSLOG_PROTOCOLS), z.literal("")]),
      facility: z.union([z.enum(SYSLOG_FACILITIES), z.literal("")]),
      severity: z.union([z.enum(SYSLOG_SEVERITIES), z.literal("")]),
      esIndex: z.string(),
      esTls: z.boolean(),
      esUsername: z.string(),
      esPassword: z.string(),
      kafkaTopics: z.string(),
      lokiLabelsJob: z.string(),
      lokiTls: z.boolean(),
      lokiUsername: z.string(),
      lokiPassword: z.string(),
    })
    .superRefine((value, ctx) => {
      if (!value.deliveryTarget) {
        ctx.addIssue({
          code: "custom",
          path: ["deliveryTarget"],
          message: intl.formatMessage({
            id: "logServer.form.deliveryTarget.validator.required",
            defaultMessage: "Select an output.",
          }),
        });
      }

      if (!value.host.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["host"],
          message:
            value.logType === "management"
              ? intl.formatMessage({
                  id: "logServer.form.host.validator.management.required",
                  defaultMessage: "Enter an IP address.",
                })
              : intl.formatMessage({
                  id: "logServer.form.host.validator.platform.required",
                  defaultMessage: "Enter an address.",
                }),
        });
      }

      if (
        value.logType === "management" ||
        (value.logType === "platform" && value.deliveryTarget === "Syslog")
      ) {
        if (!value.protocol) {
          ctx.addIssue({
            code: "custom",
            path: ["protocol"],
            message: intl.formatMessage({
              id: "logServer.form.protocol.validator.required",
              defaultMessage: "Select a transmission protocol.",
            }),
          });
        }
      }

      if (value.logType === "management") {
        if (!value.facility) {
          ctx.addIssue({
            code: "custom",
            path: ["facility"],
            message: intl.formatMessage({
              id: "logServer.form.facility.validator.required",
              defaultMessage: "Select a log facility.",
            }),
          });
        }
        if (!value.severity) {
          ctx.addIssue({
            code: "custom",
            path: ["severity"],
            message: intl.formatMessage({
              id: "logServer.form.severity.validator.required",
              defaultMessage: "Select a log severity level.",
            }),
          });
        }
      }

      if (
        value.logType === "platform" &&
        value.deliveryTarget === "Elasticsearch" &&
        !value.esIndex.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["esIndex"],
          message: intl.formatMessage({
            id: "logServer.form.esIndex.validator.required",
            defaultMessage: "Enter an index.",
          }),
        });
      }
      if (
        value.logType === "platform" &&
        value.deliveryTarget === "Elasticsearch" &&
        value.esUsername.trim() &&
        !value.esPassword.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["esPassword"],
          message: intl.formatMessage({
            id: "logServer.form.password.validator.requiredWithUsername",
            defaultMessage: "This field is required.",
          }),
        });
      }

      if (
        value.logType === "platform" &&
        value.deliveryTarget === "Kafka" &&
        !value.kafkaTopics.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["kafkaTopics"],
          message: intl.formatMessage({
            id: "logServer.form.kafkaTopics.validator.required",
            defaultMessage: "Enter Topics.",
          }),
        });
      }

      if (
        value.logType === "platform" &&
        value.deliveryTarget === "Loki" &&
        !value.lokiLabelsJob.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["lokiLabelsJob"],
          message: intl.formatMessage({
            id: "logServer.form.lokiLabelsJob.validator.required",
            defaultMessage: "Enter Labels Job.",
          }),
        });
      }
      if (
        value.logType === "platform" &&
        value.deliveryTarget === "Loki" &&
        value.lokiUsername.trim() &&
        !value.lokiPassword.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["lokiPassword"],
          message: intl.formatMessage({
            id: "logServer.form.password.validator.requiredWithUsername",
            defaultMessage: "This field is required.",
          }),
        });
      }
    });

export const createAddLogServerSchema = (intl: IntlLike) =>
  createLogServerSchema(intl);

export const createUpdateLogServerSchema = (intl: IntlLike) =>
  z.object(createNameDescriptionSchema(intl));

const parseJsonObject = <T>(value: unknown): T | undefined => {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

const normalizeFacility = (facility?: string): SyslogFacility | undefined => {
  const normalized = facility?.toUpperCase();
  return SYSLOG_FACILITIES.includes(normalized as SyslogFacility)
    ? (normalized as SyslogFacility)
    : undefined;
};

const normalizeTls = (value?: boolean | string): boolean =>
  value === true || value === "on";

const getTargetConfiguration = (
  values: LogServerFormValues,
): LogServerTargetConfiguration => {
  if (values.logType === "management") {
    return {
      hostname: values.host.trim(),
      port: values.port.trim(),
      protocol: values.protocol as SyslogProtocol,
      facility: values.facility as SyslogFacility,
    };
  }

  const base = {
    host: values.host.trim(),
    port: values.port.trim(),
  };

  switch (values.deliveryTarget) {
    case "Syslog":
      return {
        ...base,
        mode: values.protocol as SyslogProtocol,
      };
    case "Elasticsearch":
      return {
        ...base,
        index: values.esIndex.trim(),
        ...(values.esTls ? { tls: "on" as const } : {}),
        ...(values.esUsername.trim()
          ? { httpUser: values.esUsername.trim() }
          : {}),
        ...(values.esPassword
          ? { httpPassword: Encrypt(values.esPassword) }
          : {}),
      };
    case "Kafka":
      return { ...base, topics: values.kafkaTopics.trim() };
    case "Loki":
      return {
        ...base,
        labels: values.lokiLabelsJob.trim(),
        ...(values.lokiTls ? { tls: "on" as const } : {}),
        ...(values.lokiUsername.trim()
          ? { httpUser: values.lokiUsername.trim() }
          : {}),
        ...(values.lokiPassword
          ? { httpPassword: Encrypt(values.lokiPassword) }
          : {}),
      };
    case "Forward":
    default:
      return base;
  }
};

export const buildLogServerConfiguration = (
  values: LogServerFormValues,
  systemTags?: string[],
): LogServerConfigurationPayload => {
  const configuration = getTargetConfiguration(values);
  const deliveryTarget = values.deliveryTarget || "Syslog";
  const envelope: LogServerConfigurationEnvelope = {
    type: deliveryTarget,
    configuration: JSON.stringify(configuration),
  };
  const isManagementLog = values.logType === "management";

  return {
    name: values.name.trim(),
    description: values.description.trim(),
    category: isManagementLog ? "ManagementNodeLog" : "PlatformOperationLog",
    type: isManagementLog ? "Log4j2" : "FluentBit",
    level: (values.severity ||
      DEFAULT_LOG_SERVER_FORM_VALUES.severity) as SyslogSeverity,
    configuration: JSON.stringify(envelope),
    ...(systemTags ? { systemTags } : {}),
  };
};

export const buildTestLogServerConfiguration = (
  values: LogServerFormValues,
  systemTags: string[],
): TestLogServerConfigurationPayload => {
  const payload = buildLogServerConfiguration(values, systemTags);

  return {
    name: payload.name,
    category: payload.category,
    type: payload.type,
    level: payload.level,
    configuration: payload.configuration,
    systemTags: payload.systemTags,
  };
};

export const parseLogServerLabelValue = (
  labelValue?: string | null,
): LogServerFormValues => {
  const label = parseJsonObject<LogServerLabelValue>(labelValue) ?? {};
  const envelope =
    parseJsonObject<LogServerConfigurationEnvelope>(label.configuration) ?? {};
  const targetConfig =
    parseJsonObject<Partial<LogServerTargetConfiguration>>(
      envelope.configuration,
    ) ?? {};
  const deliveryTarget = DELIVERY_TARGETS.includes(
    (envelope.type ??
      envelope.deliveryTarget ??
      envelope.appenderType) as LogServerDeliveryTarget,
  )
    ? ((envelope.type ??
        envelope.deliveryTarget ??
        envelope.appenderType) as LogServerDeliveryTarget)
    : envelope.appenderType === "Syslog"
      ? "Syslog"
      : "Syslog";
  const logType =
    label.category === "PlatformOperationLog" || label.type === "FluentBit"
      ? "platform"
      : LOG_TYPES.includes(envelope.logType as LogServerLogType)
        ? (envelope.logType as LogServerLogType)
        : "management";

  return {
    ...DEFAULT_LOG_SERVER_FORM_VALUES,
    name: label.name ?? "",
    description: label.description ?? "",
    logType,
    deliveryTarget,
    host: targetConfig.host ?? targetConfig.hostname ?? "",
    port: targetConfig.port ?? getRecommendedPort(deliveryTarget),
    protocol:
      targetConfig.protocol ??
      targetConfig.mode ??
      DEFAULT_LOG_SERVER_FORM_VALUES.protocol,
    facility:
      normalizeFacility(targetConfig.facility) ??
      DEFAULT_LOG_SERVER_FORM_VALUES.facility,
    severity:
      label.level ??
      targetConfig.severity ??
      DEFAULT_LOG_SERVER_FORM_VALUES.severity,
    esIndex:
      deliveryTarget === "Elasticsearch" ? (targetConfig.index ?? "") : "",
    esTls:
      deliveryTarget === "Elasticsearch"
        ? normalizeTls(targetConfig.tls)
        : false,
    esUsername:
      deliveryTarget === "Elasticsearch"
        ? (targetConfig.httpUser ?? targetConfig.username ?? "")
        : "",
    esPassword:
      deliveryTarget === "Elasticsearch"
        ? Decrypt(targetConfig.httpPassword ?? targetConfig.password ?? "")
        : "",
    kafkaTopics: targetConfig.topics ?? "",
    lokiLabelsJob:
      deliveryTarget === "Loki"
        ? (targetConfig.labels ??
          targetConfig.labelsJob ??
          DEFAULT_LOG_SERVER_FORM_VALUES.lokiLabelsJob)
        : DEFAULT_LOG_SERVER_FORM_VALUES.lokiLabelsJob,
    lokiTls: deliveryTarget === "Loki" ? normalizeTls(targetConfig.tls) : false,
    lokiUsername:
      deliveryTarget === "Loki"
        ? (targetConfig.httpUser ?? targetConfig.username ?? "")
        : "",
    lokiPassword:
      deliveryTarget === "Loki"
        ? Decrypt(targetConfig.httpPassword ?? targetConfig.password ?? "")
        : "",
  };
};
