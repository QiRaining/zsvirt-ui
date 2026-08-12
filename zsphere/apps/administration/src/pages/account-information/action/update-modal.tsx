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
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateAccount } from "../../../gql/account.gql";
import {
  createUpdateAccountSchema,
  type UpdateAccountFormValues,
} from "./schema";

const Action: React.FC<IActionWrapperProps<IAccount>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();

  const doAction = useAction();
  const defaultValues = useMemo<UpdateAccountFormValues>(() => {
    const values: UpdateAccountFormValues = {
      name: "",
      description: "",
    };
    if (selectedList?.length) {
      const { name, description } = selectedList[0];
      values.name = name ?? "";
      values.description = description ?? "";
    }
    return values;
  }, [selectedList]);
  const formSchema = useMemo(() => createUpdateAccountSchema(intl), [intl]);
  const form = useForm<UpdateAccountFormValues>({
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

  const onOk = (values: UpdateAccountFormValues) => {
    if (selectedList?.length) {
      const {
        name: oldName,
        description: oldDescription,
        uuid,
      } = selectedList[0];
      const { name: newName, description: newDescription } = values;
      const params: any = { uuid };
      let isEditor = false;
      if (oldName !== newName) {
        params.name = newName;
        isEditor = true;
      }
      if (oldDescription !== newDescription) {
        params.description = newDescription;
        isEditor = true;
      }
      if (isEditor) {
        doAction({
          mutation: updateAccount,
          payload: {
            ...params,
          },
          name: intl.formatMessage({
            id: "modify.subAccount",
            defaultMessage: "Modify Sub-Account",
          }),
          total: selectedList.length,
          onFinish: () => {
            refetch?.();
          },
          type: "AccountVO",
        });
      }
    }
    setVisible(false);
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "subAccountManagement.modal.title.confirm.edit",
        defaultMessage: "Edit Sub-Account",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
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
            size="m"
            maxLength={256}
            showCount
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
