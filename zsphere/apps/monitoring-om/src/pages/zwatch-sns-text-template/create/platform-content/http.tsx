import { CodeMirrorEditor, Form } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { Input } from "antd";
import { get } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

const { Item } = Form;
interface IProps {
  isResourceAlarm: boolean;
  formInstance: any;
  init: any;
}

const genResourceDefaultAlarmMessage = (intl: any) => {
  return {
    facts: [
      {
        name: `${intl.formatMessage({
          id: "zwatchAlarmDetail",
          defaultMessage: "Alarm Details",
        })}`,
        value: null,
      },
      {
        name: "UUID",
        value: "${ALARM_UUID}",
      },
      {
        name: `${intl.formatMessage({
          id: "resourceType",
          defaultMessage: "Resource Type",
        })}`,
        value: "${ALARM_NAMESPACE}",
      },
      {
        name: `${intl.formatMessage({
          id: "triggerConditions",
          defaultMessage: "Trigger Condition",
        })}`,
        value:
          "${ALARM_METRIC} ${ALARM_COMPARISON_OPERATOR} ${ALARM_THRESHOLD}",
      },
      {
        name: `${intl.formatMessage({
          id: "triggerConditionDuration",
          defaultMessage: "Trigger Condition Duration",
        })}`,
        value: "${ALARM_DURATION} seconds",
      },
      {
        name: `${intl.formatMessage({
          id: "previousState",
          defaultMessage: "Previous Status",
        })}`,
        value: "${ALARM_PREVIOUS_STATUS}",
      },
      {
        name: `${intl.formatMessage({
          id: "currentValue",
          defaultMessage: "Current Value",
        })}`,
        value: "${ALARM_CURRENT_VALUE}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmResourceUuid",
          defaultMessage: "Alarm Resource UUID",
        })}`,
        value: "${ALARM_RESOURCE_ID}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmTriggerTime",
          defaultMessage: "Alarm Trigger Time",
        })}`,
        value: "${ALARM_TIME}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmResourceName",
          defaultMessage: "Alarm Resource Name",
        })}`,
        value: "${ALARM_RESOURCE_NAME}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmLevel",
          defaultMessage: "Severity",
        })}`,
        value: "${ALARM_EMERGENCY_LEVEL}",
      },
      {
        name: `${intl.formatMessage({ id: "tag", defaultMessage: "Tag" })}`,
        value: '${ALARM_LABELS.join(",")}',
      },
      {
        name: `${intl.formatMessage({
          id: "alarm_resource_ip",
          defaultMessage: "Alarm Resource IP",
        })}`,
        value: "${ALARM_RESOURCE_IP}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarm_resource_cluster_uuid",
          defaultMessage: "Cluster UUID",
        })}`,
        value: "${ALARM_RESOURCE_CLUSTER_UUID}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarm_resource_cluster_name",
          defaultMessage: "Cluster Name",
        })}`,
        value: "${ALARM_RESOURCE_CLUSTER_NAME}",
      },
    ],
  };
};

