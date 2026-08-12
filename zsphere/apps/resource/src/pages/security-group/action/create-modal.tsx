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
import type {
  SecurityGroup as ISecurityGroup,
  CreateSecurityGroupPayload as ICreateSecurityGroupPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createSecurityGroupSchema,
  type SecurityGroupFormValues,
} from "./schema";

import style from "./style.module.less";

const initialValues = {
  name: "",
  description: "",
};

const CreateAction: React.FC<IActionWrapperProps<ISecurityGroup>> = ({
  refetch,
  visible,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<SecurityGroupFormValues>(
    () => initialValues,
    [],
  );
  const formSchema = useMemo(() => createSecurityGroupSchema(intl), [intl]);
  const form = useForm<SecurityGroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const createSecurityGroup = gql`
    mutation createSecurityGroup($input: CreateSecurityGroupInput!) {
      createSecurityGroup(input: $input) {
        actionId
      }
    }
  `;
  const onOk = async (values: SecurityGroupFormValues) => {
    const payload: ICreateSecurityGroupPayload = { ...values };
    doAction({
      mutation: createSecurityGroup,
      payload,
      name: intl.formatMessage({
        id: "virtualization.create.securityGroup",
        defaultMessage: "Create Security Group",
      }),
      total: 1,
      type: "SecurityGroup",
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };
  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "virtualization.create.securityGroup",
        defaultMessage: "Create Security Group",
      })}
      form={dialogForm}
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({
              id: "name",
              defaultMessage: "Name",
            })}
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
            rows={3}
            className={style["width-320"]}
            maxLength={2000}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default CreateAction;
