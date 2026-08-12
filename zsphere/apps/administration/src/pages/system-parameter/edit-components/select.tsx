import { zodResolver } from "@hookform/resolvers/zod";
import { Form, type SelectOptions } from "@zstack/design";
import { SelectField } from "@zstack/form";
import { useDialogHookFormAdapter } from "@zstack/form";
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

interface ISelectProps {
  value: string | number;
  displayName: string;
}

const STYLE_INLINE_FLEX = { display: "inline-flex" } as const;
const STYLE_MARGIN_LEFT_8_TOP_5 = { marginLeft: 8, marginTop: 5 } as const;

const MySelect: React.FC<IProps> = ({ visible, setVisible, currItem, ok }) => {
  const fieldName = currItem?.formItem?.name ?? "value";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [fieldName]: currItem?.formItem?.value,
    }),
    [currItem?.formItem?.value, fieldName],
  );
  const options = useMemo<SelectOptions[]>(
    () =>
      currItem?.formItem?.selectList?.map((it: ISelectProps) => ({
        value: it.value,
        label: it.displayName,
      })) ?? [],
    [currItem?.formItem?.selectList],
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
        <div style={STYLE_INLINE_FLEX}>
          <SelectField
            form={form}
            label={currItem?.name}
            name={fieldName}
            labelTooltip={
              <ReactMarkdown>{currItem?.description}</ReactMarkdown>
            }
            options={options}
            required
            className="w-60"
          />
          <span style={STYLE_MARGIN_LEFT_8_TOP_5}>
            {currItem?.formItem?.unitList?.[0]?.displayName}
          </span>
        </div>
      </Form>
    </DialogForm>
  );
};

export default MySelect;
