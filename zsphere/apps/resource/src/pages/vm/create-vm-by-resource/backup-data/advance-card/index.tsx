import { Icon } from "@zstack/icon";
import { Form } from "@zstack/zsphere-components";
import { Tabs } from "antd";
import _ from "lodash-es";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import { fieldsNeedsValidateInBasic } from "../basic-card";
import HardwareInfo from "./hardware";

import styles from "./style.module.less";

// Style constants
const FLEX_SPACE_BETWEEN_STYLE = {
  display: "flex",
  justifyContent: "space-between",
} as const;

interface IProps {
  form: any;
  visible?: boolean;
}

const { Item } = Form;

const notValidatefields = [...fieldsNeedsValidateInBasic];

const AlertIcon: React.FC<IAlertProps> = ({ form }) => {
  const [visible, setVisible] = useState(true);

  const formForValidate = _.cloneDeep(form);

  useEffect(() => {
    const getData = async () => {
      //异步校验可能会一直触发，这里的校验先把特殊的给过滤掉，比如：网卡-IP地址

      const formFields = Object.keys(form.getFieldsValue());

      const fieldsNeedsValidate = formFields.filter(
        (t) => !t.match(/^ipv(4|6)-/) && !_.includes(notValidatefields, t),
      );

      await form
        .validateFields(fieldsNeedsValidate)
        .then(() => {
          setVisible(false);
        })
        .catch((errorInfo: any) => {
          const visibleFlag =
            errorInfo.errorFields.filter(
              (t: any) => !_.includes(notValidatefields, t.name?.[0]),
            )?.length !== 0;

          setVisible(visibleFlag);
        });
    };
    getData();
  }, [formForValidate]);

  return (
    <Icon
      color="danger"
      colorNumber={500}
      type="alert-triangle-fill"
      size={18}
      style={{ display: visible ? "block" : "none" }}
    />
  );
};

const AdvancePart: React.FC<IProps> = ({ form, visible }) => {
  const intl = useIntl();

  return (
    <Item noStyle shouldUpdate={(prev, curr) => prev !== curr}>
      {() => {
        return (
          <div className={styles.card}>
            <Tabs className={styles.tab}>
              <Tabs.TabPane
                forceRender
                key="hardware"
                tab={
                  <div style={FLEX_SPACE_BETWEEN_STYLE}>
                    <div className={styles.rect} />
                    <div className={styles.text}>
                      {intl.formatMessage({
                        id: "virtualization.hardware.info",
                        defaultMessage: "Hardware Info",
                      })}
                    </div>
                    <div className={styles.icon}>
                      <AlertIcon form={form} />
                    </div>
                  </div>
                }
              >
                <HardwareInfo form={form} visible={visible} />
              </Tabs.TabPane>
            </Tabs>
          </div>
        );
      }}
    </Item>
  );
};

export default React.memo(AdvancePart);
