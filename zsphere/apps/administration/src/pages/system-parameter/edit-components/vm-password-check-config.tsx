import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  SwitchField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";
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

const VmPasswordCheckConfig: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const [checkConfig, numRange] = _.split(
    _.get(currItem, ["formItem", "value"]),
    ",",
  );
  const [minimum, maximum] = _.split(numRange, "-");
  const [checkPasswordStrength, lowercase] = checkConfig;

  const defaultValues = useMemo<PasswordRangeFormValues>(
    () => ({
      enabled: checkPasswordStrength === "1",
      minimum: _.toNumber(minimum),
      maximum: _.toNumber(maximum),
      checkOther: lowercase === "1",
    }),
    [checkPasswordStrength, lowercase, maximum, minimum],
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
        requireInteger: true,
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
    const _checkPasswordStrength = values.enabled ? "1" : "0";
    const _lowercase = values.checkOther ? "1" : "0";
    const _stringValue = `${_checkPasswordStrength}${_lowercase}${_lowercase}${_lowercase}${_lowercase},${values.minimum}-${values.maximum}`;

    ok(
      [
        {
          category: "mevoco",
          name: "vm.password.strength.check.config",
          value: _stringValue,
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
              <ReactMarkdown>
                {_.get(currItem, "description", "")}
              </ReactMarkdown>
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

export default VmPasswordCheckConfig;
