import { gql } from "@apollo/client";
import { Input } from "@zstack/design";
import { TextArea, Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { AccessControlRule as IAccessControlRule } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import { useAccessControlRuleType } from "../hook";
import { filterRuleList } from "./add";
import IpRuleEdit, { InputType } from "./components/ip-rule-edit";

import style from "./style.module.less";

const updateAccessControlRule = gql`
  mutation updateAccessControlRule($input: UpdateAccessControlRuleInput!) {
    updateAccessControlRule(input: $input) {
      actionId
    }
  }
`;

export interface IProps {}

const Action: React.FC<IActionWrapperProps<IAccessControlRule> & IProps> = ({
  visible,
  setVisible,
  refetch,
  selectedList,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const title = intl.formatMessage({
    id: "virtualization.accessControlRule.action.modify.accessControlRule",
    defaultMessage: "Modify Configuration",
  });

  const { commonDescriptionRules, commonNameRules } = useValidator(intl);

  const { accessControlRuleTypeMap } = useAccessControlRuleType();

  const current = useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const initialValues = useMemo<any>(
    () => ({
      name: current?.name,
      description: current?.description,
      controlStrategy: current?.strategy,
      rule: current?.rule?.split(","),
      inputType: InputType.Individually,
    }),
    [current],
  );

  useEffect(() => {
    if (visible) {
      form.setFields(
        _.keys(initialValues).map((key) => ({
          name: key,
          value: initialValues[key],
        })),
      );
    }
  }, [initialValues, visible]);

  const onOk = async (value: any) => {
    doAction({
      mutation: updateAccessControlRule,
      payload: {
        ..._.pick(value, ["name", "description"]),
        rule: value.rule.join(","),
        uuid: current?.uuid,
      },
      type: "AccessControlRule",
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
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form form={form} onValuesChange={handleValuesChange}>
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
          label={intl.formatMessage({
            id: "virtualization.accessControlRule.field.controlStrategy",
            defaultMessage: "Type",
          })}
        >
          <Form.Item noStyle>
            {accessControlRuleTypeMap.get(current.strategy)}
          </Form.Item>
        </Form.Item>
        <IpRuleEdit />
      </Form>
    </DialogForm>
  );
};

export default Action;
