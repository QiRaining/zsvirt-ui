import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputNumberField, FieldStack } from "@zstack/form";
import { InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { ConsoleProxyAgent as IConsoleProxy } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createUpdateConsoleProxySchema,
  type UpdateConsoleProxyFormValues,
} from "./schema";

const updateConsoleProxy = gql`
  mutation ($input: UpdateConsoleProxyInput!) {
    updateConsoleProxy(input: $input) {
      actionId
    }
  }
`;
interface IProps {
  title?: string;
  visible: boolean;
  setVisible: any;
  selectedList: [IConsoleProxy];
  refetch?: any;
}
const Update: React.FC<IProps> = ({
  title: _title,
  refetch,
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const title =
    _title ||
    intl.formatMessage({
      id: "consoleproxy.action.update",
      defaultMessage: "Set Console Proxy Address",
    });

  const defaultValues = useMemo<UpdateConsoleProxyFormValues>(() => {
    return {
      name: selectedList?.[0]?.consoleProxyOverriddenIp ?? "",
      consoleProxyPort: selectedList?.[0]?.consoleProxyPort,
    };
  }, [selectedList]);
  const formSchema = useMemo(
    () => createUpdateConsoleProxySchema(intl),
    [intl],
  );
  const form = useForm<UpdateConsoleProxyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  React.useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = (value: UpdateConsoleProxyFormValues) => {
    const payload = {
      uuid: selectedList?.[0]?.uuid,
      consoleProxyOverriddenIp: value?.name,
      consoleProxyPort: value?.consoleProxyPort,
    };
    doAction({
      mutation: updateConsoleProxy,
      payload,
      name: title,
      total: 1,
      onProgress: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogForm
      title={title}
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
              id: "consoleproxy.filed.name",
              defaultMessage: `Console Proxy Address`,
            })}
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "consoleproxy.field.ip.set.adress.tooltip",
                  defaultMessage:
                    "### Console Proxy Address\n\n1. You can enter the public IP address of the management node, NAT address, or a domain name as a console proxy address.\n2. The configuration takes effect immediately. You do not need to restart the management node.",
                })}
              </ReactMarkdown>
            }
            required
            size="m"
          />
          <InputNumberField
            form={form}
            name="consoleProxyPort"
            label={intl.formatMessage({ id: "port", defaultMessage: "Port" })}
            required
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};
export default Update;
