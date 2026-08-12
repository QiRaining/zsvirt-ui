import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputNumberField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";

import {
  createDynamicGlobalConfigSchema,
  type DynamicGlobalConfigFormValues,
} from "./schema";

export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

const InputWithNumber: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const fieldName = "value";
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
  const inputNumberProps = useMemo(() => {
    const componentProps = currItem?.formItem?.componentProps ?? {};

    return {
      ...componentProps,
      className: ["w-[100px]", componentProps.className]
        .filter(Boolean)
        .join(" "),
      min: componentProps.min ?? Number.MIN_SAFE_INTEGER,
      max: componentProps.max ?? Number.MAX_SAFE_INTEGER,
    };
  }, [currItem?.formItem?.componentProps]);

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    return ok(
      [
        {
          category: currItem?.formItem?.category,
          name: currItem?.formItem?.name,
          value: `${values.value}`,
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
        <InputNumberField
          form={form}
          label={currItem?.name}
          name={fieldName}
          labelTooltip={<ReactMarkdown>{currItem?.description}</ReactMarkdown>}
          required
          valueMode="string"
          {...inputNumberProps}
        />
      </Form>
    </DialogForm>
  );
};

export default InputWithNumber;
