import { Form, Input } from "@zstack/zsphere-components";
import { ZSVForm, TextArea } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import React from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

const { Card } = ZSVForm;
const { Item } = Form;

const BasicConfig: React.FC = () => {
  const intl = useIntl();
  const { commonNameRules, commonDescriptionRules } = useValidator(intl);

  return (
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={commonNameRules}
      >
        <Input className={styles["width-320"]} />
      </Item>

      <Item
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
        name="description"
        rules={commonDescriptionRules}
      >
        <TextArea
          className={styles["width-320"]}
          rows={4}
          maxLength={256}
          isShowLimit
          limit={256}
        />
      </Item>
    </Card>
  );
};

export default BasicConfig;
