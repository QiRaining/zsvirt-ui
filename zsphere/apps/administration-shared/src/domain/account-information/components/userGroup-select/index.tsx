import { ModalSelect, Form } from "@zstack/zsphere-components";
import type { IQuery } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import UserGroupList from "../../user-group/user-group-plain/user-group-plain-list";

import style from "./style.module.less";

export interface ISelectUserGroupProps {
  label?: string;
  tooltip?: any;
  defaultQuery?: IQuery;
  form?: any;
  rules?: any[];
}

const SelectUserGroup: React.FC<ISelectUserGroupProps> = ({
  label,
  tooltip,
  defaultQuery,
  rules,
}) => {
  const intl = useIntl();

  return (
    <Form.Item
      name="userGroupList"
      rules={rules}
      label={
        label ??
        intl.formatMessage({
          id: "userGroup",
          defaultMessage: "User Group",
        })
      }
      icon={tooltip ? "info" : undefined}
      iconTooltip={<ReactMarkdown>{tooltip}</ReactMarkdown>}
    >
      <ModalSelect
        listClassName={style.list}
        needRemoveSelected={false}
        selectType="checkbox"
        title={intl.formatMessage({
          id: "select.user.group",
          defaultMessage: "Select User Group",
        })}
        label={intl.formatMessage({
          id: "add.userGroup",
          defaultMessage: "Add User Group",
        })}
      >
        <UserGroupList view="select" defaultQuery={defaultQuery} />
      </ModalSelect>
    </Form.Item>
  );
};

export default SelectUserGroup;
