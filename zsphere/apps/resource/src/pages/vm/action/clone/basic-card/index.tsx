import {
  Checkbox,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@zstack/design";
import { FieldStack, InputField, InputNumberField } from "@zstack/form";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import FormSection from "../form-section";
import type { CloneVmValues } from "../schema";

interface BasicCardProps {
  form: UseFormReturn<CloneVmValues>;
}

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
      {label ? (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      ) : null}
    </div>
  );
});

FormCheckbox.displayName = "FormCheckbox";

const BasicCard: React.FC<BasicCardProps> = ({ form }) => {
  const intl = useIntl();

  return (
    <FormSection
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <FieldStack>
        <InputField
          form={form}
          name="name"
          label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
          required
          size="m"
        />
        <InputNumberField
          form={form}
          name="count"
          label={intl.formatMessage({
            id: "quantity",
            defaultMessage: "Quantity",
          })}
          required
          min={1}
          max={10000}
          variant="legacy"
          hint={intl.formatMessage({
            id: "vmClone.field.count.description",
            defaultMessage:
              'When you clone VMs in bulk, the names of these VMs will be followed by -1, -2, -3, and so forth to distinguish these VMs.',
          })}
        />
        <FormField
          control={form.control}
          name="strategy"
          render={({ field }) => (
            <FormItem className="flex min-h-8 flex-row items-center gap-2">
              <FormLabel>
                {intl.formatMessage({
                  id: "auto.start",
                  defaultMessage: "Power Status",
                })}
              </FormLabel>
              <div className="flex flex-col">
                <FormControl>
                  <FormCheckbox
                    checked={field.value}
                    onChange={field.onChange}
                    label={intl.formatMessage({
                      id: "auto.start.after.clone",
                      defaultMessage: "Power on after clone",
                    })}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </FieldStack>
    </FormSection>
  );
};

export default React.memo(BasicCard);