const genResourceDefaultRecoverMessage = (intl: any) => {
  return {
    facts: [
      {
        name: `${intl.formatMessage({
          id: "alarmRecoveryDetails",
          defaultMessage: "Alarm Recovery Details",
        })}`,
        value: null,
      },
      {
        name: "UUID",
        value: "${ALARM_UUID}",
      },
      {
        name: `${intl.formatMessage({
          id: "resourceType",
          defaultMessage: "Resource Type",
        })}`,
        value: "${ALARM_NAMESPACE}",
      },
      {
        name: `${intl.formatMessage({
          id: "restorationConditions",
          defaultMessage: "Recovery Condition",
        })}`,
        value:
          "${ALARM_METRIC} ${ALARM_COMPARISON_OPERATOR_REVERSE} ${ALARM_THRESHOLD}",
      },
      {
        name: `${intl.formatMessage({
          id: "previousState",
          defaultMessage: "Previous Status",
        })}`,
        value: "${ALARM_PREVIOUS_STATUS}",
      },
      {
        name: `${intl.formatMessage({
          id: "currentValue",
          defaultMessage: "Current Value",
        })}`,
        value: "${ALARM_CURRENT_VALUE}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmResourceUuid",
          defaultMessage: "Alarm Resource UUID",
        })}`,
        value: "${ALARM_RESOURCE_ID}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmTriggerTime",
          defaultMessage: "Alarm Trigger Time",
        })}`,
        value: "${ALARM_TIME}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmLevel",
          defaultMessage: "Severity",
        })}`,
        value: "${ALARM_EMERGENCY_LEVEL}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmResourceName",
          defaultMessage: "Alarm Resource Name",
        })}`,
        value: "${ALARM_RESOURCE_NAME}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarm_resource_ip",
          defaultMessage: "Alarm Resource IP",
        })}`,
        value: "${ALARM_RESOURCE_IP}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarm_resource_cluster_uuid",
          defaultMessage: "Cluster UUID",
        })}`,
        value: "${ALARM_RESOURCE_CLUSTER_UUID}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarm_resource_cluster_name",
          defaultMessage: "Cluster Name",
        })}`,
        value: "${ALARM_RESOURCE_CLUSTER_NAME}",
      },
    ],
  };
};

const genEventDefaultAlarmMessage = (intl: any) => {
  return {
    facts: [
      {
        name: `${intl.formatMessage({
          id: "eventDetail",
          defaultMessage: "Event Details",
        })}`,
        value: null,
      },
      {
        name: `${intl.formatMessage({ id: "name", defaultMessage: "Name" })}`,
        value: "${EVENT_NAME}",
      },
      {
        name: `${intl.formatMessage({
          id: "resourceType",
          defaultMessage: "Resource Type",
        })}`,
        value: "${EVENT_NAMESPACE}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmLevel",
          defaultMessage: "Severity",
        })}`,
        value: "${EVENT_EMERGENCY_LEVEL}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmResourceUuid",
          defaultMessage: "Alarm Resource UUID",
        })}`,
        value: "${EVENT_RESOURCE_ID}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmResourceName",
          defaultMessage: "Alarm Resource Name",
        })}`,
        value: "${EVENT_RESOURCE_NAME}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarmTriggerTime",
          defaultMessage: "Alarm Trigger Time",
        })}`,
        value: "${EVENT_TIME}",
      },
      {
        name: `${intl.formatMessage({
          id: "eventSubscriptionUuid",
          defaultMessage: "Event Subscription UUID",
        })}`,
        value: "${EVENT_SUBSCRIPTION_UUID}",
      },
      {
        name: `${intl.formatMessage({ id: "error", defaultMessage: "Error" })}`,
        value: "${EVENT_ERROR}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarm_resource_ip",
          defaultMessage: "Alarm Resource IP",
        })}`,
        value: "${EVENT_RESOURCE_IP}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarm_resource_cluster_uuid",
          defaultMessage: "Cluster UUID",
        })}`,
        value: "${EVENT_RESOURCE_CLUSTER_UUID}",
      },
      {
        name: `${intl.formatMessage({
          id: "alarm_resource_cluster_name",
          defaultMessage: "Cluster Name",
        })}`,
        value: "${EVENT_RESOURCE_CLUSTER_NAME}",
      },
    ],
  };
};

const HttpContent: React.FC<IProps> = ({
  isResourceAlarm,
  formInstance,
  init,
}) => {
  const intl = useIntl();
  const { isRequired, validJsonParse } = useValidator(intl);

  const defaultResourceAlarmMessage = genResourceDefaultAlarmMessage(intl);
  const defaultResourceRecoverMessage = genResourceDefaultRecoverMessage(intl);
  const defaultEventAlarmMessage = genEventDefaultAlarmMessage(intl);

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

  React.useEffect(() => {
    if (init) {
      // 编辑：从 init 回填
      formInstance?.setFieldsValue({
        zwatchSNSTextTemplate: {
          http: get(init, ["zwatchSNSTextTemplate", "http"]),
        },
      });
      return;
    }
    // 新建：设置 HTTP 类型默认模板，避免在 render 中调用 setFieldsValue 导致异常（ZSV-11309）
    formInstance?.setFieldsValue({
      zwatchSNSTextTemplate: {
        http: {
          template: JSON.stringify(
            isResourceAlarm
              ? defaultResourceAlarmMessage
              : defaultEventAlarmMessage,
            null,
            2,
          ),
          recoveryTemplate: JSON.stringify(
            defaultResourceRecoverMessage,
            null,
            2,
          ),
          subject: "",
        },
      },
    });
  }, [init, isResourceAlarm, formInstance]);

  return (
    <>
      <Item
        label={intl.formatMessage({
          id: "messageTemplate.title",
          defaultMessage: "Alarm Message Title",
        })}
        required
        name={["zwatchSNSTextTemplate", "http", "subject"]}
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
        rules={[isRequired()]}
      >
        <Input.TextArea
          rows={3}
          className={styles["width-480"]}
          placeholder={subjectPlaceholder}
          onBlur={() => {
            const currentVal = formInstance?.getFieldValue([
              "zwatchSNSTextTemplate",
              "http",
              "subject",
            ]);
            if (!currentVal) {
              formInstance?.setFieldsValue({
                zwatchSNSTextTemplate: {
                  http: {
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
          id: "alarm.message.text",
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
        name={["zwatchSNSTextTemplate", "http", "template"]}
        rules={[isRequired(), validJsonParse()]}
      >
        <CodeMirrorEditor
          height={340}
          width={480}
          border
          title={intl.formatMessage({
            id: "editor.customSelfText",
            defaultMessage: "Edit Custom Text",
          })}
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
            name={["zwatchSNSTextTemplate", "http", "recoverySubject"]}
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
            rules={[isRequired()]}
          >
            <Input.TextArea
              rows={3}
              className={styles["width-480"]}
              placeholder={intl.formatMessage({
                id: "snsTextTemplate.recoverySubject.placeholder",
                defaultMessage:
                  "Alarm ${ALARM_NAME} ${TITLE_ALARM_RESOURCE_NAME} ${ALARM_CURRENT_STATUS}",
              })}
              onBlur={() => {
                const currentVal = formInstance?.getFieldValue([
                  "zwatchSNSTextTemplate",
                  "http",
                  "recoverySubject",
                ]);
                if (!currentVal) {
                  formInstance?.setFieldsValue({
                    zwatchSNSTextTemplate: {
                      http: {
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
            name={["zwatchSNSTextTemplate", "http", "recoveryTemplate"]}
            rules={[isRequired(), validJsonParse()]}
          >
            <CodeMirrorEditor
              height={340}
              width={480}
              border
              title={intl.formatMessage({
                id: "editor.customSelfText",
                defaultMessage: "Edit Custom Text",
              })}
            />
          </Item>
        </>
      ) : null}
    </>
  );
};

export default HttpContent;
