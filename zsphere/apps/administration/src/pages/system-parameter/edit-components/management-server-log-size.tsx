import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  SwitchField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { RetentionNumberField } from "./retention-number-field";
import {
  createManagementServerLogSizeSchema,
  type ManagementServerLogSizeFormValues,
} from "./schema";

export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

const ManagementServerLogSize: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const defaultValues = useMemo<ManagementServerLogSizeFormValues>(
    () => ({
      setting: currItem?.formItem?.value !== "-1",
      size:
        currItem?.formItem?.value && currItem.formItem.value !== "-1"
          ? Number(currItem.formItem.value)
          : "",
    }),
    [currItem?.formItem?.value],
  );
  const formSchema = useMemo(
    () => createManagementServerLogSizeSchema(intl),
    [intl],
  );
  const form = useForm<ManagementServerLogSizeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const setting = form.watch("setting");

  const onOk = (values: ManagementServerLogSizeFormValues) => {
    return ok(
      [
        {
          category: currItem?.formItem?.category,
          name: currItem?.formItem?.name,
          value: values.setting ? `${values.size}` : "-1",
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
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      title={currItem?.name}
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
          <SwitchField
            form={form}
            label={currItem?.name}
            labelTooltip={
              <ReactMarkdown>{currItem?.description}</ReactMarkdown>
            }
            layout="label-width"
            name="setting"
            required
            controlClassName="!min-h-8 !pt-0 justify-center"
          />
          <RetentionNumberField
            enabled={setting}
            form={form}
            label={intl.formatMessage({
              id: "reserveSize",
              defaultMessage: "Retention Size",
            })}
            name="size"
            unit={currItem?.formItem?.unitList?.[0]?.displayName}
            unlimitedText={intl.formatMessage({
              id: "globalConfig.unlimited",
              defaultMessage: "Unlimited",
            })}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default ManagementServerLogSize;
