import { Button } from "@zstack/design";
import { useCommonPaswordValidator } from "@zstack/virtualization-resource/src/pages/vm/utils";
import { Switch, Form, Input, Select } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { randomWord } from "@zstack/zsphere-utils";
import { useControllableValue } from "ahooks";
import type { PasswordProps } from "antd/lib/input";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  useConsolePasswordValidator,
  useQueryConsolePasswordGlobalConfig,
} from "./hooks";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
}

const { Item } = Form;

const PASSWORD_INPUT_WIDTH_240_STYLE = { width: 240 } as const;

interface IRandomPasswordProps extends PasswordProps {
  randomConfig?: IRandomWordParams;
}
export interface IRandomWordParams {
  randomFlag: boolean;
  min: number;
  max: number;
  isWindow: boolean;
}

export const RandomPassword: React.FC<IRandomPasswordProps> = ({
  randomConfig,
  ...props
}) => {
  const intl = useIntl();

  const [, onChange] = useControllableValue(props);

  return (
    <div className={styles.randomPassword}>
      <Input.Password
        style={PASSWORD_INPUT_WIDTH_240_STYLE}
        autoComplete="new-password"
        {...props}
      />
      <Button
        onClick={() => randomConfig && onChange?.(randomWord(randomConfig))}
        className={styles.button}
      >
        {intl.formatMessage({
          id: "randomGenerator",
          defaultMessage: "Generate",
        })}
      </Button>
    </div>
  );
};

const RemoteAccess: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const { validator: commonValidator } = useCommonPaswordValidator();
  const passwordGlobalConfig = useQueryConsolePasswordGlobalConfig();

  const { validator: consolePasswordValidator, randomConfig } =
    useConsolePasswordValidator(passwordGlobalConfig);

  useEffect(() => {
    form.setFieldsValue({
      consoleMode: "vnc",
    });
  }, []);

  useEffect(() => {
    if (passwordGlobalConfig?.enabled) {
      form.validateFields(["consolePassword"]);
    }
  }, [passwordGlobalConfig?.enabled]);

  return (
    <div className={styles.content}>
      <Item
        label={intl.formatMessage({
          id: "consoleMode",
          defaultMessage: "Console Mode",
        })}
        labelWidth={160}
        name="consoleMode"
      >
        <Select width="s">
          <Select.Option value="vnc">vnc</Select.Option>
          <Select.Option value="spice">spice</Select.Option>
          <Select.Option value="vncAndSpice">vnc + spice</Select.Option>
        </Select>
      </Item>
      <Item
        label={intl.formatMessage({
          id: "consolePassword",
          defaultMessage: "Console Password",
        })}
        labelWidth={160}
        name="consolePassword"
        validateFirst
        required={!!passwordGlobalConfig?.enabled}
        rules={
          passwordGlobalConfig?.enabled
            ? [
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "zsv.create.instance.consolePassword.required",
                    defaultMessage: "This field is required.",
                  }),
                },
                {
                  validator: (_, value) =>
                    commonValidator(
                      value,
                      passwordGlobalConfig.minimum,
                      passwordGlobalConfig.maximum,
                    ),
                },
                {
                  validator: (_, value) => consolePasswordValidator(value),
                },
              ]
            : [
                {
                  validator: (_, value) => commonValidator(value),
                },
              ]
        }
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.create.instance.consolePassword.tooltip",
              defaultMessage:
                "### Console Password\n\nSet the console password as needed. You can specify whether to enforce setting a console password and password strength through VNC Console Password in the security settings. If enabled, you need to set the console password according to the specified strength requirements when creating a virtual machine.",
            })}
          </ReactMarkdown>
        }
      >
        <RandomPassword randomConfig={randomConfig} />
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          return pre.consoleMode !== cur.consoleMode;
        }}
      >
        {() => {
          const flag = form.getFieldValue("consoleMode") !== "vnc";
          return (
            flag && (
              <>
                <Item
                  name="vdiMonitorNumber"
                  label={intl.formatMessage({
                    id: "virtualization.vdiMonitorNumber",
                    defaultMessage: "VDI Screen Count",
                  })}
                >
                  {/* <InputNumber /> */}
                  <Select width="s">
                    <Select.Option value="1">1</Select.Option>
                    <Select.Option value="2">2</Select.Option>
                    <Select.Option value="4">4</Select.Option>
                  </Select>
                </Item>
                <Item
                  name="spiceStreamingMode"
                  label="Spice Streaming"
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "zsv.create.instance.spiceStreamingMode.tooltip",
                        defaultMessage: `### Spice Streaming\\n         \\nDefault is off and supports off, filter, and all three modes.\\n   * all: Indicates that encoding compression is applied to all video frames transmitted. Bandwidth requirements will decrease, smoothness will increase, and client-side CPU pressure will increase.\\n   * filter: Indicates that incremental encoding compression is applied to video frames transmitted. Bandwidth requirements will be lower, smoothness will be higher, and client-side CPU pressure will be relatively low, but there may be a slight delay in Chrome playback on the client side.\\n* off: Indicates that no encoding compression is applied to video frames, with the highest clarity, highest bandwidth requirements, and minimum client-side CPU pressure.\\n\\nSpice Streaming supports System Parameter for all platforms. Effective priority: Virtual machine granularity > Global granularity.`,
                      })}
                    </ReactMarkdown>
                  }
                >
                  <Select width="s">
                    <Select.Option value="off">off</Select.Option>
                    <Select.Option value="filter">filter</Select.Option>
                    <Select.Option value="all">all</Select.Option>
                  </Select>
                </Item>
              </>
            )
          );
        }}
      </Item>
      <Item
        name="usbRedirect"
        label={intl.formatMessage({
          id: "virtualization.create.advanced.config.spice.usbRedirect",
          defaultMessage: "USB Redirection",
        })}
        valuePropName="checked"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.create.instance.usbRedirect.tooltip",
              defaultMessage: `### USB Redirection

Redirect a USB device on a VDI client to a virtual machine.`,
            })}
          </ReactMarkdown>
        }
      >
        <Switch />
      </Item>
    </div>
  );
};

export default React.memo(RemoteAccess);
