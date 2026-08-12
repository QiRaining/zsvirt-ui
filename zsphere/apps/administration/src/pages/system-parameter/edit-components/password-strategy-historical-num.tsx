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
// import { formatSecToPeriod } from '@zstack/zsphere-utils'
import { find as _find } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
// import styles from './style.module.less'

import {
  createConditionalDynamicGlobalConfigSchema,
  type DynamicGlobalConfigFormValues,
} from "./schema";

export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

const PasswordStrategyHistoricalNum: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();

  const list = currItem;
  const _passwordStrategyCompare = _find(
    list,
    (it) => it.key === "passwordStrategy.enable.historical.password.compare",
  );
  const _passwordStrategyNum = _find(
    list,
    (it) => it.key === "passwordStrategy.historical.password.num",
  );
  const enabledName = "passwordStrategyCompare";
  const numberName = "passwordStrategyNum";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [enabledName]: _passwordStrategyCompare?.formItem?.value === "true",
      [numberName]: {
        number: undefined,
        unit: "",
      },
    }),
    [_passwordStrategyCompare],
  );
  const formSchema = useMemo(
    () =>
      createConditionalDynamicGlobalConfigSchema(
        (values) => Boolean(values[enabledName]),
        {
          [numberName]: _passwordStrategyNum?.formItem?.rules,
        },
      ),
    [_passwordStrategyNum?.formItem?.rules],
  );
  const form = useForm<DynamicGlobalConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const enabled = form.watch(enabledName);

  // const selectList: ISelectProps[] = [
  //   {
  //     value: 'false',
  //     displayName: intl.formatMessage({ id: 'globalConfig.close', defaultMessage: '关闭' })
  //   },
  //   {
  //     value: 'true',
  //     displayName: intl.formatMessage({ id: 'globalConfig.open', defaultMessage: '开启' })
  //   }
  // ]

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    if (!values[enabledName]) {
      ok(
        [
          {
            category: "passwordStrategy",
            name: "enable.historical.password.compare",
            value: `false`,
          },
        ],
        _passwordStrategyCompare?.name,
      );
    } else {
      ok(
        [
          {
            category: "passwordStrategy",
            name: "enable.historical.password.compare",
            value: `true`,
          },
          {
            category: "passwordStrategy",
            name: "historical.password.num",
            value: `${Number(
              (values[numberName] as { number?: string })?.number,
            )}`,
          },
        ],
        _passwordStrategyCompare?.name,
      );
    }
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
      title={_passwordStrategyCompare?.name}
      alertMessage={
        _passwordStrategyCompare?.alertMessage && (
          <ReactMarkdown>
            {_passwordStrategyCompare?.alertMessage}
          </ReactMarkdown>
        )
      }
      alertType="warning"
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <SwitchField
            form={form}
            label={_passwordStrategyCompare?.name}
            name={enabledName}
            required
            labelTooltip={
              <ReactMarkdown>
                {_passwordStrategyCompare?.description}
              </ReactMarkdown>
            }
          />
          {enabled ? (
            <InputUnitField
              form={form}
              label={intl.formatMessage({
                id: "no.repeat.times",
                defaultMessage: "Non-Repeating Count",
              })}
              name={numberName}
              required
              unitList={
                _passwordStrategyNum?.formItem?.unitList?.length === 1
                  ? undefined
                  : _passwordStrategyNum?.formItem?.unitList
              }
              suffix={
                _passwordStrategyNum?.formItem?.unitList?.length === 1 ? (
                  <span className="ml-2">
                    {_passwordStrategyNum?.formItem?.unitList?.[0]?.displayName}
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

export default PasswordStrategyHistoricalNum;
