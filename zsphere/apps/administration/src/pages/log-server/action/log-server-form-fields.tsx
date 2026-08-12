import { Markdown } from "@zstack/design";
import {
  FieldStack,
  InputField,
  InputPasswordField,
  RadioGroupField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@zstack/form";
import React, { useEffect, useMemo, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  DELIVERY_TARGETS,
  getDeliveryTargetOptions,
  getLogServerValuesAfterDeliveryTargetChange,
  getLogServerValuesAfterLogTypeChange,
  type LogServerDeliveryTarget,
  type LogServerFormValues,
  SYSLOG_FACILITIES,
  SYSLOG_PROTOCOLS,
  SYSLOG_SEVERITIES,
} from "./schema";

interface LogServerFormFieldsProps {
  form: UseFormReturn<LogServerFormValues>;
}

const LABEL_CLASS = "w-28 shrink-0";

const toOptions = <T extends string>(items: readonly T[]) =>
  items.map((item) => ({ label: item, value: item }));

export const LogServerFormFields: React.FC<LogServerFormFieldsProps> = ({
  form,
}) => {
  const intl = useIntl();
  const logType = useWatch({ control: form.control, name: "logType" });
  const deliveryTarget = useWatch({
    control: form.control,
    name: "deliveryTarget",
  });
  const previousLogTypeRef = useRef(logType);
  const previousDeliveryTargetRef = useRef(deliveryTarget);

  useEffect(() => {
    if (previousLogTypeRef.current === logType) {
      return;
    }

    previousLogTypeRef.current = logType;
    if (!form.getFieldState("logType").isDirty) {
      return;
    }

    const nextValues = getLogServerValuesAfterLogTypeChange(
      form.getValues(),
      logType,
    );
    form.setValue("deliveryTarget", nextValues.deliveryTarget, {
      shouldValidate: true,
    });
    form.setValue("port", nextValues.port, { shouldValidate: true });
  }, [form, logType]);

  useEffect(() => {
    if (previousDeliveryTargetRef.current === deliveryTarget) {
      return;
    }

    previousDeliveryTargetRef.current = deliveryTarget;
    if (!form.getFieldState("deliveryTarget").isDirty) {
      return;
    }

    const nextValues = getLogServerValuesAfterDeliveryTargetChange(
      form.getValues(),
      deliveryTarget,
    );
    form.setValue("deliveryTarget", nextValues.deliveryTarget, {
      shouldValidate: true,
    });
    form.setValue("port", nextValues.port, { shouldValidate: true });
  }, [deliveryTarget, form]);

  const addressTooltip = (
    <Markdown>
      {intl.formatMessage({
        id: "logServer.field.address.tooltip",
        defaultMessage:
          "Supports IP address, domain name, or URL pattern. Examples: `192.168.0.1`, `www.example.com`, `192.168.0.1/example/`",
      })}
    </Markdown>
  );
  const facilityTooltip = (
    <Markdown>
      {intl.formatMessage({
        id: "logServer.field.facility.tooltip",
        defaultMessage:
          "### Log Facility\n\nSelect the log facility level. LOCAL0 through LOCAL7 are supported. This setting must match the facility level defined in the log server's rsyslog.conf file to ensure the platform can identify the log server and send log messages to it properly.",
      })}
    </Markdown>
  );
  const severityTooltip = (
    <Markdown>
      {intl.formatMessage({
        id: "logServer.form.level.tooltip",
        defaultMessage:
          "### Log Severity Level\n\nSets the minimum severity level for logs sent to the log server. Only logs with a severity at or above the specified level are forwarded. For example, if the level is set to WARN, logs at WARN, ERROR, and FATAL levels are sent.\n\n#### Severity Level (Lowest to Highest)\n\n- ALL: Receive all log messages regardless of level.\n- TRACE: Extremely detailed logs for flow tracing or debugging.\n- DEBUG: Detailed logs for debugging or troubleshooting.\n- INFO: General information about normal application operation.\n- WARN (default): Indicates potential issues that do not affect normal operation.\n- ERROR: Indicates an error that may impact normal operation.\n- FATAL: Indicates a critical error that may cause the application to crash or become unable to continue.",
      })}
    </Markdown>
  );

  const logTypeOptions = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "logServer.logType.management",
          defaultMessage: "Management Node Log",
        }),
        value: "management",
      },
      {
        label: intl.formatMessage({
          id: "logServer.logType.platform",
          defaultMessage: "Platform Operation Log",
        }),
        value: "platform",
      },
    ],
    [intl],
  );
  const deliveryOptions = useMemo(
    () => toOptions(getDeliveryTargetOptions(logType)),
    [logType],
  );
  const protocols = useMemo(() => toOptions(SYSLOG_PROTOCOLS), []);
  const facilities = useMemo(() => toOptions(SYSLOG_FACILITIES), []);
  const severities = useMemo(() => toOptions(SYSLOG_SEVERITIES), []);

  const renderAddressAndPort = () => (
    <>
      <InputField
        form={form}
        name="host"
        label={intl.formatMessage({
          id: "logServer.field.address",
          defaultMessage: "Address",
        })}
        inputTooltip={addressTooltip}
        required
        size="m"
        labelClassName={LABEL_CLASS}
      />
      <InputField
        form={form}
        name="port"
        label={intl.formatMessage({
          id: "logServer.field.port",
          defaultMessage: "Port",
        })}
        inputTooltip="1-65535"
        required
        size="m"
        labelClassName={LABEL_CLASS}
      />
    </>
  );

  return (
    <FieldStack>
      <InputField
        form={form}
        name="name"
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        required
        maxLength={128}
        size="m"
        labelClassName={LABEL_CLASS}
      />
      <TextareaField
        form={form}
        name="description"
        label={intl.formatMessage({
          id: "introduction",
          defaultMessage: "Description",
        })}
        rows={3}
        maxLength={2000}
        showCount
        size="m"
      />
      <RadioGroupField
        form={form}
        name="logType"
        label={intl.formatMessage({
          id: "logServer.field.logType",
          defaultMessage: "Log Type",
        })}
        labelTooltip={
          <Markdown>
            {intl.formatMessage({
              id: "logServer.field.logType.tooltip",
              defaultMessage:
                "### Log Type\n\nSelect the type of logs to be received by the log server:\n\n1. Management Node Logs: Receives logs from platform management nodes.\n\n2. Platform Operation Logs: Receives platform operation logs.",
            })}
          </Markdown>
        }
        options={logTypeOptions}
        required
        labelClassName={LABEL_CLASS}
      />
      <SelectField
        form={form}
        name="deliveryTarget"
        label={intl.formatMessage({
          id: "logServer.field.deliveryTarget",
          defaultMessage: "Output",
        })}
        options={deliveryOptions}
        required
        size="s"
        labelClassName={LABEL_CLASS}
      />
      {renderAddressAndPort()}
      {(logType === "management" || deliveryTarget === "Syslog") && (
        <SelectField
          form={form}
          name="protocol"
          label={intl.formatMessage({
            id: "logServer.field.protocol",
            defaultMessage: "Protocol",
          })}
          options={protocols}
          required
          size="s"
          labelClassName={LABEL_CLASS}
        />
      )}
      {logType === "management" && (
        <>
          <SelectField
            form={form}
            name="facility"
            label={intl.formatMessage({
              id: "logServer.field.facility",
              defaultMessage: "Log Facility",
            })}
            labelTooltip={facilityTooltip}
            options={facilities}
            required
            size="s"
            labelClassName={LABEL_CLASS}
          />
          <SelectField
            form={form}
            name="severity"
            label={intl.formatMessage({
              id: "logServer.field.severity",
              defaultMessage: "Log Severity Level",
            })}
            labelTooltip={severityTooltip}
            options={severities}
            required
            size="s"
            labelClassName={LABEL_CLASS}
          />
        </>
      )}
      {logType === "platform" && deliveryTarget === "Elasticsearch" && (
        <>
          <InputField
            form={form}
            name="esIndex"
            label={intl.formatMessage({
              id: "logServer.field.index",
              defaultMessage: "Index",
            })}
            labelTooltip={
              <Markdown>
                {intl.formatMessage({
                  id: "logServer.field.index.tooltip",
                  defaultMessage:
                    "### Index\n\n1. Specifies the index on the log server where platform logs will be stored. Logs are sent to the specified index.\n\n2. Ensure that the corresponding index has been created on the log server in advance.",
                })}
              </Markdown>
            }
            required
            size="m"
            labelClassName={LABEL_CLASS}
          />
          <SwitchField
            form={form}
            name="esTls"
            label={intl.formatMessage({
              id: "logServer.field.tls",
              defaultMessage: "TLS",
            })}
            layout="label-width"
            labelClassName={LABEL_CLASS}
          />
          <InputField
            form={form}
            name="esUsername"
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
            size="m"
            labelClassName={LABEL_CLASS}
          />
          <InputPasswordField
            form={form}
            name="esPassword"
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
            size="m"
            labelClassName={LABEL_CLASS}
          />
        </>
      )}
      {logType === "platform" && deliveryTarget === "Kafka" && (
        <InputField
          form={form}
          name="kafkaTopics"
          label={intl.formatMessage({
            id: "logServer.field.topics",
            defaultMessage: "Topics",
          })}
          labelTooltip={
            <Markdown>
              {intl.formatMessage({
                id: "logServer.field.topics.tooltip",
                defaultMessage:
                  "### Topics\n\nSpecifies the topics on the log server where platform logs will be stored. Logs are sent to the specified topics.",
              })}
            </Markdown>
          }
          required
          size="m"
          labelClassName={LABEL_CLASS}
        />
      )}
      {logType === "platform" && deliveryTarget === "Loki" && (
        <>
          <InputField
            form={form}
            name="lokiLabelsJob"
            label={intl.formatMessage({
              id: "logServer.field.labelsJob",
              defaultMessage: "Labels Job",
            })}
            labelTooltip={
              <Markdown>
                {intl.formatMessage({
                  id: "logServer.field.labelsJob.tooltip",
                  defaultMessage:
                    "### Labels Job\n\nAdds a Job label to logs to identify that they are sent from this platform. Users can quickly filter logs from this platform on the log server using this label.",
                })}
              </Markdown>
            }
            required
            size="m"
            labelClassName={LABEL_CLASS}
          />
          <SwitchField
            form={form}
            name="lokiTls"
            label={intl.formatMessage({
              id: "logServer.field.tls",
              defaultMessage: "TLS",
            })}
            layout="label-width"
            labelClassName={LABEL_CLASS}
          />
          <InputField
            form={form}
            name="lokiUsername"
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
            size="m"
            labelClassName={LABEL_CLASS}
          />
          <InputPasswordField
            form={form}
            name="lokiPassword"
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
            size="m"
            labelClassName={LABEL_CLASS}
          />
        </>
      )}
    </FieldStack>
  );
};

export const isPlatformDeliveryTarget = (
  value: string,
): value is LogServerDeliveryTarget =>
  DELIVERY_TARGETS.includes(value as LogServerDeliveryTarget);
