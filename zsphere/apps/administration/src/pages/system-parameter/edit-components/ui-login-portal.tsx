import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@zstack/design";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  type SelectOptions,
} from "@zstack/design";
import { SelectField } from "@zstack/form";
import { useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createUiLoginPortalSchema,
  type DynamicGlobalConfigFormValues,
} from "./schema";
export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

interface ISelectProps {
  value: string | number;
  displayName: string;
}

const STYLE_INLINE_FLEX = { display: "inline-flex" } as const;
const STYLE_MARGIN_LEFT_8_TOP_5 = { marginLeft: 8, marginTop: 5 } as const;

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

const UILoginPortal: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const fieldName = currItem?.formItem?.name ?? "value";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [fieldName]: currItem?.formItem?.value,
      acceptRisk: false,
    }),
    [currItem?.formItem?.value, fieldName],
  );
  const options = useMemo<SelectOptions[]>(
    () =>
      currItem?.formItem?.selectList?.map((it: ISelectProps) => ({
        value: it.value,
        label: it.displayName,
      })) ?? [],
    [currItem?.formItem?.selectList],
  );
  const formSchema = useMemo(
    () => createUiLoginPortalSchema(intl, fieldName, currItem?.formItem?.rules),
    [currItem?.formItem?.rules, fieldName, intl],
  );
  const form = useForm<DynamicGlobalConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    return ok(
      [
        {
          category: currItem?.formItem?.category,
          name: currItem?.formItem?.name,
          value: `${values[fieldName]}`,
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
        <div style={STYLE_INLINE_FLEX}>
          <SelectField
            form={form}
            label={currItem?.name}
            name={fieldName}
            labelTooltip={
              <ReactMarkdown>{currItem?.description}</ReactMarkdown>
            }
            options={options}
            required
            className="w-60"
          />
          <span style={STYLE_MARGIN_LEFT_8_TOP_5}>
            {currItem?.formItem?.unitList?.[0]?.displayName}
          </span>
        </div>
        <FormField
          control={form.control}
          name="acceptRisk"
          render={({ field }) => (
            <FormItem>
              <FormCheckbox
                checked={Boolean(field.value)}
                label={intl.formatMessage({
                  id: "iUnderstand",
                  defaultMessage: "I acknowledge",
                })}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </DialogForm>
  );
};

export default UILoginPortal;
