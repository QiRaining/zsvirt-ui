import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Markdown } from "@zstack/design";
import { SelectField, FieldStack } from "@zstack/form";
import { SwitchField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { compact } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createEditGuesttoolsConfigSchema,
  type EditGuesttoolsConfigFormValues,
} from "./schema";

const editVmGuestToolConfig = gql`
  mutation editVmGuestToolConfig($input: EditGuestToolConfigInput!) {
    editVmGuestToolConfig(input: $input) {
      actionId
    }
  }
`;

export const EditConfig: React.FC<{
  form: UseFormReturn<EditGuesttoolsConfigFormValues>;
}> = ({ form }) => {
  const intl = useIntl();

  const options = useMemo(
    () => [
      {
        value: "Preserve",
        label: intl.formatMessage({
          id: "Preserve",
          defaultMessage: "No Action",
        }),
      },
      {
        value: "Reboot",
        label: intl.formatMessage({ id: "Reboot", defaultMessage: "Reboot" }),
      },
      {
        value: "Shutdown",
        label: intl.formatMessage({
          id: "Shutdown",
          defaultMessage: "Shutdown",
        }),
      },
    ],
    [intl],
  );

  return (
    <FieldStack>
      <SelectField
        form={form}
        name="crashStrategy"
        label={intl.formatMessage({
          id: "crash.handle.strategy",
          defaultMessage: "Failure Response Policy",
        })}
        labelTooltip={
          <Markdown>
            {intl.formatMessage({
              id: "vm.crash.handle.strategy.tooltip",
              defaultMessage: `### Failure Response Policy

Set an automatic response action for VM failures (Windows BSOD or Linux guest hang).

- No Action (default): Maintains current state without intervention.
- Reboot: Automatically reboots the VM. Stops after 5 reboot attempts within 30 minutes.
- Shut Down: Automatically shuts down the VM.

Notes:

- You can set this policy for VMs with the x86_64 CPU architecture.
- Before setting this policy, install VMTools on the VM and make sure the VMTools is running properly.
- This policy takes effect immediately after configuration and does not require a VM reboot. `,
            })}
          </Markdown>
        }
        className="width-320"
        options={options}
      />
      <SwitchField
        form={form}
        name="timeSync"
        label={intl.formatMessage({
          id: "timeSync",
          defaultMessage: "Time Synchronization",
        })}
        labelTooltip={
          <Markdown>
            {intl.formatMessage({
              id: "vm.action.set.timeSync.tip",
              defaultMessage: `### Time Synchronization

1. Specifies whether to sync VM time with the host system time. If enabled, the VM time is the same as that of the host system. By default, the sync is disabled.

2. Note:

* Before you enable the sync, make sure that Qemu Guest Agent (QGA) is installed on the VM and is running. You can install VMTools to install QGA.
* After you enable time synchronization for a VM, the VM time is synchronized with the host system time automatically.
* If you disable time synchronization for a VM, the VM time is not synchronized with the host system time.`,
            })}
          </Markdown>
        }
      />
    </FieldStack>
  );
};

const Action: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
  refetch,
}) => {
  const doAction = useAction();
  const intl = useIntl();

  const vm = selectedList?.[0];

  const defaultValues = useMemo<EditGuesttoolsConfigFormValues>(
    () => ({
      crashStrategy: vm?.crashStrategy ?? "",
      timeSync: vm?.systemTag?.timeTrack !== "0",
    }),
    [vm],
  );
  const formSchema = useMemo(() => createEditGuesttoolsConfigSchema(), []);
  const form = useForm<EditGuesttoolsConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (data: Record<string, unknown>) => {
    const values = data as EditGuesttoolsConfigFormValues;

    const payload: any = {};
    if (values.crashStrategy !== vm?.crashStrategy) {
      payload.updateResourceConfigPayload = {
        resourceUuid: vm?.uuid,
        name: "crash.strategy",
        category: "vm",
        value: values.crashStrategy,
        uuid: "xxxx",
      };
    }

    const currentTimeSync = vm?.systemTag?.timeTrack !== "0";
    if (values.timeSync !== currentTimeSync) {
      payload.setVmClockTrackPayload = {
        uuid: vm?.uuid,
        clockTrack: vm?.systemTag?.clockTrack,
        syncAfterVMResume: null,
        intervalInSeconds: values.timeSync ? 60 : 0,
      };
    }

    if (compact(Object.values(payload))?.length === 0) {
      return;
    }

    doAction({
      mutation: editVmGuestToolConfig,
      payload,
      name: intl.formatMessage({
        id: "edit.guesttool.config",
        defaultMessage: "Modify VMTools Settings",
      }),
      total: 1,
      onProgress: () => {},
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "edit.guesttool.config",
        defaultMessage: "Modify VMTools Settings",
      })}
      form={dialogForm}
      onOk={onOk}
      alertType="warning"
      alertMessage={
        <Markdown>
          {intl.formatMessage({
            id: "vm.edit.guesttool.config.modal.set.alert.warning",
            defaultMessage:
              "You can set the Failure Response Policy for VMs with the x86_64 CPU architecture. Before setting this policy, install VMTools on the VM and make sure the VMTools is running properly.",
          })}
        </Markdown>
      }
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <EditConfig form={form} />
      </Form>
    </DialogForm>
  );
};

export default Action;
