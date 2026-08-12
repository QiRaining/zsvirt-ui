import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputPasswordField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import type React from "react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateBackupStoragePasswordSchema,
  type UpdateBackupStoragePasswordValues,
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

const Action: React.FC<IActionWrapperProps<IBackupStorage>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<UpdateBackupStoragePasswordValues>(
    () => ({
      password: "",
      confirmPassword: "",
    }),
    [],
  );
  const formSchema = useMemo(
    () => createUpdateBackupStoragePasswordSchema(intl),
    [intl],
  );
  const form = useForm<UpdateBackupStoragePasswordValues>({
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

  const onOk = async (values: UpdateBackupStoragePasswordValues) => {
    if (selectedList?.length) {
      const payload = {
        password: values?.password,
        uuid: selectedList[0].uuid,
      };
      doAction({
        mutation: updateImageStoreBackupStorage,
        payload,
        name: intl.formatMessage({
          id: "update.password",
          defaultMessage: "Update Password",
        }),
        type: "BackupStorage",
        total: selectedList.length,
        onFinish: () => {
          refetch?.();
        },
      });
    }
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "update.password",
        defaultMessage: "Update Password",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <FieldStack>
          <InputPasswordField
            form={form}
            name="password"
            label={intl.formatMessage({
              id: "new.password",
              defaultMessage: "New Password",
            })}
            required
            size="m"
          />
          <InputPasswordField
            form={form}
            name="confirmPassword"
            label={intl.formatMessage({
              id: "confirm.password",
              defaultMessage: "Confirm Password",
            })}
            required
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
