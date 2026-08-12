import { Form, Input } from "@zstack/zsphere-components";
import { ZSVForm, TextArea } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { AccountType, Op } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import { UserSelect } from "zsv_administration_shared/account-information/mf-index";

import RoleSelect from "../../components/role-select";

import styles from "./style.module.less";

const { Card } = ZSVForm;
const { Item } = Form;

interface IBasicConfigProps {
  form: any;
}

const BasicConfig: React.FC<IBasicConfigProps> = ({ form }) => {
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

      {/* 选择用户 */}
      <UserSelect
        form={form}
        defaultQuery={{
          conditions: [
            {
              key: "type",
              op: Op.ne,
              value: AccountType.SystemAdmin,
            },
          ],
        }}
      />

      {/* 选择角色 */}
      <RoleSelect multiple />
    </Card>
  );
};

export default BasicConfig;
