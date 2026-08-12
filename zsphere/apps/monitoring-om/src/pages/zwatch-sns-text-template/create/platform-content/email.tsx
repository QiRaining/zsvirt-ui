import { Form } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { useUpdateEffect } from "ahooks";
import { Input } from "antd";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

const { Item } = Form;
const { TextArea } = Input;

interface IProps {
  isResourceAlarm: boolean;
  formInstance: any;
}

const getDefaultResourceAlarmMessageText = (intl: any) => {
  return `${intl.formatMessage({
    id: "reasourceAlarm.textTemplate.subject.placeholder",
    defaultMessage:
      "Alarm ${ALARM_METRIC} ${ALARM_COMPARISON_OPERATOR} ${ALARM_THRESHOLD} ${ALARM_CURRENT_STATUS}",
  })}

${intl.formatMessage({ id: "zwatchAlarmDetail", defaultMessage: "Alarm Details" })}:
UUID: \${ALARM_UUID}
${intl.formatMessage({ id: "resourceType", defaultMessage: "Resource Type" })}: \${ALARM_NAMESPACE}
${intl.formatMessage({
  id: "triggerConditions",
  defaultMessage: "Trigger Condition",
})}: \${ALARM_METRIC} \${ALARM_COMPARISON_OPERATOR} \${ALARM_THRESHOLD}
${intl.formatMessage({
  id: "triggerConditionDuration",
  defaultMessage: "Trigger Condition Duration",
})}: \${ALARM_DURATION} seconds
${intl.formatMessage({ id: "alarmTriggerTime", defaultMessage: "Alarm Trigger Time" })}: \${ALARM_TIME}
${intl.formatMessage({ id: "alarmLevel", defaultMessage: "Severity" })}: \${ALARM_EMERGENCY_LEVEL}
${intl.formatMessage({
  id: "previousState",
  defaultMessage: "Previous Status",
})}: \${ALARM_PREVIOUS_STATUS}
${intl.formatMessage({ id: "currentValue", defaultMessage: "Current Value" })}: \${ALARM_CURRENT_VALUE}
${intl.formatMessage({ id: "tag", defaultMessage: "Tag" })}: \${ALARM_LABELS.join(",")}
${intl.formatMessage({
  id: "alarm_resource_ip",
  defaultMessage: "Alarm Resource IP",
})}: \${ALARM_RESOURCE_IP}
${intl.formatMessage({
  id: "alarm_resource_cluster_uuid",
  defaultMessage: "Cluster UUID",
})}: \${ALARM_RESOURCE_CLUSTER_UUID}
${intl.formatMessage({
  id: "alarm_resource_cluster_name",
  defaultMessage: "Cluster Name",
})}: \${ALARM_RESOURCE_CLUSTER_NAME}
  `;
};

const getDefaultResourceRecoveryMessageText = (intl: any) => {
  return `${intl.formatMessage({
    id: "snsTextTemplate.recoverySubject.placeholder",
    defaultMessage:
      "Alarm ${ALARM_NAME} ${TITLE_ALARM_RESOURCE_NAME} ${ALARM_CURRENT_STATUS}",
  })}

${intl.formatMessage({
  id: "alarmRecoveryDetails",
  defaultMessage: "Alarm Recovery Details",
})}:
UUID: \${ALARM_UUID}
${intl.formatMessage({ id: "resourceType", defaultMessage: "Resource Type" })}: \${ALARM_NAMESPACE}
${intl.formatMessage({
  id: "restorationConditions",
  defaultMessage: "Recovery Condition",
})}: \${ALARM_METRIC} \${ALARM_COMPARISON_OPERATOR_REVERSE} \${ALARM_THRESHOLD}
${intl.formatMessage({ id: "alarmLevel", defaultMessage: "Severity" })}: \${ALARM_EMERGENCY_LEVEL}
${intl.formatMessage({
  id: "previousState",
  defaultMessage: "Previous Status",
})}: \${ALARM_PREVIOUS_STATUS}
${intl.formatMessage({ id: "currentValue", defaultMessage: "Current Value" })}: \${ALARM_CURRENT_VALUE}
${intl.formatMessage({
  id: "alarmResourceUuid",
  defaultMessage: "Alarm Resource UUID",
})}: \${ALARM_RESOURCE_ID}
${intl.formatMessage({
  id: "alarmResourceName",
  defaultMessage: "Alarm Resource Name",
})}: \${ALARM_RESOURCE_NAME}
${intl.formatMessage({
  id: "alarm_resource_ip",
  defaultMessage: "Alarm Resource IP",
})}: \${ALARM_RESOURCE_IP}
${intl.formatMessage({
  id: "alarm_resource_cluster_uuid",
  defaultMessage: "Cluster UUID",
})}: \${ALARM_RESOURCE_CLUSTER_UUID}
${intl.formatMessage({
  id: "alarm_resource_cluster_name",
  defaultMessage: "Cluster Name",
})}: \${ALARM_RESOURCE_CLUSTER_NAME}
  `;
};

