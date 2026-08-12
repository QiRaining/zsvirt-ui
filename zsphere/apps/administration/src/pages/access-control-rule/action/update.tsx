import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { AccessControlRule as IAccessControlRule } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateAccessControlRuleSchema,
  type UpdateAccessControlRuleFormValues,
} from "./schema";

import style from "./style.module.less";

const updateAccessControlRule = gql`
  mutation updateAccessControlRule($input: UpdateAccessControlRuleInput!) {
    updateAccessControlRule(input: $input) {
      actionId
    }
  }
`;

export interface IProps {
  title?: string;
}

const Action: React.FC<IActionWrapperProps<IAccessControlRule> & IProps> = ({
  title: _title,
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();

  const title =
    _title ??
    intl.formatMessage({
      id: "virtualization.accessControlRule.action.update",
      defaultMessage: "Edit Name and Description",
    });

  const initialValues = useMemo<UpdateAccessControlRuleFormValues>(() => {
    const { name, description } = selectedList[0] ?? {};
    return {
      name: name ?? "",
      description: description ?? "",
    };
  }, [selectedList]);
  const formSchema = useMemo(
    () => createUpdateAccessControlRuleSchema(intl),
    [intl],
  );
  const form = useForm<UpdateAccessControlRuleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, initialValues);

  useEffect(() => {
    if (visible) {
      form.reset(initialValues);
    }
  }, [visible, form, initialValues]);

  const doAction = useAction();
  const onOk = (values: UpdateAccessControlRuleFormValues) => {
    setVisible(false);
    doAction({
      mutation: updateAccessControlRule,
      payload: {
        ...values,
        uuid: selectedList?.[0]?.uuid,
      },
      name: title,
      total: 1,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={title}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            required
            className={style["width-320"]}
          />
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "description",
              defaultMessage: "Description",
            })}
            className={style["width-320"]}
            rows={3}
            maxLength={256}
            showCount
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
