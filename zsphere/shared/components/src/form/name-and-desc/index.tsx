import { useValidator } from "@zstack/hooks";
import cls from "classnames";
import React from "react";
import { useIntl } from "react-intl";

import Form from "../../a-cloud-old-components/form";
import Input from "../../input";
import TextArea from "../../textarea";
import type { INameAndDescProps } from "./type";

const { Item } = Form;
const NameAndDesc: React.FC<INameAndDescProps> = ({
  nameRules = [],
  className,
}) => {
  const intl = useIntl() as any;
  const { commonNameRules, commonDescriptionRules } = useValidator(intl);

  return (
    <>
      <Item
        className={className}
        shouldUpdate={true}
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={[...commonNameRules, ...nameRules] as any}
      >
        <Input className={cls("width-320", className)} />
      </Item>
      <Item
        className={className}
        name="description"
        rules={commonDescriptionRules as any}
        label={intl.formatMessage({
          id: "introduction",
          defaultMessage: "Description",
        })}
      >
        <TextArea
          className={cls("width-320", className)}
          limit={256}
          isShowLimit
        />
      </Item>
    </>
  );
};

export default NameAndDesc;
