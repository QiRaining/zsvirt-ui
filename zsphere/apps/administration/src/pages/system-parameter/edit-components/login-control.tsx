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
import { find as _find, get as _get } from "lodash-es";
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

const LoginControl: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const list = currItem;
  const loginControl = _find(
    list,
    (it) => it.key === "loginControl.login.control",
  );
  const attemptsMaximum = _find(
    list,
    (it) => it.key === "loginControl.login.attempts.maximum",
  );
  const enabledName = "enabled";
  const attemptsName = "attempts";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [enabledName]:
        _get(loginControl, ["formItem", "value"], "false") === "true",
      [attemptsName]: { number: "", unit: "" },
    }),
    [loginControl],
  );
  const formSchema = useMemo(
    () =>
      createConditionalDynamicGlobalConfigSchema(
        (values) => Boolean(values[enabledName]),
        {
          [attemptsName]: _get(attemptsMaximum, ["formItem", "rules"], []),
        },
      ),
    [attemptsMaximum],
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
          { category: "loginControl", name: "login.control", value: "true" },
          {
            category: "loginControl",
            name: "login.attempts.maximum",
            value: `${(values[attemptsName] as { number?: string })?.number}`,
          },
        ],
        loginControl?.name,
      );
      return;
    }

    ok(
      [{ category: "loginControl", name: "login.control", value: "false" }],
      loginControl?.name,
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
      title={loginControl?.name}
      form={dialogForm}
      alertMessage={
        loginControl?.alertMessage && (
          <ReactMarkdown>{loginControl?.alertMessage}</ReactMarkdown>
        )
      }
      alertType="warning"
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <SwitchField
            form={form}
            label={loginControl?.name}
            name={enabledName}
            required
            labelTooltip={
              <ReactMarkdown>
                {_get(loginControl, "description", "")}
              </ReactMarkdown>
            }
          />
          {enabled ? (
            <InputUnitField
              form={form}
              label={intl.formatMessage({
                id: "maximum.number.of.consecutive.login.failures",
                defaultMessage: "Maximum Consecutive Failed Login",
              })}
              name={attemptsName}
              required
              suffix={
                <span className="ml-2">
                  {intl.formatMessage({
                    id: "count.ci",
                    defaultMessage: "times",
                  })}
                </span>
              }
              maxLength={15}
            />
          ) : null}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default LoginControl;
