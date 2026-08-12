import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";

import {
  createDynamicGlobalConfigSchema,
  getDynamicValue,
  type DynamicGlobalConfigFormValues,
} from "./schema";

export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

const STYLE_WIDTH_60_PERCENT = { width: "60%" } as const;

const Text: React.FC<IProps> = ({ visible, setVisible, currItem, ok }) => {
  const fieldName = currItem?.formItem?.name ?? "value";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [fieldName]: "",
    }),
    [fieldName],
  );
  const formSchema = useMemo(
    () =>
      createDynamicGlobalConfigSchema({
        [fieldName]: currItem?.formItem?.rules,
      }),
    [currItem?.formItem?.rules, fieldName],
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
          value: `${getDynamicValue(values, fieldName)}`,
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
        <InputField
          form={form}
          label={currItem?.name}
          name={fieldName}
          labelTooltip={<ReactMarkdown>{currItem?.description}</ReactMarkdown>}
          required
          style={STYLE_WIDTH_60_PERCENT}
          type="text"
        />
      </Form>
    </DialogForm>
  );
};

export default Text;
