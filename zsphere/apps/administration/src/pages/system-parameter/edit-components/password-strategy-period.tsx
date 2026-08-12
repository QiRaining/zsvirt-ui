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
import { find as _find } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

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

const PasswordStrategyPeriod: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();

  const list = currItem;
  const _passwordStrategyEnabled = _find(
    list,
    (it) => it.key === "passwordStrategy.enable.force.change.password.period",
  );
  const _passwordStrategyPeriod = _find(
    list,
    (it) => it.key === "passwordStrategy.force.change.password.period",
  );
  const enabledName = "passwordStrategyEnabled";
  const periodName = "passwordStrategyPeriod";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [enabledName]: _passwordStrategyEnabled?.formItem?.value === "true",
      [periodName]: {
        number: undefined,
        unit: "",
      },
    }),
    [_passwordStrategyEnabled],
  );
  const formSchema = useMemo(
    () =>
      createConditionalDynamicGlobalConfigSchema(
        (values) => Boolean(values[enabledName]),
        {
          [periodName]: _passwordStrategyPeriod?.formItem?.rules,
        },
      ),
    [_passwordStrategyPeriod?.formItem?.rules],
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
            name: "enable.force.change.password.period",
            value: `false`,
          },
        ],
        _passwordStrategyEnabled?.name,
      );
    } else {
      ok(
        [
          {
            category: "passwordStrategy",
            name: "enable.force.change.password.period",
            value: `true`,
          },
          {
            category: "passwordStrategy",
            name: "force.change.password.period",
            value: `${
              Number((values[periodName] as { number?: string })?.number) *
              24 *
              60 *
              60
            }`,
          },
        ],
        _passwordStrategyEnabled?.name,
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
      title={_passwordStrategyEnabled?.name}
      alertMessage={
        _passwordStrategyEnabled?.alertMessage && (
          <ReactMarkdown>
            {_passwordStrategyEnabled?.alertMessage}
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
            label={_passwordStrategyEnabled?.name}
            name={enabledName}
            required
            labelTooltip={
              <ReactMarkdown>
                {_passwordStrategyEnabled?.description}
              </ReactMarkdown>
            }
          />
          {enabled ? (
            <InputUnitField
              form={form}
              label={intl.formatMessage({
                id: "renewal.cycle",
                defaultMessage: "Update Interval",
              })}
              name={periodName}
              required
              unitList={
                _passwordStrategyPeriod?.formItem?.unitList?.length === 1
                  ? undefined
                  : _passwordStrategyPeriod?.formItem?.unitList
              }
              suffix={
                _passwordStrategyPeriod?.formItem?.unitList?.length === 1 ? (
                  <span className="ml-2">
                    {
                      _passwordStrategyPeriod?.formItem?.unitList?.[0]
                        ?.displayName
                    }
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

export default PasswordStrategyPeriod;
