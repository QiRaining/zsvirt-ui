import { TextArea, Form, Input } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { FormItemProps } from "antd/es/form";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

export interface IProps {
  nameRules?: FormItemProps["rules"];
}

const BasicInfo: React.FC<IProps> = ({ nameRules = [] }) => {
  const intl = useIntl();
  const { commonNameRules, longDescriptionRules } = useValidator(intl);

  return (
    <>
      <Form.Item
        name="name"
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        rules={[...commonNameRules, ...nameRules]}
      >
        <Input className={style["width-400"]} />
      </Form.Item>
      <Form.Item
        name="description"
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
        rules={longDescriptionRules}
      >
        <TextArea
          isShowLimit
          rows={3}
          className={style["width-400"]}
          maxLength={2000}
          limit={2000}
        />
      </Form.Item>
    </>
  );
};

export default BasicInfo;
