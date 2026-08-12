import { Checkbox } from "@zstack/design";
import { Form, Input } from "@zstack/zsphere-components";
import type { Rule } from "antd/es/form";
import type { NamePath } from "antd/es/form/interface";
import { get } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

export interface IPasswordFieldProps {
  name: string[];
  label: string;
  required?: boolean;
  rules?: Rule[];
  dependencies?: NamePath[];
  resetPasswordLabel?: string | null;
}

export default function PasswordField({
  name,
  label,
  required,
  rules,
  dependencies,
  resetPasswordLabel,
}: IPasswordFieldProps) {
  const intl = useIntl();
  const form = Form.useFormInstance();

  const validateConfirmPassword = (value?: string) => {
    if (form?.getFieldValue([...name, "value"]) !== value) {
      return Promise.reject(
        intl.formatMessage({
          id: "vm.spec.field.confirm.password.validator.inconsistent",
          defaultMessage: "The passwords do not match.",
        }),
      );
    }
    return Promise.resolve();
  };

  return (
    <>
      {resetPasswordLabel && (
        <Form.Item
          name={[...name, "show"]}
          label={label}
          initialValue={false}
          preserve={false}
          valuePropName="checked"
        >
          <FormCheckbox label={resetPasswordLabel} />
        </Form.Item>
      )}
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          get(prev, [...name, "show"]) !== get(curr, [...name, "show"])
        }
      >
        {({ getFieldValue }) => {
          return (
            (!resetPasswordLabel || getFieldValue([...name, "show"])) && (
              <>
                <Form.Item
                  name={[...name, "value"]}
                  label={
                    !resetPasswordLabel
                      ? label
                      : intl.formatMessage({
                          id: "new.password",
                          defaultMessage: "New Password",
                        })
                  }
                  initialValue=""
                  preserve={false}
                  required={required}
                  rules={rules}
                  dependencies={dependencies}
                >
                  <Input.Password
                    className="width-320"
                    autoComplete="new-password"
                  />
                </Form.Item>
                <Form.Item
                  name={[...name, "confirmValue"]}
                  label={
                    !resetPasswordLabel
                      ? intl.formatMessage({
                          id: "confirm.password",
                          defaultMessage: "Confirm Password",
                        })
                      : intl.formatMessage({
                          id: "confirm.new.password",
                          defaultMessage: "Confirm Password",
                        })
                  }
                  initialValue=""
                  preserve={false}
                  required={required}
                  rules={[
                    {
                      validator: (_rule, value) =>
                        validateConfirmPassword(value),
                    },
                  ]}
                  dependencies={[[...name, "value"]]}
                >
                  <Input.Password
                    className="width-320"
                    autoComplete="new-password"
                  />
                </Form.Item>
              </>
            )
          );
        }}
      </Form.Item>
    </>
  );
}
