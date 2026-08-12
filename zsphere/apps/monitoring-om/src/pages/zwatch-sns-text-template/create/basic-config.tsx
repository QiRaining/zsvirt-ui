import { Checkbox, Input, RadioGroup } from "@zstack/design";
import { ZSVForm, TextArea, Form, Select } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { FormInstance } from "antd/es/form";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { Platform, ZwatchSNSTextTemplateAlarmType } from "../constant";
import { translateAlarmType, translateAlarmTypePlatform } from "../helper";
import { useGetPlatformList } from "../hook";
import {
  EmailContent,
  DingTalkContent,
  MicrosoftTeamsContent,
  AliyunSmsContent,
  HttpContent,
  WeComContent,
  FeiShuContent,
} from "./platform-content";

import styles from "./style.module.less";

const { Item } = Form;

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

export interface IValue {
  zwatchSNSTextTemplate: {
    common: {
      name: string;
      description?: string;
      applicationPlatformType: Platform;
      type: ZwatchSNSTextTemplateAlarmType;
      defaultTemplate: boolean;
    };
    email?: {
      template: string;
      subject: string;
      recoverySubject: string;
      recoveryTemplate: string;
    };
    feishu?: {
      template: string;
      subject: string;
      recoverySubject: string;
      recoveryTemplate: string;
    };
    dingTalk?: {
      template: string;
      subject: string;
      recoverySubject: string;
      recoveryTemplate: string;
    };
    wecom?: {
      template: string;
      subject: string;
      recoverySubject: string;
      recoveryTemplate: string;
    };
    microsoftTeams?: {
      template: string;
      subject: string;
      recoverySubject: string;
      recoveryTemplate: string;
    };
    http?: {
      template: string;
      subject: string;
      recoverySubject: string;
      recoveryTemplate: string;
    };
    aliyunSms?: {
      sign: string;
      template: string;
      alarmTemplateCode: string;
      eventTemplate: string;
      eventTemplateCode: string;
    };
  };
}

export const inititlValues = {
  zwatchSNSTextTemplate: {
    common: {
      applicationPlatformType: Platform.Email,
      type: ZwatchSNSTextTemplateAlarmType.Alarm,
      defaultTemplate: false,
    },
  },
};

interface IProps {
  form: FormInstance;
  init: any;
}

