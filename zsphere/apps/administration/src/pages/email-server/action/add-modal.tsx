import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormItem, FormLabel } from "@zstack/design";
import {
  FieldStack,
  InputField,
  InputPasswordField,
  RadioGroupField,
  TextareaField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  CreateSNSEmailPlatformPayload,
  EmailServerSetting as IEmailServerSetting,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { createSNSEmailServer } from "../../../gql/email-server-setting.gql";
import {
  createAddEmailServerSchema,
  type AddEmailServerFormValues,
} from "./schema";

export interface IProps {}

const ENCRYPT_SMTP_PORT_MAP: Record<
  AddEmailServerFormValues["encryptType"],
  string
> = {
  STARTTLS: "587",
  SSL: "465",
  NONE: "25",
};

const Action: React.FC<IActionWrapperProps<IEmailServerSetting> & IProps> = ({
  visible,
  setVisible,
  refetch: _refetch,
}) => {
  const intl = useIntl();
  const title = intl.formatMessage({
    id: "add.emailServer",
    defaultMessage: "Add Email Server",
  });
  const doAction = useAction();

  const defaultValues = useMemo<AddEmailServerFormValues>(
    () => ({
      name: "",
      description: "",
      username: "",
      password: "",
      smtpServer: "",
      encryptType: "STARTTLS",
      smtpPort: "587",
    }),
    [],
  );
  const formSchema = useMemo(() => createAddEmailServerSchema(intl), [intl]);
  const form = useForm<AddEmailServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const encryptType = useWatch({
    control: form.control,
    name: "encryptType",
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  useEffect(() => {
    if (encryptType) {
      form.setValue("smtpPort", ENCRYPT_SMTP_PORT_MAP[encryptType]);
    }
  }, [encryptType, form]);

  const encryptTypes = useMemo(
    () => [
      {
        label: "STARTTLS",
        value: "STARTTLS" as const,
      },
      {
        label: "SSL/TLS",
        value: "SSL" as const,
      },
      {
        label: intl.formatMessage({
          id: "not.encrypted",
          defaultMessage: "Unencrypted",
        }),
        value: "NONE" as const,
      },
    ],
    [intl],
  );

  const onOk = (value: AddEmailServerFormValues) => {
    const payload: CreateSNSEmailPlatformPayload = {
      name: value.name,
      description: value.description,
      smtpServer: value.smtpServer,
      smtpPort: Number(value.smtpPort),
      encryptType: value.encryptType,
      username: value.username,
      password: value.password,
    };
    doAction({
      mutation: createSNSEmailServer,
      payload,
      name: intl.formatMessage({
        id: "add.emailServer",
        defaultMessage: "Add Email Server",
      }),
      total: 1,
      type: "EmailServerSetting",
    });
  };

  return (
    <DialogForm
      visible={visible}
      form={dialogForm}
      setVisible={setVisible}
      title={title}
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({
              id: "virtualization.name",
              defaultMessage: "Name",
            })}
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "emailServer.field.name.tooltip",
                  defaultMessage: `### Email Server

1. You can specify an email server as the receiver for alarm service.
 2. Make sure that the SMTP email server, port, username, and password are correct.`,
                })}
              </ReactMarkdown>
            }
            inputTooltip={intl.formatMessage({
              id: "global.field.name.hover.tooltip",
              defaultMessage:
                "Names must be 1 to 128 characters in length and can contain letters, digits, hyphens (-), underscores (_), periods (.), parenthesis (), colons (:), and plus signs (+).",
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
            rows={4}
            maxLength={256}
            showCount
            size="m"
          />
          <InputField
            form={form}
            name="username"
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
            size="m"
          />
          <InputPasswordField
            form={form}
            name="password"
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "emailServer.field.password.tooltip",
                  defaultMessage: `### Password
 The password of the username. If you specify a third-party email server, you need to enable the SMTP service for the email server in advance. The password is the authorization code that you obtain.`,
                })}
              </ReactMarkdown>
            }
            size="m"
          />
          <FormItem className="flex min-h-8 flex-row items-center gap-2">
            <FormLabel className="flex h-8">
              {intl.formatMessage({
                id: "virtualization.emailServer.type",
                defaultMessage: "Email Server Type",
              })}
            </FormLabel>
            <div className="flex h-8 items-center">SMTP</div>
          </FormItem>
          <InputField
            form={form}
            name="smtpServer"
            label={intl.formatMessage({
              id: "virtualization.smtp.server",
              defaultMessage: "SMTP Server",
            })}
            inputTooltip={intl.formatMessage({
              id: "virtualization.emailServer.field.emailServer.hover",
              defaultMessage: "smtp.xxx.com",
            })}
            required
            size="m"
          />
          <RadioGroupField
            form={form}
            name="encryptType"
            label={intl.formatMessage({
              id: "encryption.type",
              defaultMessage: "Encryption Type",
            })}
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "virtualization.emailServer.field.encryption.type.tooltip",
                  defaultMessage: `### Encryption Type

You can encrypt connections to the ports of your email servers.

1. By default, STARTTLS is selected. The corresponding default port is 587.
3. If you select SSL/TLS, the corresponding default port is 465.
4. If you do not encrypt connections to the ports of your SMTP email servers, select Unencrypted.`,
                })}
              </ReactMarkdown>
            }
            options={encryptTypes}
            required
          />
          <InputField
            form={form}
            name="smtpPort"
            label={intl.formatMessage({
              id: "smtp.port",
              defaultMessage: "SMTP Port",
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
