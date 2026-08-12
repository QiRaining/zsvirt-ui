import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createStorageAdapterIdentifierSchema,
  type StorageAdapterIdentifierFormValues,
} from "./schema";

const updateHostIdentifier = gql`
  mutation updateHostIdentifier($input: UpdateHostIdentifierInput!) {
    updateHostIdentifier(input: $input) {
      actionId
    }
  }
`;

export default function Edit({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<any>) {
  const intl = useIntl();
  const doAction = useAction();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const current = selectedList[0];

  const needValidate = useSensitiveJudge();
  const defaultValues = useMemo<StorageAdapterIdentifierFormValues>(
    () => ({
      identifier: current?.identifier?.trim() ?? "",
    }),
    [current?.identifier],
  );
  const formSchema = useMemo(
    () => createStorageAdapterIdentifierSchema(intl, current?.type),
    [intl, current?.type],
  );
  const form = useForm<StorageAdapterIdentifierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = () => {
    const values = form.getValues();
    doAction({
      mutation: updateHostIdentifier,
      payload: {
        uuid: current?.hostUuid ?? "",
        type: current?.type,
        identifier: values.identifier?.trim() ?? "",
      },
      name: intl.formatMessage({
        id: "virtualization.edit.config",
        defaultMessage: "Modify Configuration",
      }),
      total: 1,
      type: "StorageAdapter",
    });
    setVisible(false);
  };

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [visible, defaultValues, form]);

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "virtualization.edit.config",
        defaultMessage: "Modify Configuration",
      })}
      onOk={() => setConfirmModalVisible(true)}
      onCancel={() => setVisible(false)}
      resourceName={current?.name}
      alertType="danger"
      alertMessage={intl.formatMessage({
        id: "storage.adapter.edit.config.field.identifier.warning",
        defaultMessage:
          "Changing the identifier will restart the storage adapter. If a virtual machine is using the LUN during the restart, it may affect I/O operations and pose a risk of data loss. Proceed with caution.",
      })}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="identifier"
          label={intl.formatMessage({
            id: "storage.adapter.identifier",
            defaultMessage: "Identifier",
          })}
          required
          size="m"
        />
        <DialogP0Smart
          resourceType={intl.formatMessage({
            id: "storage.adapter",
            defaultMessage: "Storage Adapter",
          })}
          resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
          visible={confirmModalVisible}
          setVisible={setConfirmModalVisible}
          onConfirm={() => {
            onOk();
          }}
          needValidate={needValidate}
          guide={{
            confirmWord: intl.formatMessage({
              id: "modify",
              defaultMessage: "Edit",
            }),
          }}
          title={intl.formatMessage({
            id: "storage.adapter.edit.config.confirm.edit.title",
            defaultMessage: "Modify Configuration?",
          })}
          bannerMessage={intl.formatMessage({
            id: "storage.adapter.edit.config.field.identifier.warning",
            defaultMessage:
              "Changing the identifier will restart the storage adapter. If a virtual machine is using the LUN during the restart, it may affect I/O operations and pose a risk of data loss. Proceed with caution.",
          })}
        />
      </Form>
    </DialogForm>
  );
}
