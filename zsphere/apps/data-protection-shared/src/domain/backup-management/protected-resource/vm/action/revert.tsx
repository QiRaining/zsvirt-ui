import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Text,
} from "@zstack/design";
import { useDialogHookFormAdapter, FieldStack } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmInstanceState } from "@zstack/zsphere-types";
import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createRevertBackupDataSchema,
  type RevertBackupDataFormValues,
} from "./schema";

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

const zsvRecoverBackupData = gql`
  mutation zsvRecoverBackupData($input: ZSVRecoverBackupDataInput!) {
    zsvRecoverBackupData(input: $input) {
      actionId
    }
  }
`;

const RevertAction: React.FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  source,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const current = selectedList?.[0];
  const [revertVisible, setRevertVisible] = useState<boolean>(false);
  const defaultValues = useMemo<RevertBackupDataFormValues>(
    () => ({
      recoveryStart: undefined,
    }),
    [],
  );
  const formSchema = useMemo(() => createRevertBackupDataSchema(), []);
  const form = useForm<RevertBackupDataFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible || revertVisible) {
      form.reset(defaultValues);
    }
  }, [current, defaultValues, form, visible, revertVisible]);

  const onOk = (values: RevertBackupDataFormValues) => {
    const { recoveryStart } = values;

    const payload = {
      uuid: current?.uuid,
      vmUuid: current?.vmInstance?.uuid,
      isStartVm: recoveryStart,
      isStopVm: revertVisible,
      zoneUuid: current?.vmInstance?.zoneUuid,
    };

    doAction({
      mutation: zsvRecoverBackupData,
      payload,
      name: intl.formatMessage({
        id: "revert.backup.data",
        defaultMessage: "Recover Backup Data",
      }),
      total: 1,
      type: "BackupData",
      onFinish: () => {
        setVisible(false);
        setRevertVisible(false);
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  const onCancel = () => {
    form.reset(defaultValues);
  };

  const confirmOk = () => {
    setVisible(false);
    setRevertVisible(true);
  };

  const stopVmConfirm = (
    <DialogWeakP1
      visible={visible}
      setVisible={setVisible}
      type="warning"
      title={intl.formatMessage({
        id: "unable.to.restore.vm.title",
        defaultMessage: "Cannot Restore Virtual Machine",
      })}
      description={intl.formatMessage({
        id: "unable.to.restore.vm.warning",
        defaultMessage: `To restore a VM, you need to shut down the VM first. Proceed with this action by selecting the "Shut Down VM" checkbox.`,
      })}
      onConfirm={({ checked }) => {
        if (checked) {
          confirmOk?.();
        }
      }}
    />
  );

  const getRevertModal = (
    _visible: boolean,
    _setVisible: (visible: boolean) => void,
  ) => {
    return (
      <DialogForm
        visible={_visible}
        setVisible={_setVisible}
        widthClassName="w-150"
        alertType="warning"
        alertMessage={intl.formatMessage({
          id: "restore.vm.alert.warning.message",
          defaultMessage:
            "Restoring a VM overwrites the existing data with the selected backup data. Proceed with caution.",
        })}
        title={intl.formatMessage({
          id: "overwrite.revert.vm.title",
          defaultMessage: "Restore Virtual Machine",
        })}
        form={dialogForm}
        onOk={onOk}
        onCancel={onCancel}
      >
        <Form {...form}>
          <FieldStack>
            <FormItem className="flex flex-row gap-2">
              <FormLabel>
                {intl.formatMessage({
                  id: "name",
                  defaultMessage: "Name",
                })}
              </FormLabel>
              <Text>
                {source?.name ||
                  current?.vmInstance?.name ||
                  current?.attachedVmName}
              </Text>
            </FormItem>

            <FormField
              control={form.control}
              name="recoveryStart"
              render={({ field }) => (
                <FormItem className="flex flex-row gap-2">
                  <FormLabel>
                    {intl.formatMessage({
                      id: "start.after.recovery",
                      defaultMessage: "Power Status",
                    })}
                  </FormLabel>
                  <FormControl>
                    <FormCheckbox
                      checked={field.value}
                      onChange={field.onChange}
                      label={intl.formatMessage({
                        id: "automatically.start.virtualmachine.after.recovery",
                        defaultMessage: "Power on after recovery",
                      })}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </FieldStack>
        </Form>
      </DialogForm>
    );
  };

  if (current?.vmInstance?.state !== VmInstanceState.Stopped) {
    return (
      <>
        {stopVmConfirm}
        {getRevertModal(revertVisible, setRevertVisible)}
      </>
    );
  }

  return <>{getRevertModal(visible, setVisible)}</>;
};

export default RevertAction;
