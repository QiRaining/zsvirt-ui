import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  SwitchField,
  InputUnitField,
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

const LoginPasswordUpdateStrategy: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const list = currItem;
  const passwordStrategyEnabled = _find(
    list,
    (it) => it.key === "passwordStrategy.enable.force.change.password.period",
  );
  const passwordStrategyPeriod = _find(
    list,
    (it) => it.key === "passwordStrategy.force.change.password.period",
  );
  const passwordStrategyNum = _find(
    list,
    (it) => it.key === "passwordStrategy.historical.password.num",
  );
  const enabledName = "enabled";
  const periodName = "period";
  const numName = "num";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [enabledName]: passwordStrategyEnabled?.formItem?.value === "true",
      [periodName]: { number: "", unit: "" },
      [numName]: { number: "", unit: "" },
    }),
    [passwordStrategyEnabled],
  );
  const formSchema = useMemo(
    () =>
      createConditionalDynamicGlobalConfigSchema(
        (values) => Boolean(values[enabledName]),
        {
          [periodName]: passwordStrategyPeriod?.formItem?.rules,
          [numName]: passwordStrategyNum?.formItem?.rules,
        },
      ),
    [
      passwordStrategyNum?.formItem?.rules,
      passwordStrategyPeriod?.formItem?.rules,
    ],
  );
  const form = useForm<DynamicGlobalConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const enabled = form.watch(enabledName);

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    if (!values[enabledName]) {
      ok(
        [
          {
            category: "passwordStrategy",
            name: "enable.force.change.password.period",
            value: "false",
          },
          {
            category: "passwordStrategy",
            name: "enable.historical.password.compare",
            value: "false",
          },
        ],
        passwordStrategyEnabled?.name,
      );
      return;
    }

    ok(
      [
        {
          category: "passwordStrategy",
          name: "enable.force.change.password.period",
          value: "true",
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
        {
          category: "passwordStrategy",
          name: "enable.historical.password.compare",
          value: "true",
        },
        {
          category: "passwordStrategy",
          name: "historical.password.num",
          value: `${Number((values[numName] as { number?: string })?.number)}`,
        },
      ],
      passwordStrategyEnabled?.name,
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
      title={passwordStrategyEnabled?.name}
      alertMessage={
        passwordStrategyEnabled?.alertMessage && (
          <ReactMarkdown>{passwordStrategyEnabled?.alertMessage}</ReactMarkdown>
        )
      }
      alertType="warning"
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <SwitchField
            form={form}
            label={passwordStrategyEnabled?.name}
            name={enabledName}
            required
            labelTooltip={
              <ReactMarkdown>
                {passwordStrategyEnabled?.description}
              </ReactMarkdown>
            }
          />
          {enabled ? (
            <>
              <InputUnitField
                form={form}
                label={intl.formatMessage({
                  id: "renewal.cycle",
                  defaultMessage: "Update Interval",
                })}
                name={periodName}
                required
                unitList={
                  passwordStrategyPeriod?.formItem?.unitList?.length === 1
                    ? undefined
                    : passwordStrategyPeriod?.formItem?.unitList
                }
                suffix={
                  passwordStrategyPeriod?.formItem?.unitList?.length === 1 ? (
                    <span className="ml-2">
                      {
                        passwordStrategyPeriod?.formItem?.unitList?.[0]
                          ?.displayName
                      }
                    </span>
                  ) : null
                }
                maxLength={15}
              />
              <InputUnitField
                form={form}
                label={intl.formatMessage({
                  id: "no.repeat.times",
                  defaultMessage: "Non-Repeating Count",
                })}
                name={numName}
                required
                unitList={
                  passwordStrategyNum?.formItem?.unitList?.length === 1
                    ? undefined
                    : passwordStrategyNum?.formItem?.unitList
                }
                suffix={
                  passwordStrategyNum?.formItem?.unitList?.length === 1 ? (
                    <span className="ml-2">
                      {
                        passwordStrategyNum?.formItem?.unitList?.[0]
                          ?.displayName
                      }
                    </span>
                  ) : null
                }
                maxLength={15}
              />
            </>
          ) : null}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default LoginPasswordUpdateStrategy;
