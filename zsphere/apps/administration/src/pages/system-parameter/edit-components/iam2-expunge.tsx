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

const IAM2_EXPUNGE_INTERVAL_NAME = "iam2.expungeInterval";

const IAM2Expunge: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const list = currItem;
  const expungeInterval = _find(
    list,
    (it) => it.key === IAM2_EXPUNGE_INTERVAL_NAME,
  );
  const fieldName = "iam2ExpungeInterval";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [fieldName]: {
        number: "",
        unit: expungeInterval?.formItem?.unitList?.[0]?.value,
      },
    }),
    [expungeInterval?.formItem?.unitList],
  );
  const formSchema = useMemo(
    () =>
      createDynamicGlobalConfigSchema({
        [fieldName]: _get(expungeInterval, ["formItem", "rules"], []),
      }),
    [expungeInterval],
  );
  const form = useForm<DynamicGlobalConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    const value = `${(values[fieldName] as { number?: string })?.number}`;

    return ok(
      [
        { category: "iam2", name: "expungeInterval", value },
        { category: "iam2", name: "expungePeriod", value },
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
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      title={expungeInterval?.name}
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
          name={fieldName}
          label={expungeInterval?.name}
          required
          labelTooltip={
            <ReactMarkdown>{expungeInterval?.description}</ReactMarkdown>
          }
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

export default IAM2Expunge;
