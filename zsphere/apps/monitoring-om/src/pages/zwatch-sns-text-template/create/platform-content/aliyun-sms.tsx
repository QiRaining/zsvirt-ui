import { Input, Textarea } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

interface IProps {
  formInstance: any;
}

const { Item } = Form;

const genDefaultResourceTemplateMessageText = (intl: any) => {
  const L1 =
    `${intl.formatMessage({ id: "alarm", defaultMessage: "Alarm" })}: ` +
    "${ALARM_NAME}" +
    ",";
  const L2 =
    `${intl.formatMessage({ id: "resourceName", defaultMessage: "Name" })}: ` +
    "${ALARM_RESOURCE_NAME}" +
    ",";
  const L3 =
    `${intl.formatMessage({ id: "triggerConditions", defaultMessage: "Trigger Condition" })}: ` +
    "${ALARM_CONDITION}" +
    ",";
  const L4 =
    `${intl.formatMessage({ id: "alarmLevel", defaultMessage: "Severity" })}: ` +
    "${ALARM_EMERGENCY_LEVEL}" +
    ",";
  const L5 =
    `${intl.formatMessage({ id: "currentValue", defaultMessage: "Current Value" })}: ` +
    "${ALARM_CURRENT_VALUE}";
  return `${L1}${L2}${L3}${L4}${L5}`;
};

const genDefaultEventTemplateMessageText = (intl: any) => {
  const L1 =
    `${intl.formatMessage({ id: "eventName", defaultMessage: "Event Name" })}: ` +
    "${EVENT_NAME}" +
    ",";
  const L2 =
    `${intl.formatMessage({ id: "resourceName", defaultMessage: "Name" })}: ` +
    "${EVENT_RESOURCE_NAME}" +
    ",";
  const L3 =
    `${intl.formatMessage({ id: "alarmLevel", defaultMessage: "Severity" })}: ` +
    "${EVENT_EMERGENCY_LEVEL}" +
    ",";
  const L4 =
    `${intl.formatMessage({ id: "error", defaultMessage: "Error" })}: ` +
    "${EVENT_ERROR}";
  return `${L1}${L2}${L3}${L4}`;
};

const AliyunSmsContent: React.FC<IProps> = ({ formInstance }) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  const defaultResourceTemplateMessageText =
    genDefaultResourceTemplateMessageText(intl);
  const defaultEventTemplateMessageText =
    genDefaultEventTemplateMessageText(intl);

  return (
    <>
      <Item
        label={intl.formatMessage({
          id: "resourceAlert.template",
          defaultMessage: "Resource Alert Template",
        })}
        className={styles.smsItem}
      >
        <Item
          label={intl.formatMessage({
            id: "messageTemplate",
            defaultMessage: "Message Template",
          })}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "messageTemplate.field.resourceAlarmMessageTemplate.tooltip",
                defaultMessage: `### Resource Alarm Message Template

When an alarm is triggered, the platform sends alarm messages to the selected endpoint. You can customize the text of the alarm messages as needed.`,
              })}
            </ReactMarkdown>
          }
          name={["zwatchSNSTextTemplate", "aliyunSms", "template"]}
          rules={[isRequired()]}
        >
          <Textarea
            rows={4}
            className={styles["width-480"]}
            placeholder={defaultResourceTemplateMessageText}
            onBlur={() => {
              const currentVal = formInstance?.getFieldValue([
                "zwatchSNSTextTemplate",
                "aliyunSms",
                "template",
              ]);
              if (!currentVal) {
                formInstance?.setFieldsValue({
                  zwatchSNSTextTemplate: {
                    aliyunSms: {
                      template: defaultResourceTemplateMessageText,
                    },
                  },
                });
              }
            }}
          />
        </Item>

        <Item
          label={intl.formatMessage({
            id: "templateCode",
            defaultMessage: "Template Code",
          })}
          style={{
            marginBottom: "0px",
          }}
          name={["zwatchSNSTextTemplate", "aliyunSms", "alarmTemplateCode"]}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "messageTemplate.field.templateCode.validator.required",
                defaultMessage: "This field is required.",
              }),
            },
          ]}
        >
          <Input className={styles["width-400"]} />
        </Item>
      </Item>

      <Item
        label={intl.formatMessage({
          id: "eventAlert.template",
          defaultMessage: "Event Alert Template",
        })}
        className={styles.smsItem}
      >
        <Item
          required
          label={intl.formatMessage({
            id: "messageTemplate",
            defaultMessage: "Message Template",
          })}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "messageTemplate.field.eventAlarmMessageTemplate.tooltip",
                defaultMessage: `### Event Alarm Message Template

When an alarm is triggered, the platform sends alarm messages to the selected endpoint. You can customize the text of the alarm messages as needed.`,
              })}
            </ReactMarkdown>
          }
          name={["zwatchSNSTextTemplate", "aliyunSms", "eventTemplate"]}
          rules={[isRequired()]}
        >
          <Textarea
            rows={4}
            className={styles["width-480"]}
            placeholder={defaultEventTemplateMessageText}
            onBlur={() => {
              const currentVal = formInstance?.getFieldValue([
                "zwatchSNSTextTemplate",
                "aliyunSms",
                "eventTemplate",
              ]);
              if (!currentVal) {
                formInstance?.setFieldsValue({
                  zwatchSNSTextTemplate: {
                    aliyunSms: {
                      eventTemplate: defaultEventTemplateMessageText,
                    },
                  },
                });
              }
            }}
          />
        </Item>

        <Item
          required
          label={intl.formatMessage({
            id: "templateCode",
            defaultMessage: "Template Code",
          })}
          style={{
            marginBottom: "0px",
          }}
          name={["zwatchSNSTextTemplate", "aliyunSms", "eventTemplateCode"]}
          rules={[isRequired()]}
        >
          <Input className={styles["width-400"]} />
        </Item>
      </Item>
    </>
  );
};

export default AliyunSmsContent;
