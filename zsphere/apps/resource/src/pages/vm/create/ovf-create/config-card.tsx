import { Form } from "@zstack/zsphere-components";
import { ZSVForm } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import HardwareInfo from "./hardware";

import styles from "./style.module.less";

interface IProps {
  form: any;
  visible?: boolean;
}

const { Item } = Form;

const AdvancePart: React.FC<IProps> = ({ form, visible }) => {
  const intl = useIntl();

  return (
    <Item noStyle shouldUpdate={(prev, curr) => prev !== curr}>
      {() => {
        const backupStorage = form.getFieldValue("backupStorage");

        return (
          backupStorage &&
          backupStorage?.length !== 0 && (
            <div className={styles.card}>
              <ZSVForm.Card
                indented={false}
                title={
                  <div>
                    {intl.formatMessage({
                      id: "virtualization.instance.network",
                      defaultMessage: "Virtual Machine Network",
                    })}
                  </div>
                }
                style={{ marginTop: 10 }}
              />
              <HardwareInfo form={form} visible={visible} />
            </div>
          )
        );
      }}
    </Item>
  );
};

export default React.memo(AdvancePart);
