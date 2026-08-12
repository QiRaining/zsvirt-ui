import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormItem, FormLabel } from "@zstack/design";
import {
  InputField,
  InputPasswordField,
  RadioGroupField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import {
  useCommonPaswordValidator,
  useQueryGlobalConfigPasword,
  useGlobalConfigPaswordValidator,
} from "@zstack/virtualization-resource/src/pages/vm/utils";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  ChangeVmPasswordPayload as IChangeVmPasswordPayload,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createChangeVmPasswordSchema,
  type ChangeVmPasswordFormValues,
} from "./schema";

const ChangeVmPasswordAction: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const changeVmPassword = gql`
    mutation changeVmPassword($input: ChangeVmPasswordInput!) {
      changeVmPassword(input: $input) {
        actionId
      }
    }
  `;

  const { validator } = useCommonPaswordValidator();
  const { sshPassword } = useQueryGlobalConfigPasword();
  const vm = selectedList[0];
  const defaultAccountName =
    vm.platform === "Windows" ? "Administrator" : "root";
  const isWindow = vm.platform
    ? ["Windows", "WindowsVirtio"].includes(vm.platform)
    : false;
  const { validator: globalValidator } = useGlobalConfigPaswordValidator({
    isWindow,
    passwordGlobalConfig: sshPassword!,
  });
  const defaultValues = useMemo<ChangeVmPasswordFormValues>(
    () => ({
      account: defaultAccountName,
      password: "",
      confirmPassword: "",
      accountNameMethods: "system",
    }),
    [defaultAccountName],
  );
  const formSchema = useMemo(
    () =>
      createChangeVmPasswordSchema(
        intl,
        async (value) => {
          await validator(value);
        },
        sshPassword?.enabled
          ? async (value) => {
              await globalValidator(value);
            }
          : undefined,
      ),
    [intl, validator, globalValidator, sshPassword?.enabled],
  );
  const form = useForm<ChangeVmPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const accountNameMethods = useWatch({
    control: form.control,
    name: "accountNameMethods",
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (accountNameMethods === "system") {
      form.setValue("account", defaultAccountName, { shouldValidate: true });
      return;
    }

    if (form.getValues("account") === defaultAccountName) {
      form.setValue("account", "", { shouldValidate: true });
    }
  }, [accountNameMethods, defaultAccountName, form, visible]);

  const onOk = async (values: ChangeVmPasswordFormValues) => {
    const payload: IChangeVmPasswordPayload = {
      account: values.account,
      password: values.password,
      uuid: selectedList ? selectedList[0].uuid : "",
    };

    doAction({
      mutation: changeVmPassword,
      payload,
      name: intl.formatMessage({
        id: "virtualization.change.vmPassword",
        defaultMessage: "Change VM Password",
      }),
      total: 1,
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  const onCancel = () => {
    setVisible(false);
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "virtualization.change.vmPassword",
        defaultMessage: "Change VM Password",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      onCancel={onCancel}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <FieldStack>
          <RadioGroupField
            form={form}
            name="accountNameMethods"
            label={intl.formatMessage({
              id: "login.username.methods",
              defaultMessage: "Login Name Selection Method",
            })}
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "virtualization.field.accountNameMethods.tooltip",
                  defaultMessage: `Login Name Selection Method`,
                })}
              </ReactMarkdown>
            }
            options={[
              {
                value: "system",
                label: intl.formatMessage({
                  id: "system.default",
                  defaultMessage: "System Default",
                }),
              },
              {
                value: "custom",
                label: intl.formatMessage({
                  id: "custom.login.name",
                  defaultMessage: "Specify login name.",
                }),
              },
            ]}
          />
          {accountNameMethods === "system" ? (
            <FormItem className="flex min-h-8 flex-row items-center gap-2">
              <FormLabel className="flex h-8">
                {intl.formatMessage({
                  id: "login.name",
                  defaultMessage: "Username",
                })}
              </FormLabel>
              <div className="flex min-h-8 items-center">
                {defaultAccountName}
              </div>
            </FormItem>
          ) : (
            <InputField
              form={form}
              name="account"
              label={intl.formatMessage({
                id: "login.name",
                defaultMessage: "Username",
              })}
              required
              maxLength={255}
              size="m"
            />
          )}
          <InputPasswordField
            form={form}
            name="password"
            label={intl.formatMessage({
              id: "new.password",
              defaultMessage: "New Password",
            })}
            required
            maxLength={255}
            size="m"
          />
          <InputPasswordField
            form={form}
            name="confirmPassword"
            label={intl.formatMessage({
              id: "confirm.password",
              defaultMessage: "Confirm Password",
            })}
            required
            maxLength={255}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default ChangeVmPasswordAction;
