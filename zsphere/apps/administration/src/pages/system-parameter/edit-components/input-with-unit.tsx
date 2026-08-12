import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputUnitField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
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

const InputWithUnit: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const fieldName = "value";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [fieldName]: {
        number: "",
        unit: currItem?.formItem?.unitList?.[0]?.value,
      },
    }),
    [currItem?.formItem?.unitList],
  );
  const formSchema = useMemo(
    () =>
      createDynamicGlobalConfigSchema({
        [fieldName]: currItem?.formItem?.rules,
      }),
    [currItem?.formItem?.rules],
  );
  const form = useForm<DynamicGlobalConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const disableNonZhLangUnit =
    currItem?.formItem?.componentProps?.disableNonZhLangUnit;
  const suffix =
    intl.locale !== "zh-CN" && disableNonZhLangUnit ? null : (
      <span className="ml-2 leading-8">
        {currItem?.formItem?.unitList?.[0]?.displayName}
      </span>
    );

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    return ok(
      [
        {
          category: currItem?.formItem?.category,
          name: currItem?.formItem?.name,
          value: `${currItem?.formItem?.formatFunction?.(
            getDynamicValue(values, fieldName),
          )}`,
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
        <InputUnitField
          form={form}
          label={currItem?.name}
          name={fieldName}
          labelTooltip={<ReactMarkdown>{currItem?.description}</ReactMarkdown>}
          required
          unitList={
            currItem?.formItem?.unitList?.length === 1
              ? undefined
              : currItem?.formItem?.unitList
          }
          suffix={currItem?.formItem?.unitList?.length === 1 ? suffix : null}
          maxLength={15}
        />
      </Form>
    </DialogForm>
  );
};

export default InputWithUnit;
