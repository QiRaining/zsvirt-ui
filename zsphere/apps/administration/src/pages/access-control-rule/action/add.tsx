import { gql } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { TextArea, Input, Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { AccessControlRuleType } from "@zstack/zsphere-types";
import type { AccessControlRule as IAccessControlRule } from "@zstack/zsphere-types/graphql";
import { pick } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import { useAccessControlRuleType } from "../hook";
import IpRuleEdit, { InputType } from "./components/ip-rule-edit";

import style from "./style.module.less";

const addAccessControlRule = gql`
  mutation addAccessControlRule($input: AddAccessControlRuleInput!) {
    addAccessControlRule(input: $input) {
      actionId
    }
  }
`;

export interface IProps {}

const Action: React.FC<IActionWrapperProps<IAccessControlRule> & IProps> = ({
  visible,
  setVisible,
  refetch,
}) => {
  const intl = useIntl();
  const { commonDescriptionRules, commonNameRules } = useValidator(intl);
  const [form] = Form.useForm();
  const doAction = useAction();
  const { accessControlRuleTypeList } = useAccessControlRuleType();

  const title = intl.formatMessage({
    id: "virtualization.accessControlRule.action.add.accessControlRule",
    defaultMessage: "Add IP Allowlist/Blocklist",
  });

  const onOk = async (value: any) => {
    doAction({
      mutation: addAccessControlRule,
      payload: {
        ...pick(value, ["name", "description", "controlStrategy"]),
        rule: value.rule.join(","),
      },
      name: title,
      total: 1,
      onFinish: () => {
        refetch?.();
      },
    });
  };

  const handleValuesChange = (changedValues: any, values: any) => {
    if ("inputType" in changedValues) {
      form.setFieldsValue({
        rule: filterRuleList(values.rule),
      });
    }
  };

  return (
    <DialogForm
      className={style.addModal}
      visible={visible}
      onOk={onOk}
      form={form}
      setVisible={setVisible}
      title={title}
    >
      <Form
        form={form}
        onValuesChange={handleValuesChange}
        initialValues={{
          rule: [""],
          inputType: InputType.Individually,
          controlStrategy: AccessControlRuleType.REJECT,
        }}
      >
        <Form.Item
          name="name"
          label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
          rules={commonNameRules}
        >
          <Input className={style["width-320"]} />
        </Form.Item>
        <Form.Item
          name="description"
          rules={commonDescriptionRules}
          label={intl.formatMessage({
            id: "description",
            defaultMessage: "Description",
          })}
        >
          <TextArea
            className={style["width-320"]}
            rows={3}
            isShowLimit
            limit={256}
          />
        </Form.Item>
        <Form.Item
          name="controlStrategy"
          label={intl.formatMessage({
            id: "virtualization.accessControlRule.field.controlStrategy",
            defaultMessage: "Type",
          })}
        >
          <RadioGroup
            options={accessControlRuleTypeList.map((it) => ({
              value: it.value,
              label: it.label,
            }))}
          />
        </Form.Item>
        <IpRuleEdit />
      </Form>
    </DialogForm>
  );
};

export default Action;

export function filterRuleList(rule: Array<string | undefined>) {
  const newRule = rule.filter((item): item is string => !!item?.trim());
  return newRule.length ? newRule : [""];
}
