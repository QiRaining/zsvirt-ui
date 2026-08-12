import { ModalSelect, Form } from "@zstack/zsphere-components";
import type { IQuery } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

import UserList from "../../account/account-plain/account-plain-list";

import style from "./style.module.less";

export interface ISelectUserProps {
  label?: string;
  defaultQuery?: IQuery;
  form?: any;
  rules?: any[];
}

const SelectUser: React.FC<ISelectUserProps> = ({
  defaultQuery,
  label,
  rules,
}) => {
  const intl = useIntl();

  return (
    <Form.Item
      name="userList"
      rules={rules}
      label={
        label ??
        intl.formatMessage({
          id: "user",
          defaultMessage: "User",
        })
      }
    >
      <ModalSelect
        listClassName={style.list}
        needRemoveSelected={false}
        selectType="checkbox"
        title={intl.formatMessage({
          id: "select.user",
          defaultMessage: "Select User",
        })}
        label={intl.formatMessage({
          id: "add.user",
          defaultMessage: "Add User",
        })}
      >
        <UserList view="select" defaultQuery={defaultQuery} />
      </ModalSelect>
    </Form.Item>
  );
};

export default SelectUser;