const getDefaultEventAlarmMessageText = (intl: any) => {
  return `${intl.formatMessage({
    id: "eventAlarm.textTemplate.subject.placeholder",
    defaultMessage: "${EVENT_NAME} alarm occurs.",
  })}

${intl.formatMessage({ id: "eventDetail", defaultMessage: "Event Details" })}:
${intl.formatMessage({ id: "name", defaultMessage: "Name" })}: \${EVENT_NAME}
${intl.formatMessage({ id: "resourceType", defaultMessage: "Resource Type" })}: \${EVENT_NAMESPACE}
${intl.formatMessage({ id: "alarmLevel", defaultMessage: "Severity" })}: \${EVENT_EMERGENCY_LEVEL}
${intl.formatMessage({ id: "resourceUuid", defaultMessage: "Resource UUID" })}: \${EVENT_RESOURCE_ID}
${intl.formatMessage({ id: "resourceName", defaultMessage: "Name" })}: \${EVENT_RESOURCE_NAME}
${intl.formatMessage({ id: "alarmTriggerTime", defaultMessage: "Alarm Trigger Time" })}: \${EVENT_TIME}
${intl.formatMessage({
  id: "eventSubscriptionUuid",
  defaultMessage: "Event Subscription UUID",
})}: \${EVENT_SUBSCRIPTION_UUID}
${intl.formatMessage({
  id: "eventErrorTitle",
  defaultMessage: "Error",
})}: \${EVENT_ERROR}
${intl.formatMessage({
  id: "alarm_resource_ip",
  defaultMessage: "Alarm Resource IP",
})}: \${EVENT_RESOURCE_IP}
${intl.formatMessage({
  id: "alarm_resource_cluster_uuid",
  defaultMessage: "Cluster UUID",
})}: \${EVENT_RESOURCE_CLUSTER_UUID}
${intl.formatMessage({
  id: "alarm_resource_cluster_name",
  defaultMessage: "Cluster Name",
})}: \${EVENT_RESOURCE_CLUSTER_NAME}
  `;
};

