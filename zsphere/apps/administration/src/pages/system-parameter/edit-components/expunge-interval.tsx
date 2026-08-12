import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputUnitField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import { find as _find, get as _get } from "lodash-es";
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

const ExpungeInterval: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const list = currItem;
  const category = _get(currItem, ["0", "formItem", "category"], "");
  const expungeInterval = _find(
    list,
    (it) => it.key === `${category}.expungeInterval`,
  );
  const fieldName = "expungeInterval";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [fieldName]: {
        number: "",
        unit: expungeInterval?.formItem?.unitList?.[0]?.value ?? "h",
      },
    }),
    [expungeInterval?.formItem?.unitList],
  );
  const formSchema = useMemo(
    () =>
      createDynamicGlobalConfigSchema({
        [fieldName]: expungeInterval?.formItem?.rules,
      }),
    [expungeInterval?.formItem?.rules],
  );
  const form = useForm<DynamicGlobalConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    const expungeValue = values[fieldName];
    const value = `${expungeInterval?.formItem?.formatFunction?.(expungeValue)}`;

    ok(
      [
        { category: "vm", name: "expungeInterval", value },
        { category: "image", name: "expungeInterval", value },
        { category: "volume", name: "expungeInterval", value },
      ],
      expungeInterval?.name,
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
      title={expungeInterval?.name}
      form={dialogForm}
      alertMessage={
        expungeInterval?.alertMessage && (
          <ReactMarkdown>{expungeInterval?.alertMessage}</ReactMarkdown>
        )
      }
      alertType="warning"
      onOk={onOk}
    >
      <Form {...form}>
        <InputUnitField
          form={form}
          label={expungeInterval?.name}
          name={fieldName}
          labelTooltip={
            <ReactMarkdown>{expungeInterval?.description}</ReactMarkdown>
          }
          required
          unitList={
            expungeInterval?.formItem?.unitList?.length === 1
              ? undefined
              : expungeInterval?.formItem?.unitList
          }
          suffix={
            expungeInterval?.formItem?.unitList?.length === 1 ? (
              <span className="ml-2">
                {expungeInterval?.formItem?.unitList?.[0]?.displayName}
              </span>
            ) : null
          }
          maxLength={15}
        />
      </Form>
    </DialogForm>
  );
};

export default ExpungeInterval;
