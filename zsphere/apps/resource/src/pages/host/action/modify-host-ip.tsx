import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, Form } from "@zstack/design";
import { FieldStack, InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";

import { updateKVMHost } from "../../../gql/host.gql";
import {
  createModifyHostIpSchema,
  type ModifyHostIpFormValues,
} from "./schema";

const CHECKBOX_ITEM_STYLE = {
  marginLeft: "170px",
  lineHeight: "22px",
} as const;

const Action: React.FC<IActionWrapperProps<IHost>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<ModifyHostIpFormValues>(() => {
    const value: ModifyHostIpFormValues = {
      managementIp: "",
      checked: false,
    };
    if (selectedList?.length) {
      value.managementIp = selectedList[0].managementIp ?? "";
    }
    return value;
  }, [selectedList]);

  const formSchema = useMemo(() => createModifyHostIpSchema(intl), [intl]);
  const form = useForm<ModifyHostIpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: ModifyHostIpFormValues) => {
    if (selectedList?.length) {
      const payload = {
        managementIp: values?.managementIp,
        uuid: selectedList[0].uuid,
      };
      doAction({
        mutation: updateKVMHost,
        payload,
        name: intl.formatMessage({
          id: "modify.hostIp",
          defaultMessage: "Modify Host IP",
        }),
        total: 1,
        onFinish: () => {
          refetch?.();
        },
        type: "HostVO",
      });
      setVisible(false);
    }
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "host.modal.title.confirm.modify.hostIp",
        defaultMessage: "Modify Host IP",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      alertMessage={intl.formatMessage({
        id: "host.modal.modify.hostIp.alert.danger",
        defaultMessage: "Modifying a host may cause host disconnection. Proceed with caution.",
      })}
      alertType="danger"
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="managementIp"
            label={intl.formatMessage({
              id: "hostIp",
              defaultMessage: "Host IP",
            })}
            required
            size="m"
          />
          <div style={CHECKBOX_ITEM_STYLE}>
            <FormCheckbox
              checked={form.watch("checked")}
              onChange={(checked) => {
                form.setValue("checked", checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              label={intl.formatMessage({
                id: "host.modal.modify.extra.hostIp",
                defaultMessage: "I acknowledge",
              })}
            />
            {form.formState.errors.checked?.message ? (
              <div className="text-danger-500 mt-1 text-xs font-normal">
                {form.formState.errors.checked.message}
              </div>
            ) : null}
          </div>
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
