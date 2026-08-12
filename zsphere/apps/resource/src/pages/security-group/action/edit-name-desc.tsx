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
import type { SecurityGroup } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createSecurityGroupSchema,
  type SecurityGroupFormValues,
} from "./schema";

const updateSecurityGroup = gql`
  mutation updateSecurityGroup($input: UpdateSecurityGroupInput!) {
    updateSecurityGroup(input: $input) {
      actionId
    }
  }
`;
const UpdateModal: React.FC<IActionWrapperProps<SecurityGroup>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<SecurityGroupFormValues>(() => {
    const { name, description } = selectedList?.[0] ?? {};
    return {
      name: name ?? "",
      description: description ?? "",
    };
  }, [selectedList]);
  const formSchema = useMemo(() => createSecurityGroupSchema(intl), [intl]);
  const form = useForm<SecurityGroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: SecurityGroupFormValues) => {
    doAction({
      mutation: updateSecurityGroup,
      payload: {
        ...values,
        uuid: selectedList?.[0]?.uuid,
      },
      name: intl.formatMessage({
        id: "edit.nameAndDescription",
        defaultMessage: "Edit Name and Description",
      }),
      total: 1,
      onFinish: () => {
        setVisible(false);
      },
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "edit.nameAndDescription",
        defaultMessage: "Edit Name and Description",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
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
            size="m"
          />
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "introduction",
              defaultMessage: "Description",
            })}
            rows={3}
            limit={2000}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default UpdateModal;
