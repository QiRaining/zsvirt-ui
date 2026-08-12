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
import { find as _find, get as _get } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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

const PasswordStrategyLockLogin: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const list = currItem;
  const passwordStrategyEnable = _find(
    list,
    (it) => it.key === "passwordStrategy.enable.lock.login.attempts.maximum",
  );
  const attemptsMaximum = _find(
    list,
    (it) => it.key === "passwordStrategy.lock.login.attempts.maximum",
  );
  const passwordStrategyPeriod = _find(
    list,
    (it) => it.key === "passwordStrategy.lock.login.period",
  );
  const enabledName = "passwordStrategyEnable";
  const attemptsName = "attemptsMaximum";
  const periodName = "passwordStrategyPeriod";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [enabledName]:
        _get(passwordStrategyEnable, ["formItem", "value"], "false") === "true",
      [attemptsName]: {
        number: undefined,
        unit: "",
      },
      [periodName]: {
        number: undefined,
        unit: "",
      },
    }),
    [passwordStrategyEnable],
  );
  const formSchema = useMemo(
    () =>
      createConditionalDynamicGlobalConfigSchema(
        (values) => Boolean(values[enabledName]),
        {
          [attemptsName]: _get(attemptsMaximum, ["formItem", "rules"], []),
          [periodName]: _get(passwordStrategyPeriod, ["formItem", "rules"], []),
        },
      ),
    [attemptsMaximum, passwordStrategyPeriod],
  );
  const form = useForm<DynamicGlobalConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const enabled = form.watch(enabledName);

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    if (values[enabledName]) {
      ok(
        [
          {
            category: "passwordStrategy",
            name: "enable.lock.login.attempts.maximum",
            value: `true`,
          },
          {
            category: "passwordStrategy",
            name: "lock.login.attempts.maximum",
            value: `${(values[attemptsName] as { number?: string })?.number}`,
          },
          {
            category: "passwordStrategy",
            name: "lock.login.period",
            value: `${
              Number((values[periodName] as { number?: string })?.number) * 60
            }`,
          },
        ],
        passwordStrategyEnable?.name,
      );
    } else {
      ok(
        [
          {
            category: "passwordStrategy",
            name: "enable.lock.login.attempts.maximum",
            value: `false`,
          },
        ],
        passwordStrategyEnable?.name,
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
      visible={visible}
      setVisible={setVisible}
      title={passwordStrategyEnable?.name}
      form={dialogForm}
      alertMessage={
        passwordStrategyEnable?.alertMessage && (
          <ReactMarkdown>{passwordStrategyEnable?.alertMessage}</ReactMarkdown>
        )
      }
      alertType="warning"
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <SwitchField
            form={form}
            label={passwordStrategyEnable?.name}
            name={enabledName}
            required
            labelTooltip={
              <ReactMarkdown>
                {_get(passwordStrategyEnable, "description", "")}
              </ReactMarkdown>
            }
          />
          {enabled ? (
            <>
              <InputUnitField
                form={form}
                label={_get(attemptsMaximum, "name", "")}
                name={attemptsName}
                required
                suffix={
                  <span className="ml-2">
                    {attemptsMaximum?.formItem?.unitList?.[0]?.displayName}
                  </span>
                }
                maxLength={15}
              />
              <InputUnitField
                form={form}
                label={_get(passwordStrategyPeriod, "name", "")}
                name={periodName}
                required
                suffix={
                  <span className="ml-2">
                    {
                      passwordStrategyPeriod?.formItem?.unitList?.[0]
                        ?.displayName
                    }
                  </span>
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

export default PasswordStrategyLockLogin;
