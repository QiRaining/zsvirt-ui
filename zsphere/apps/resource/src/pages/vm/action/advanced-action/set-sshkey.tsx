import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { TextareaField, useDialogHookFormAdapter } from "@zstack/form";
import { setVmSshKey } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { createSetSshKeySchema, type SetSshKeyFormValues } from "./schema";

const Action: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const vm = selectedList[0];
  const defaultValues = useMemo<SetSshKeyFormValues>(
    () => ({
      sshkey: vm?.systemTag?.sshkey ?? "",
    }),
    [vm],
  );
  const formSchema = useMemo(() => createSetSshKeySchema(intl), [intl]);
  const form = useForm<SetSshKeyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = async (values: SetSshKeyFormValues) => {
    doAction({
      mutation: setVmSshKey,
      payload: {
        uuid: vm.uuid,
        SshKey: values.sshkey,
      },
      name: intl.formatMessage({
        id: "set.sshkey",
        defaultMessage: "Set SSH KEY",
      }),
      total: selectedList.length,
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      form={dialogForm}
      alertType="warning"
      alertMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "vm.sshkey.modal.set.alert.warning",
            defaultMessage:
              "1. To use SSH keys, preinstall Cloud-Init.\n2. SSH key injection takes effect on the first boot of virtual machines. If you have injected SSH keys into virtual machines, run rm -rf /var/lib/cloud/instances to clean up the previous configurations, inject new SSH keys, and finally reboot virtual machines.",
          })}
        </ReactMarkdown>
      }
      title={intl.formatMessage({
        id: "set.sshkey",
        defaultMessage: "Set SSH KEY",
      })}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <TextareaField
          form={form}
          name="sshkey"
          label="SSH KEY"
          required
          size="m"
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
