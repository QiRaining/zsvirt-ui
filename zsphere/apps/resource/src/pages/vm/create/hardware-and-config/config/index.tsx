import { Form } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { Tabs } from "antd";
import cls from "classnames";
import React, { useState, useContext } from "react";
import { useIntl } from "react-intl";

import { CreateInstanceContext } from "../../context";
import BootOptions from "./boot-options";
import GeneralConfig from "./general-config";
import GuestTools from "./guest-tool";
import LoginAccess from "./login-access";
import OtherConfig from "./other";
import RemoteAccess from "./remote-access";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
}

export interface IConfigItem {
  title: string;
}

export const fieldsNeedsValidateInConfig = [
  "rootPassword",
  "sshkey",
  "bootMode",
  "consolePassword",
  "spiceStreamingMode",
];

//const notValidatefields = [...fieldsNeedsValidateInBasic, ...fieldsNeedsValidateInConfig]

const AdvanceConfig: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();

  const { realSource: source } = useContext(CreateInstanceContext);

  const configItems = [
    {
      label: intl.formatMessage({
        id: "virtualization.create.instance.advance.config.general.config",
        defaultMessage: "General Options",
      }),
      children: <GeneralConfig form={form} source={source} />,
      key: "1",
      closable: false,
    },
    {
      label: (
        <Form.Item noStyle shouldUpdate>
          {({ getFieldError }: any) => {
            const error = getFieldError("consolePassword");
            return (
              <div
                className={cls(styles.tabLabel, {
                  [styles.tabLabelError]: !!error?.length,
                })}
              >
                {intl.formatMessage({
                  id: "virtualization.create.instance.advance.config.remote.access",
                  defaultMessage: "Remote Access",
                })}
              </div>
            );
          }}
        </Form.Item>
      ),
      children: <RemoteAccess form={form} />,
      key: "2",
      closable: false,
    },
    {
      label: intl.formatMessage({
        id: "virtualization.create.instance.advance.config.login",
        defaultMessage: "Login Authentication",
      }),
      children: <LoginAccess form={form} />,
      key: "7",
      closable: false,
    },
    {
      label: intl.formatMessage({
        id: "virtualization.create.instance.advance.config.vm.tools",
        defaultMessage: "VMtools",
      }),

      children: <GuestTools form={form} />,
      key: "3",
      closable: false,
    },
    {
      label: intl.formatMessage({
        id: "virtualization.create.instance.advance.config.boot.options",
        defaultMessage: "Boot Options",
      }),

      children: <BootOptions form={form} source={source} />,
      key: "4",
      closable: false,
    },
    {
      label: intl.formatMessage({
        id: "virtualization.create.instance.advance.config.other",
        defaultMessage: "Other Options",
      }),
      children: <OtherConfig form={form} source={source} />,
      key: "5",
      closable: false,
    },
  ];

  const [activeKey, setActiveKey] = useState(configItems[0].key);

  const onChange = async (newActiveKey: string) => {
    await form
      .validateFields(fieldsNeedsValidateInConfig)
      .finally(() => {
        setActiveKey(newActiveKey);
      })
      .catch((errorInfo: any) => {
        return errorInfo;
      });
  };

  return (
    <div className={styles.content}>
      <Tabs
        hideAdd
        onChange={onChange}
        activeKey={activeKey}
        className={styles.tab}
        tabPosition="left"
        items={configItems.map((t: any) => ({
          label: t.label,
          key: t.key,
          forceRender: true,
          children: (
            <div className={styles["tabPane-config"]}>{t.children}</div>
          ),
        }))}
      />
    </div>
  );
};

export default React.memo(AdvanceConfig);
