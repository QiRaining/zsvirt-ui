import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { FieldStack, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import { getModifedValues, formatResourceName } from "@zstack/zsphere-utils";
import type { FC } from "react";
import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createUpdateHostSshInfoSchema,
  type UpdateHostSshInfoFormValues,
} from "../schema";
import HostConfig from "./host-config";

const updateKVMHost = gql`
  mutation updateKVMHost($input: UpdateKVMHostInput!) {
    updateKVMHost(input: $input) {
      actionId
    }
  }
`;
const Action: FC<IActionWrapperProps<IHost>> = ({
  visible,
  setVisible,
  selectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const current = useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const [validateVisible, setValidateVisible] = useState(false);

  const title = intl.formatMessage({
    id: "update.ssh.info",
    defaultMessage: "Update SSH Information",
  });

  const defaultValues = useMemo<UpdateHostSshInfoFormValues>(
    () => ({
      managementIp: current.managementIp ?? "",
      sshPort: current.sshPort?.toString() ?? "",
      username: current.username ?? "",
      password: "",
    }),
    [current],
  );
  const formSchema = useMemo(() => createUpdateHostSshInfoSchema(intl), [intl]);
  const form = useForm<UpdateHostSshInfoFormValues>({
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

  const onOk = async (currentValues: UpdateHostSshInfoFormValues) => {
    setValidateVisible(false);
    const payload = getModifedValues(defaultValues, currentValues);
    payload.uuid = current.uuid;

    if (payload.sshPort) {
      payload.sshPort = Number(payload.sshPort);
    }
    await doAction({
      mutation: updateKVMHost,
      payload,
      name: title,
      total: 1,
      middleState: {
        type: "HostVO",
        uuids: [current.uuid],
        field: "status",
        data: {
          status: "Connecting",
        },
      },
      type: "HostVO",
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <>
      <DialogForm
        form={dialogForm}
        title={title}
        visible={visible}
        setVisible={setVisible}
        widthClassName="w-150"
        onOk={async () => {
          await dialogForm.validateFields();
          setValidateVisible(true);
          throw new Error("awaiting confirmation");
        }}
        onCancel={() => setVisible(false)}
        resourceName={formatResourceName(selectedList, intl)}
      >
        <Form {...form}>
          <FieldStack>
            <HostConfig form={form} />
          </FieldStack>
        </Form>
      </DialogForm>

      <DialogWeakP1
        visible={validateVisible}
        setVisible={setValidateVisible}
        type="warning"
        title={String(
          intl.formatMessage({
            id: "host.update.ssh.modal.confirm.title",
            defaultMessage: "Are you sure you want to modify the configuration and submit the request?",
          }),
        )}
        onConfirm={() => {
          onOk(form.getValues());
          setVisible(false);
        }}
        description={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "host.update.ssh.modal.confirm.msg",
              defaultMessage:
                "Detection of changes to host IP address, SSH port, and SSH username. Changing the host IP may cause the host to be disconnected. Please exercise caution when operating.",
            })}
          </ReactMarkdown>
        }
      />
    </>
  );
};

export default Action;
