import { RadioGroup } from "@zstack/design";
import { Form, Input } from "@zstack/zsphere-components";
import type { EndPointType } from "@zstack/zsphere-types";
import type { FormInstance } from "antd";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

type PropsType = {
  form: FormInstance;
  type: EndPointType;
  actionType?: "add" | "update";
};

export type SecuritySettingType = "none" | "signature";

const { Item } = Form;

export const SecuritySettingItem = ({
  type: endpointType,
  form,
  actionType = "add",
}: PropsType) => {
  const intl = useIntl();
  const parentFieldName = `${actionType}${endpointType}`;
  const [selectedSecuritySetting, setSselectedSecuritySetting] =
    React.useState<SecuritySettingType>(
      form.getFieldValue(parentFieldName)?.securitySetting || "signature",
    );

  const handleChange = (value: SecuritySettingType) => {
    setSselectedSecuritySetting(value);
  };

  return (
    <>
      <Item
        name={[parentFieldName, "securitySetting"]}
        label={intl.formatMessage({
          id: "securitySetting",
          defaultMessage: "Security Setting",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zwatch.endpoint.securitySetting.tooltip",
              defaultMessage: `### Security Setting

Select the security settings that you set for the robot on the 3rd-party platform.

- Signature: Paste the signature key below to ensure that third-party applications receive alarm messages correctly.
- Other: Set a security policy other than Signature for the robot on the 3rd-party platform, choose this option.
    - Custom Keywords: Alarm messages must contain at least one custom keyword to be sent successfully. If you choose this method, make sure you add "Alarm" as the keyword. Otherwise, alarm messages will fail to send.
    - IP Address:  Only requests from within the specified IP address range will be processed by third-party applications. If you choose this method, add the management node IP address and VIP of the platform to the bot's IP allowlist to ensure that third-party applications receive alert messages correctly.`,
            })}
          </ReactMarkdown>
        }
        description={
          <Item
            noStyle
            shouldUpdate={(prev, curr) =>
              prev[parentFieldName]?.securitySetting !==
              curr[parentFieldName]?.securitySetting
            }
          >
            {({ getFieldValue }) => {
              const securitySetting = getFieldValue([
                parentFieldName,
                "securitySetting",
              ]);
              return securitySetting === "none" ? (
                <div style={{ margin: "-4px 0 8px" }}>
                  {intl.formatMessage({
                    id: "zwatch.endpoint.securitySetting.other.description",
                    defaultMessage:
                      "If Custom Keywords is your robot security setting, make sure you add \"Alarm\" as the keyword. Otherwise, alarm messages will fail to send.",
                  })}
                </div>
              ) : null;
            }}
          </Item>
        }
      >
        <RadioGroup
          defaultValue="signature"
          onValueChange={(value) => {
            handleChange(value as SecuritySettingType);
          }}
          options={[
            {
              value: "signature",
              label: intl.formatMessage({
                id: "securitySetting.signature",
                defaultMessage: "Signature",
              }),
            },
            {
              value: "none",
              label: intl.formatMessage({
                id: "securitySetting.other",
                defaultMessage: "Other",
              }),
            },
          ]}
        />
      </Item>
      {selectedSecuritySetting === "signature" && (
        <Item
          required
          name={[parentFieldName, "secret"]}
          label={intl.formatMessage({
            id: "common.secret",
            defaultMessage: "Key",
          })}
          rules={[
            {
              validator(__, value: string) {
                if (!value) {
                  return Promise.reject(
                    intl.formatMessage({
                      id: "zwatchEndpoint.field.secret.validator.required",
                      defaultMessage: "Please fill out the key.",
                    }),
                  );
                }
                if (/[\u4e00-\u9fa5]/.test(value)) {
                  return Promise.reject(
                    intl.formatMessage({
                      id: "unSupport.chinese",
                      defaultMessage: "Not supported",
                    }),
                  );
                }

                if (/^[^\u4e00-\u9fa5]{1,128}$/.test(value)) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  intl.formatMessage({
                    id: "zwatchEndpoint.field.secret.validator.invalid",
                    defaultMessage: "The Secret must be 1-128 characters in length.",
                  }),
                );
              },
            },
          ]}
        >
          <Input.Password className={style["width-400"]} />
        </Item>
      )}
    </>
  );
};
