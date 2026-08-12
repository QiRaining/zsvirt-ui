import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { BackupStorageType } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import type React from "react";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createBackupStorageUpdateSchema,
  type BackupStorageUpdateValues,
} from "./schema";

const updateImageStoreBackupStorage = gql`
  mutation updateImageStoreBackupStorage(
    $input: UpdateImageStoreBackupStorageInput!
  ) {
    updateImageStoreBackupStorage(input: $input) {
      actionId
    }
  }
`;

const updateCephBackupStorage = gql`
  mutation updateCephBackupStorage($input: UpdateCephBackupStorageInput!) {
    updateCephBackupStorage(input: $input) {
      actionId
    }
  }
`;

const UpdateModal: React.FC<IActionWrapperProps<IBackupStorage>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<BackupStorageUpdateValues>(() => {
    const { name, description } = selectedList?.[0] || {};
    return {
      name: name ?? "",
      description: description ?? "",
    };
  }, [selectedList]);
  const formSchema = useMemo(
    () => createBackupStorageUpdateSchema(intl, selectedList?.[0]?.name),
    [intl, selectedList],
  );
  const form = useForm<BackupStorageUpdateValues>({
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

  const onOk = async (values: BackupStorageUpdateValues) => {
    let fn;
    switch (selectedList[0].type) {
      case BackupStorageType.ImageStoreBackupStorage:
        fn = updateImageStoreBackupStorage;
        break;
      case BackupStorageType.Ceph:
        fn = updateCephBackupStorage;
        break;
      default:
        fn = updateImageStoreBackupStorage;
        break;
    }
    doAction({
      mutation: fn,
      payload: {
        ...values,
        uuid: selectedList?.[0]?.uuid,
      },
      name: intl.formatMessage({
        id: "edit.nameAndDescription",
        defaultMessage: "Edit Name and Description",
      }),
      total: 1,
      type: "BackupStorage",
      onFinish: () => {
        setVisible(false);
        refetch?.();
      },
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "edit.nameAndDescription",
        defaultMessage: "Edit Name and Description",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({
              id: "name",
              defaultMessage: "Name",
            })}
            required
            size="m"
          />
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "introduction",
              defaultMessage: "Description",
            })}
            rows={3}
            limit={2000}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default UpdateModal;