const EmailContent: React.FC<IProps> = ({
  isResourceAlarm = true,
  formInstance,
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  const defaultAlarmMessageText = getDefaultResourceAlarmMessageText(intl);
  const defaultRecoveryMessageText =
    getDefaultResourceRecoveryMessageText(intl);
  const defaultEventAlarmMessageText = getDefaultEventAlarmMessageText(intl);

  const alarmMessageTextShouldShow = isResourceAlarm
    ? defaultAlarmMessageText
    : defaultEventAlarmMessageText;

  const subjectPlaceholder = isResourceAlarm
    ? intl.formatMessage({
        id: "reasourceAlarm.textTemplate.subject.placeholder",
        defaultMessage:
          "Alarm ${ALARM_METRIC} ${ALARM_COMPARISON_OPERATOR} ${ALARM_THRESHOLD} ${ALARM_CURRENT_STATUS}",
      })
    : intl.formatMessage({
        id: "eventAlarm.textTemplate.subject.placeholder",
        defaultMessage: "${EVENT_NAME} alarm occurs.",
      });

  const handleAlarmMessageText = () => {
    const currentVal = formInstance?.getFieldValue([
      "zwatchSNSTextTemplate",
      "email",
      "template",
    ]);
    const currentSubjectVal = formInstance?.getFieldValue([
      "zwatchSNSTextTemplate",
      "email",
      "subject",
    ]);
    if (currentVal !== alarmMessageTextShouldShow && !!currentVal) {
      formInstance?.setFieldsValue({
        zwatchSNSTextTemplate: {
          email: {
            template: "",
          },
        },
      });
    }

    if (currentSubjectVal !== subjectPlaceholder && !!currentSubjectVal) {
      formInstance?.setFieldsValue({
        zwatchSNSTextTemplate: {
          email: {
            subject: "",
          },
        },
      });
    }
  };
  useUpdateEffect(() => {
    handleAlarmMessageText();
  }, [isResourceAlarm]);

  return (
    <>
      <Item
        label={intl.formatMessage({
          id: "messageTemplate.title",
          defaultMessage: "Alarm Message Title",
        })}
        required
        name={["zwatchSNSTextTemplate", "email", "subject"]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "messageTemplate.field.title.tooltip",
              defaultMessage: `### Alarm Message Title

When an alarm is triggered, the platform sends alarm messages to the selected endpoint. You can customize the title of the alarm messages as needed.`,
            })}
          </ReactMarkdown>
        }
      >
        <Input.TextArea
          rows={3}
          className={style["width-480"]}
          placeholder={subjectPlaceholder}
          onBlur={() => {
            const currentVal = formInstance?.getFieldValue([
              "zwatchSNSTextTemplate",
              "email",
              "subject",
            ]);
            if (!currentVal) {
              formInstance?.setFieldsValue({
                zwatchSNSTextTemplate: {
                  email: {
                    subject: subjectPlaceholder,
                  },
                },
              });
            }
          }}
        />
      </Item>
      <Item
        label={intl.formatMessage({
          id: "alarmMessageText",
          defaultMessage: "Alarm Message Text",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "messageTemplate.field.alarmMessageText.tooltip",
              defaultMessage: `### Alarm Message Text

When an alarm is triggered, the platform sends alarm messages to the selected endpoint. You can customize the text content of the alarm messages as needed.`,
            })}
          </ReactMarkdown>
        }
        name={["zwatchSNSTextTemplate", "email", "template"]}
        rules={[isRequired()]}
      >
        <TextArea
          rows={15}
          className={style["width-480"]}
          placeholder={alarmMessageTextShouldShow}
          onBlur={() => {
            const currentVal = formInstance?.getFieldValue([
              "zwatchSNSTextTemplate",
              "email",
              "template",
            ]);
            if (!currentVal) {
              formInstance?.setFieldsValue({
                zwatchSNSTextTemplate: {
                  email: {
                    template: alarmMessageTextShouldShow,
                  },
                },
              });
            }
          }}
        />
      </Item>

      {isResourceAlarm ? (
        <>
          <Item
            label={intl.formatMessage({
              id: "recoverMessageTemplate.title",
              defaultMessage: "Recovery Message Title",
            })}
            required
            name={["zwatchSNSTextTemplate", "email", "recoverySubject"]}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "recoverMessageTemplate.field.title.tooltip",
                  defaultMessage: `### Recovery Message Title

When a monitored resource recovers from an alarm status, the platform sends alarm recovery messages to the selected endpoint. You can customize the title of the recovery messages as needed.`,
                })}
              </ReactMarkdown>
            }
          >
            <Input.TextArea
              rows={3}
              className={style["width-480"]}
              placeholder={intl.formatMessage({
                id: "snsTextTemplate.recoverySubject.placeholder",
                defaultMessage:
                  "Alarm ${ALARM_NAME} ${TITLE_ALARM_RESOURCE_NAME} ${ALARM_CURRENT_STATUS}",
              })}
              onBlur={() => {
                const currentVal = formInstance?.getFieldValue([
                  "zwatchSNSTextTemplate",
                  "email",
                  "recoverySubject",
                ]);
                if (!currentVal) {
                  formInstance?.setFieldsValue({
                    zwatchSNSTextTemplate: {
                      email: {
                        recoverySubject: intl.formatMessage({
                          id: "snsTextTemplate.recoverySubject.placeholder",
                          defaultMessage:
                            "Alarm ${ALARM_NAME} ${TITLE_ALARM_RESOURCE_NAME} ${ALARM_CURRENT_STATUS}",
                        }),
                      },
                    },
                  });
                }
              }}
            />
          </Item>
          <Item
            label={intl.formatMessage({
              id: "recoveryMessageText",
              defaultMessage: "Recovery Message Text",
            })}
            style={{
              marginBottom: "10px",
            }}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "messageTemplate.field.recoveryMessageText.tooltip",
                  defaultMessage: `### Recovery Message Text

When a monitored resource recovers from an alarm status, the platform sends alarm recovery messages to the selected endpoint. You can customize the text content of the recovery messages as needed.`,
                })}
              </ReactMarkdown>
            }
            name={["zwatchSNSTextTemplate", "email", "recoveryTemplate"]}
            rules={[isRequired()]}
          >
            <TextArea
              rows={15}
              className={style["width-480"]}
              placeholder={defaultRecoveryMessageText}
              onBlur={() => {
                const currentVal = formInstance?.getFieldValue([
                  "zwatchSNSTextTemplate",
                  "email",
                  "recoveryTemplate",
                ]);
                if (!currentVal) {
                  formInstance?.setFieldsValue({
                    zwatchSNSTextTemplate: {
                      email: {
                        recoveryTemplate: defaultRecoveryMessageText,
                      },
                    },
                  });
                }
              }}
            />
          </Item>
        </>
      ) : null}
    </>
  );
};

export default EmailContent;
