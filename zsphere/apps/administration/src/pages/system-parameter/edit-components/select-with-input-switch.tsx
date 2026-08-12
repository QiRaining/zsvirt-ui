import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputNumberField,
  SelectField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createConditionalDynamicGlobalConfigSchema,
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

const SelectWithInputSwitch: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const settingName = "setting";
  const valueName = currItem?.key;

  const selectList: ISelectProps[] = [
    {
      value: "-1",
      displayName: intl.formatMessage({
        id: "globalConfig.close",
        defaultMessage: "Disabled",
      }),
    },
    {
      value: "-",
      displayName: intl.formatMessage({
        id: "globalConfig.open",
        defaultMessage: "Enabled",
      }),
    },
  ];
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [settingName]: currItem?.formItem?.value === "-1" ? "-1" : "-",
      [valueName]: "",
    }),
    [currItem?.formItem?.value, valueName],
  );
  const formSchema = useMemo(
    () =>
      createConditionalDynamicGlobalConfigSchema(
        (values) => values[settingName] !== "-1",
        {
          [valueName]: currItem?.formItem?.rules,
        },
      ),
    [currItem?.formItem?.rules, valueName],
  );
  const form = useForm<DynamicGlobalConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const setting = form.watch(settingName);

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    return ok(
      [
        {
          category: currItem?.formItem?.category,
          name: currItem?.formItem?.name,
          value:
            values[settingName] === "-1"
              ? "-1"
              : `${getDynamicValue(values, valueName)}`,
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
          <SelectField
            form={form}
            label={currItem?.name}
            name={settingName}
            required
            labelTooltip={
              <ReactMarkdown>{currItem?.description}</ReactMarkdown>
            }
            options={selectList.map((it) => ({
              label: it.displayName,
              value: String(it.value),
            }))}
            className="w-60"
          />
          {setting !== "-1" ? (
            <InputNumberField
              form={form}
              label=""
              name={valueName}
              className="w-20"
              valueMode="string"
            />
          ) : null}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default SelectWithInputSwitch;
