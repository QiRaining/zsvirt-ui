import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  UpdateZSVBackupStoragePayload as IUpdateZSVBackupStoragePayload,
  ZSVBackupStorage as IZSVBackupStorage,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateZSVBackupStorage } from "../../../../gql/disaster-recovery-storage.gql";
import {
  createDisasterRecoveryStorageNameDescSchema,
  type DisasterRecoveryStorageNameDescFormValues,
} from "./schema";

const Action: React.FC<IActionWrapperProps<IZSVBackupStorage>> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();

  const doAction = useAction();

  const defaultValues =
    useMemo<DisasterRecoveryStorageNameDescFormValues>(() => {
      const value: DisasterRecoveryStorageNameDescFormValues = {
        name: "",
        description: "",
      };
      if (selectedList?.length) {
        value.name = selectedList[0].name ?? "";
        value.description = selectedList[0].description ?? "";
      }
      return value;
    }, [selectedList]);
  const formSchema = useMemo(
    () => createDisasterRecoveryStorageNameDescSchema(intl),
    [intl],
  );
  const form = useForm<DisasterRecoveryStorageNameDescFormValues>({
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

  const onOk = async (values: DisasterRecoveryStorageNameDescFormValues) => {
    const payload: IUpdateZSVBackupStoragePayload[] = selectedList.map(
      (item) => {
        return { uuid: item.uuid, ...values };
      },
    );
    doAction({
      mutation: updateZSVBackupStorage,
      payload,
      type: "ZSVBackupStorage",
      name: intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      total: selectedList.length,
      onFinish: (_result: IActionResult) => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
    setVisible(false);
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      })}
      resourceName={selectedList?.[0]?.name || ""}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
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
            size="m"
            maxLength={2000}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