const BasicConfig: React.FC<IProps> = ({ form, init }) => {
  const intl = useIntl();
  const { isRequired, commonNameRules, commonDescriptionRules } =
    useValidator(intl);

  const isBasicLicense = false;

  const [platform, setPlatform] = useState<Platform>(
    form.getFieldValue([
      "zwatchSNSTextTemplate",
      "common",
      "applicationPlatformType",
    ]) ?? Platform.Email,
  );

  const [isResourceAlarm, setIsResourceAlarm] = useState<boolean>(
    (form.getFieldValue(["zwatchSNSTextTemplate", "common", "type"]) ??
      ZwatchSNSTextTemplateAlarmType.Alarm) ===
      ZwatchSNSTextTemplateAlarmType.Alarm,
  );

  const platformList = useGetPlatformList();

  const contentEl = useMemo(() => {
    const map = {
      [Platform.Email]: () => (
        <EmailContent isResourceAlarm={isResourceAlarm} formInstance={form} />
      ),
      [Platform.DingTalk]: () => (
        <DingTalkContent
          isResourceAlarm={isResourceAlarm}
          formInstance={form}
          init={init}
        />
      ),
      [Platform.MicrosoftTeams]: () => (
        <MicrosoftTeamsContent
          isResourceAlarm={isResourceAlarm}
          formInstance={form}
          init={init}
        />
      ),
      [Platform.FeiShu]: () => (
        <FeiShuContent
          isResourceAlarm={isResourceAlarm}
          formInstance={form}
          init={init}
        />
      ),
      [Platform.WeCom]: () => (
        <WeComContent
          isResourceAlarm={isResourceAlarm}
          formInstance={form}
          init={init}
        />
      ),
      [Platform.HTTP]: () => (
        <HttpContent
          isResourceAlarm={isResourceAlarm}
          formInstance={form}
          init={init}
        />
      ),
      [Platform.AliyunSms]: () => <AliyunSmsContent formInstance={form} />,
    };
    return map?.[platform]?.();
  }, [form, isResourceAlarm, platform, init]);
  return (
    <>
      <ZSVForm.Card
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
      >
        <Item
          label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "messageTemplate.field.name.tooltip",
                defaultMessage: `### Alarm Message Template

1. A message template specifies the text of a resource alarm message or event alarm message sent to an SNS system.
2. By default, the system provides an alarm message template and a recovery message template. If you did not create one, the default templates will be used.
3. You can create multiple message templates but make only one of them as default. Alarm messages are sent by using the format specified in the default template.`,
              })}
            </ReactMarkdown>
          }
          name={["zwatchSNSTextTemplate", "common", "name"]}
          rules={commonNameRules}
          //
          // tooltip={intl.formatMessage({
          //   id: 'global.field.name.hover',
          //   defaultMessage:
          //     '字数128字以内，仅支持中文汉字、英文字母、数字，以及下列英文符号：（-）、（_）、（.）、（:）'
          // })}
        >
          <Input className={styles["width-400"]} />
        </Item>

        <Item
          label={intl.formatMessage({
            id: "description",
            defaultMessage: "Description",
          })}
          name={["zwatchSNSTextTemplate", "common", "description"]}
          rules={commonDescriptionRules}
        >
          <TextArea
            className={styles["width-400"]}
            rows={4}
            maxLength={256}
            isShowLimit
            limit={256}
          />
        </Item>
      </ZSVForm.Card>

      <ZSVForm.Card
        title={intl.formatMessage({
          id: "template.info",
          defaultMessage: "Template Information",
        })}
      >
        <Item
          label={intl.formatMessage({
            id: "type",
            defaultMessage: "Type",
          })}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {isBasicLicense
                ? intl.formatMessage({
                    id: "messageTemplate.field.type.tooltip.basic",
                    defaultMessage:
                      "### Type\n\nBy using a message template, you can send messages in unified formats to endpoints.\n\n1. To create an Email message template, follow the Text syntax.\n2. To create a HTTP Application message template, follow the JSON syntax.\n3. To create a SMS message template, you need to apply for third-party SMS signatures templates in advance. Currently, you can use Alibaba Cloud SMS service. Any template changes require re-applying through the third-party service.",
                  })
                : intl.formatMessage({
                    id: "messageTemplate.field.type.tooltip.advanced",
                    defaultMessage:
                      "### Type\n\nBy using a message template, you can send messages in unified formats to endpoints.\n\n1. To create an Email or Lark message template, follow the Text syntax.\n2. To create a DingTalk or WeCom message template, follow the Markdown syntax.\n3. To create a HTTP Application message template, follow the JSON syntax.\n4. To create a Microsoft Teams message template, follow the Webhook syntax requirements listed on the Microsoft Teams official website.\n5. To create a SMS message template, you need to apply for third-party SMS signatures templates in advance. Currently, you can use Alibaba Cloud SMS service. Any template changes require re-applying through the third-party service.",
                  })}
            </ReactMarkdown>
          }
        >
          {init ? (
            translateAlarmTypePlatform(
              intl,
              init?.zwatchSNSTextTemplate?.common
                ?.applicationPlatformType as Platform,
            )
          ) : (
            <>
              <Item
                name={[
                  "zwatchSNSTextTemplate",
                  "common",
                  "applicationPlatformType",
                ]}
                noStyle
              >
                <Select
                  defaultValue={platformList?.[0]?.value}
                  style={{ width: "160px" }}
                  onChange={(v) => setPlatform(v)}
                >
                  {platformList.map((it) => (
                    <Select.Option key={it?.value} value={it?.value}>
                      {it?.lable}
                    </Select.Option>
                  ))}
                </Select>
              </Item>
              <Item
                shouldUpdate={(prev, curr) => prev.platform !== curr.platform}
                noStyle
              >
                {() => {
                  let content = "";
                  switch (platform) {
                    case Platform.AliyunSms:
                      content = intl.formatMessage({
                        id: "messageTemplate.field.applicationPlatformTypeAliyunSms.tips",
                        defaultMessage:
                          "1. Apply for and obtain a third-party SMS signature.\n2. Apply for and obtain a third-party SMS template according to the following alarm message text example.",
                      });
                      break;
                    case Platform.DingTalk:
                    case Platform.FeiShu:
                      content = intl.formatMessage({
                        id: "messageTemplate.field.applicationPlatformType.DingTalk.tips",
                        defaultMessage:
                          "If you set Custom Keywords as the robot security setting, make sure alarm messages must contain the keyword \"Alarm\", so to be sent successfully.",
                      });
                      break;
                  }
                  return content ? (
                    <div className={styles.captionSms}>
                      <div className={styles.content}>
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </div>
                    </div>
                  ) : null;
                }}
              </Item>
            </>
          )}
        </Item>
        {platform === Platform.AliyunSms ? (
          <Item
            label={intl.formatMessage({
              id: "signature.name",
              defaultMessage: "Signature",
            })}
            name={["zwatchSNSTextTemplate", "aliyunSms", "sign"]}
            rules={[init ? {} : isRequired()]}
          >
            {init ? (
              init?.zwatchSNSTextTemplate?.aliyunSms?.sign
            ) : (
              <Input className={styles["width-400"]} />
            )}
          </Item>
        ) : null}

        <Item
          shouldUpdate={(prev, curr) => prev.platform !== curr.platform}
          noStyle
        >
          <>
            {platform !== Platform.AliyunSms && (
              <Form.Item
                label={intl.formatMessage({
                  id: "alarmType",
                  defaultMessage: "Alarm Type",
                })}
                name={["zwatchSNSTextTemplate", "common", "type"]}
              >
                {init ? (
                  translateAlarmType(
                    intl,
                    init?.zwatchSNSTextTemplate?.common
                      ?.type as ZwatchSNSTextTemplateAlarmType,
                  )
                ) : (
                  <RadioGroup
                    onValueChange={(v) => {
                      setIsResourceAlarm(
                        (v ?? ZwatchSNSTextTemplateAlarmType.Alarm) ===
                          ZwatchSNSTextTemplateAlarmType.Alarm,
                      );
                    }}
                    options={[
                      {
                        value: ZwatchSNSTextTemplateAlarmType.Alarm,
                        label: intl.formatMessage({
                          id: "resourceAlert",
                          defaultMessage: "Resource Alarm",
                        }),
                      },
                      {
                        value: ZwatchSNSTextTemplateAlarmType.Event,
                        label: intl.formatMessage({
                          id: "eventAlert",
                          defaultMessage: "Event Alarm",
                        }),
                      },
                    ]}
                  />
                )}
              </Form.Item>
            )}
            {platform === Platform.DingTalk ? (
              <div className={styles.caption}>
                <span
                  style={{
                    paddingTop: "4px",
                  }}
                >
                  {intl.formatMessage({
                    id: "messageTemplate.field.applicationPlatformTypeDingtalk.tips",
                    defaultMessage:
                      "To create an alarm message template of the DingTalk type, follow the Markdown syntax. Currently, DingTalk only supports a subset of Markdown syntax.",
                  })}
                </span>
              </div>
            ) : null}
          </>
          {contentEl}
        </Item>
        <Form.Item
          label={intl.formatMessage({
            id: "default.template",
            defaultMessage: "Default Template",
          })}
          style={{ marginBottom: 0 }}
        >
          <div className="flex gap-1">
            <div>
              <Form.Item
                name={["zwatchSNSTextTemplate", "common", "defaultTemplate"]}
                valuePropName="checked"
              >
                <FormCheckbox
                  label={intl.formatMessage({
                    id: "set.as.default.template.info",
                    defaultMessage: "Make Default",
                  })}
                />
              </Form.Item>
            </div>
          </div>
        </Form.Item>
      </ZSVForm.Card>
    </>
  );
};

export default BasicConfig;
