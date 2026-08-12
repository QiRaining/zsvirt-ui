import { CreateInstanceContext } from "@zstack/virtualization-resource/src/pages/vm/create/context";
import type { FormCreateType } from "@zstack/zsphere-types";
import { Tabs } from "antd";
import React, { useContext, useState } from "react";
import { useIntl } from "react-intl";

import GeneralConfig from "./general-config";

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
  "vmSpecPreset",
  "vmSpecManualConfig",
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
  ];

  const [activeKey, setActiveKey] = useState(configItems[0].key);

  const onChange = async (newActiveKey: string) => {
    await form
      .validateFields(fieldsNeedsValidateInConfig)
      .then(() => {
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
      >
        {configItems.map((t) => (
          <Tabs.TabPane
            forceRender
            className={styles["tabPane-config"]}
            tab={t.label}
            key={t.key}
          >
            {t.children}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default React.memo(AdvanceConfig);
