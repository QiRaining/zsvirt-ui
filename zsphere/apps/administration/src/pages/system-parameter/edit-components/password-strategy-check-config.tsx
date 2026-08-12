import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  SwitchField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import { get as _get } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { PasswordRangeFields } from "./password-range-fields";
import {
  createPasswordRangeSchema,
  type PasswordRangeFormValues,
} from "./schema";

export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

const PasswordStrategyCheckConfig: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();

  let _value: any = {};
  try {
    _value = JSON.parse(String(_get(currItem, ["formItem", "value"])));
  } catch (error) {
    console.log(error);
  }

  const defaultValues = useMemo<PasswordRangeFormValues>(
    () => ({
      enabled: Boolean(_value?.enabled),
      minimum: Number(_value?.minimum),
      maximum: Number(_value?.maximum),
      checkOther: Boolean(_value?.checkUppercase),
    }),
    [_value?.checkUppercase, _value?.enabled, _value?.maximum, _value?.minimum],
  );
  const formSchema = useMemo(
    () =>
      createPasswordRangeSchema(intl, {
        min: 8,
        max: 32,
        minimumTooSmallMessage: {
          id: "cannot.be.less.than.eight",
          defaultMessage: "Enter an integer no smaller than 8.",
        },
        maximumTooLargeMessage: {
          id: "cannot.be.greater.than.thirty-two",
          defaultMessage: "Enter an integer no greater than 32.",
        },
      }),
    [intl],
  );
  const form = useForm<PasswordRangeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const enabled = form.watch("enabled");

  const onOk = (values: PasswordRangeFormValues) => {
    const value = {
      enabled: values.enabled,
      minimum: values.minimum,
      maximum: values.maximum,
      checkUppercase: values.checkOther,
      checkLowercase: values.checkOther,
      checkNumber: values.checkOther,
      checkSpecialWords: values.checkOther,
    };

    ok(
      [
        {
          category: "passwordStrategy",
          name: "password.strength.check.config",
          value: JSON.stringify(value),
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
        <FieldStack>
          <SwitchField
            form={form}
            label={currItem?.name}
            name="enabled"
            required
            labelTooltip={
              <ReactMarkdown>{_get(currItem, "description", "")}</ReactMarkdown>
            }
          />
          {enabled ? (
            <PasswordRangeFields
              form={form}
              label={intl.formatMessage({
                id: "passwordLength",
                defaultMessage: "Password Length",
              })}
              checkboxLabel={intl.formatMessage({
                id: "combination.of.numbers.capitalization.special.characters",
                defaultMessage: "Specify a combination of digits, letters, and special characters",
              })}
              min={8}
              max={32}
            />
          ) : null}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default PasswordStrategyCheckConfig;
