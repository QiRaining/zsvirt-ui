import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputPasswordField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import sha512 from "crypto-js/sha512";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateAccount } from "../../../../gql/account.gql";
import {
  createModifyAccountPasswordSchema,
  type ModifyAccountPasswordFormValues,
} from "./schema";
import useGlobalConfigValidatePassword from "./useGlobalConfigValidatePassword";

const defaultValues: ModifyAccountPasswordFormValues = {
  password: "",
  confirm: "",
};

const Action: React.FC<IActionWrapperProps<IAccount>> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const globalConfigValidatePassword = useGlobalConfigValidatePassword();

  const formSchema = useMemo(
    () => createModifyAccountPasswordSchema(intl, globalConfigValidatePassword),
    [intl, globalConfigValidatePassword],
  );
  const form = useForm<ModifyAccountPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [visible, form]);

  const onOk = async (values: ModifyAccountPasswordFormValues) => {
    if (selectedList?.length) {
      const payload = {
        password: sha512(values?.password).toString(),
        uuid: selectedList[0].uuid,
      };
      doAction({
        mutation: updateAccount,
        payload,
        name: intl.formatMessage({
          id: "modify.subAccountPassword",
          defaultMessage: "Modify Sub-Account Password",
        }),
        total: selectedList.length,
        onFinish: () => {
          refetch?.();
          setSelectedList?.([]);
        },
        type: "AccountVO",
      });
    }
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "subAccountManagement.modal.title.confirm.modify.subAccountPassword",
        defaultMessage: "Change Password",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={selectedList?.[0]?.name}
    >
      <Form {...form}>
        <FieldStack>
          <InputPasswordField
            form={form}
            name="password"
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
            required
            size="m"
          />

          <InputPasswordField
            form={form}
            name="confirm"
            label={intl.formatMessage({
              id: "confirmPassword",
              defaultMessage: "Confirm Password",
            })}
            required
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
