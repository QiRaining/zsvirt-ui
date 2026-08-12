import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormItem, FormLabel, Text } from "@zstack/design";
import { InputNumberField, FieldStack } from "@zstack/form";
import {
  InputField,
  InputPasswordField,
  SwitchField,
  TextareaField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateKmsProviderSchema,
  type UpdateKmsProviderValues,
} from "./schema";

const updateKmsProvider = gql`
  mutation updateKmsProvider($input: UpdateKmsProviderInput!) {
    updateKmsProvider(input: $input) {
      actionId
    }
  }
`;

const Update: React.FC<IActionWrapperProps<Item>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const current = selectedList?.[0];

  const defaultValues = useMemo<UpdateKmsProviderValues>(
    () => ({
      description: current?.description || "",
      endpoint: current?.endpoint || "",
      port: current?.port ?? "",
      passwordProtected: !!current?.username,
      username: current?.username || "",
      password: "",
    }),
    [current],
  );
  const formSchema = useMemo(
    () => createUpdateKmsProviderSchema(intl, current?.type),
    [current?.type, intl],
  );
  const form = useForm<UpdateKmsProviderValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const passwordProtected = form.watch("passwordProtected");

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = (values: UpdateKmsProviderValues) => {
    if (!current?.uuid) {
      return;
    }

    const payload: {
      uuid: string;
      updateKmsParam?: {
        description?: string;
        endpoint?: string;
        port?: string | number;
        username?: string;
        password?: string;
      };
      updateNkpParam?: {
        description?: string;
      };
    } = {
      uuid: current.uuid,
    };

    if (current.type === "KMS") {
      payload.updateKmsParam = {
        description: values.description,
        endpoint: values.endpoint,
        port: values.port,
      };
      if (values.passwordProtected) {
        payload.updateKmsParam.username = values.username?.trim();
        if (values.password) {
          payload.updateKmsParam.password = values.password.trim();
        }
      }
    } else {
      payload.updateNkpParam = {
        description: values.description,
      };
    }

    doAction({
      mutation: updateKmsProvider,
      payload,
      total: 1,
      name: intl.formatMessage({
        id: "update.kmsProvider",
        defaultMessage: "Modify Key Provider",
      }),
      type: "KmsProvider",
    });
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "update.kmsProvider",
        defaultMessage: "Modify Key Provider",
      })}
      resourceName={current?.name}
    >
      <Form {...form}>
        <FieldStack>
          <FormItem className="flex flex-row gap-2">
            <FormLabel className="mt-[5px] flex">
              {intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            </FormLabel>
            <div className="flex min-h-8 items-center">
              <Text>{current?.name}</Text>
            </div>
          </FormItem>
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "introduction",
              defaultMessage: "Description",
            })}
            limit={256}
            size="m"
          />
          <FormItem className="flex flex-row gap-2">
            <FormLabel className="mt-[5px] flex">
              {intl.formatMessage({ id: "type", defaultMessage: "Type" })}
            </FormLabel>
            <div className="flex min-h-8 items-center">
              <Text>
                {current?.type === "KMS"
                  ? intl.formatMessage({
                      id: "kmsProvider.type.kms",
                      defaultMessage: "Standard Key Provider",
                    })
                  : intl.formatMessage({
                      id: "kmsProvider.type.builtin",
                      defaultMessage: "Native Key Provider",
                    })}
              </Text>
            </div>
          </FormItem>

          {current?.type === "KMS" ? (
            <>
              <InputField
                form={form}
                name="endpoint"
                label={intl.formatMessage({
                  id: "ip.address.or.domain",
                  defaultMessage: "IP Address/Domain Name",
                })}
                required
                size="m"
              />
              <InputNumberField
                form={form}
                name="port"
                label={intl.formatMessage({
                  id: "port",
                  defaultMessage: "Port",
                })}
                required
                className="width-80"
              />
              <SwitchField
                form={form}
                name="passwordProtected"
                label={intl.formatMessage({
                  id: "kmsProvider.passwordProtected",
                  defaultMessage: "Password Protection",
                })}
                disabled={!!current?.username}
              />
              {passwordProtected ? (
                <FieldStack className="border-l border-neutral-300 pl-3">
                  <InputField
                    form={form}
                    name="username"
                    label={intl.formatMessage({
                      id: "username",
                      defaultMessage: "Username",
                    })}
                    required
                    size="m"
                    rowClassName="grid grid-cols-[148px_1fr] gap-2"
                    labelClassName="!w-[148px] !min-w-0"
                  />
                  <InputPasswordField
                    form={form}
                    name="password"
                    label={intl.formatMessage({
                      id: "password",
                      defaultMessage: "Password",
                    })}
                    size="m"
                    rowClassName="grid grid-cols-[148px_1fr] gap-2"
                    labelClassName="!w-[148px] !min-w-0"
                    hint={intl.formatMessage({
                      id: "kmsProvider.password.optional",
                      defaultMessage: "If left blank, the previous password is used.",
                    })}
                  />
                </FieldStack>
              ) : null}
            </>
          ) : null}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Update;
