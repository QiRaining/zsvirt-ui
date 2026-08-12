import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InputNumber,
} from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
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

const InputWithNumberCompared: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
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
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem className="flex flex-row gap-2">
              <FormLabel
                info={<ReactMarkdown>{currItem?.description}</ReactMarkdown>}
                required
                className="mt-[5px] flex"
              >
                {currItem?.name}
              </FormLabel>
              <div className="flex flex-col">
                <div className="flex h-8 items-center gap-2">
                  <FormControl>
                    <InputNumber
                      {...currItem?.formItem?.componentProps}
                      name={field.name}
                      onBlur={field.onBlur}
                      onValueChange={field.onChange}
                      value={field.value as number | ""}
                    />
                  </FormControl>
                  <span className="text-sm leading-[22px] text-neutral-700">
                    : 1
                  </span>
                </div>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </Form>
    </DialogForm>
  );
};

export default InputWithNumberCompared;
