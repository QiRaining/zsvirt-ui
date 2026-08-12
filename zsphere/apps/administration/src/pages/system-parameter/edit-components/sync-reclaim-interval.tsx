import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputUnitField,
  SwitchField,
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

const SyncReclaimInterval: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const settingName = "setting";
  const valueName = currItem?.key;
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [settingName]: currItem?.formItem?.value !== "0",
      [valueName]: {
        number: undefined,
        unit: currItem?.formItem?.unitList?.[0]?.value,
      },
    }),
    [currItem?.formItem?.unitList, currItem?.formItem?.value, valueName],
  );
  const formSchema = useMemo(
    () =>
      createConditionalDynamicGlobalConfigSchema(
        (values) => Boolean(values[settingName]),
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
  const enabled = form.watch(settingName);
  // const genFormatFn = useFormatFunction()
  // const formatFunction = _get(genFormatFn, currItem?.formItem?.formatFunction)

  // const selectList: ISelectProps[] = [
  //   {
  //     value: '0',
  //     displayName: intl.formatMessage({ id: 'globalConfig.close', defaultMessage: '关闭' })
  //   },
  //   {
  //     value: '-',
  //     displayName: intl.formatMessage({ id: 'globalConfig.open', defaultMessage: '开启' })
  //   }
  // ]

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    return ok(
      [
        {
          category: currItem?.formItem?.category,
          name: currItem?.formItem?.name,
          value: !values[settingName]
            ? "0"
            : `${currItem?.formItem?.formatFunction?.(
                getDynamicValue(values, valueName),
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
            name={settingName}
            required
            labelTooltip={
              <ReactMarkdown>{currItem?.description}</ReactMarkdown>
            }
          />
          {enabled ? (
            <InputUnitField
              form={form}
              label={intl.formatMessage({
                id: "timeInterval",
                defaultMessage: "Time Interval",
              })}
              name={valueName}
              required
              unitList={
                currItem?.formItem?.unitList?.length === 1
                  ? undefined
                  : currItem?.formItem?.unitList
              }
              suffix={
                currItem?.formItem?.unitList?.length === 1 ? (
                  <span className="ml-2">
                    {currItem?.formItem?.unitList?.[0]?.displayName}
                  </span>
                ) : null
              }
              maxLength={15}
            />
          ) : null}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default SyncReclaimInterval;
