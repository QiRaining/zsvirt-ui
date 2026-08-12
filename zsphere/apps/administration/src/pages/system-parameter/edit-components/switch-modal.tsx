import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { SwitchField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";

import { createSwitchModalSchema, type SwitchModalFormValues } from "./schema";

export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

const MySelect: React.FC<IProps> = ({ visible, setVisible, currItem, ok }) => {
  const defaultValues = useMemo<SwitchModalFormValues>(() => {
    const value = currItem?.formItem?.value;

    return {
      enabled:
        currItem?.key === "vm.vm.clock.track"
          ? value !== "guest"
          : value !== "0",
    };
  }, [currItem?.formItem?.value, currItem?.key]);
  const formSchema = useMemo(() => createSwitchModalSchema(), []);
  const form = useForm<SwitchModalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = (values: SwitchModalFormValues) => {
    let value: string;
    if (currItem?.key === "vm.vm.clock.track") {
      value = values.enabled ? "host" : "guest";
    } else {
      value = values.enabled ? "60" : "0";
    }
    return ok(
      [
        {
          category: currItem?.formItem?.category,
          name: currItem?.formItem?.name,
          value,
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
        <div className="inline-flex">
          <SwitchField
            form={form}
            label={currItem?.name}
            name="enabled"
            labelTooltip={
              <ReactMarkdown>{currItem?.description}</ReactMarkdown>
            }
            required
          />
        </div>
      </Form>
    </DialogForm>
  );
};

export default MySelect;
