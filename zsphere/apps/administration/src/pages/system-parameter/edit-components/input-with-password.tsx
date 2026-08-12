import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputPasswordField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createInputWithPasswordSchema,
  type DynamicGlobalConfigFormValues,
} from "./schema";
export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

const InputWithPassword: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const fieldName = currItem?.formItem?.name ?? "value";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [fieldName]: "",
      confirm: "",
    }),
    [fieldName],
  );
  const formSchema = useMemo(
    () =>
      createInputWithPasswordSchema(intl, fieldName, currItem?.formItem?.rules),
    [currItem?.formItem?.rules, fieldName, intl],
  );
  const form = useForm<DynamicGlobalConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    return ok(
      [
        {
          category: currItem?.formItem?.category,
          name: currItem?.formItem?.name,
          value: `${values[fieldName]}`,
        },
      ],
      currItem?.name,
    );
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
      title={currItem?.name}
      form={dialogForm}
      alertMessage={
        currItem?.alertMessage && (
          <ReactMarkdown>{currItem?.alertMessage}</ReactMarkdown>
        )
      }
      alertType="warning"
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <InputPasswordField
            form={form}
            name={fieldName}
            label={intl.formatMessage({
              id: "globalConfig.form.newpassword",
              defaultMessage: "New Password",
            })}
            labelTooltip={
              <ReactMarkdown>{currItem?.description}</ReactMarkdown>
            }
            required
            size="m"
          />
          <InputPasswordField
            form={form}
            name="confirm"
            label={intl.formatMessage({
              id: "globalConfig.form.confirmpassword",
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

export default InputWithPassword;
