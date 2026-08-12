import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputField,
  InputNumberField,
  InputPasswordField,
  RadioGroupField,
  SwitchField,
  TextareaField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createCreateKmsProviderSchema,
  type CreateKmsProviderValues,
} from "./schema";

const createKmsProvider = gql`
  mutation createKmsProvider($input: CreateKmsProviderInput!) {
    createKmsProvider(input: $input) {
      actionId
    }
  }
`;

export default function Create({
  visible,
  setVisible,
}: IActionWrapperProps<Item>) {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<CreateKmsProviderValues>(
    () => ({
      name: "",
      description: "",
      type: "NKP",
      endpoint: "",
      port: 5696,
      passwordProtected: false,
      username: "",
      password: "",
    }),
    [],
  );
  const formSchema = useMemo(() => createCreateKmsProviderSchema(intl), [intl]);
  const form = useForm<CreateKmsProviderValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const providerType = form.watch("type");
  const passwordProtected = form.watch("passwordProtected");

  const title = intl.formatMessage({
    id: "create.kmsProvider",
    defaultMessage: "Add Key Provider",
  });

  const onOk = (values: CreateKmsProviderValues) => {
    const payload: {
      name: string;
      description: string;
      createKmsParam?: {
        endpoint: string;
        port: string | number;
        username?: string;
        password?: string;
      };
    } = {
      name: values.name,
      description: values.description,
    };

    if (values.type === "KMS") {
      payload.createKmsParam = {
        endpoint: values.endpoint,
        port: values.port,
      };
      if (values.passwordProtected) {
        payload.createKmsParam.username = values.username;
        payload.createKmsParam.password = values.password;
      }
    }

    doAction({
      mutation: createKmsProvider,
      payload,
      total: 1,
      name: title,
      type: "KmsProvider",
    });
  };

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  return (
      <DialogForm
        visible={visible}
        setVisible={setVisible}
        title={title}
        form={dialogForm}
        onOk={onOk}
      >
        <Form {...form}>
          <FieldStack>
            <InputField
              form={form}
              name="name"
              label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
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
              limit={256}
              size="m"
            />
            <RadioGroupField
              form={form}
              name="type"
              label={intl.formatMessage({ id: "type", defaultMessage: "Type" })}
              options={[
                {
                  value: "NKP",
                  label: intl.formatMessage({
                    id: "kmsProvider.type.builtin",
                    defaultMessage: "Native Key Provider",
                  }),
                },
              ]}
            />

            {providerType === "KMS" ? (
              <>
                <InputField
                  form={form}
                  name="endpoint"
                  label={intl.formatMessage({
                    id: "ip.address.or.domain.name",
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
                  min={1}
                  className="width-80"
                />
                <SwitchField
                  form={form}
                  name="passwordProtected"
                  label={intl.formatMessage({
                    id: "kmsProvider.passwordProtected",
                    defaultMessage: "Password Protection",
                  })}
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
                      required
                      size="m"
                      rowClassName="grid grid-cols-[148px_1fr] gap-2"
                      labelClassName="!w-[148px] !min-w-0"
                    />
                  </FieldStack>
                ) : null}
              </>
            ) : null}
          </FieldStack>
        </Form>
      </DialogForm>
  );
}
