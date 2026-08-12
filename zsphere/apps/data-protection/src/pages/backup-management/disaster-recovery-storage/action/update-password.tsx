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
import type { ZSVBackupStorage as IZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { UpdateZSVBackupStoragePassword } from "../../../../gql/disaster-recovery-storage.gql";
import ReconnectModal from "./reconnet";
import {
  createUpdateDisasterRecoveryStoragePasswordSchema,
  type UpdateDisasterRecoveryStoragePasswordFormValues,
} from "./schema";

const Action: React.FC<IActionWrapperProps<IZSVBackupStorage>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const [reconnectVisible, SetReconnectVisible] = useState(false);
  const [reconnectSelectedList, setReconnectSelectedList] = useState<
    IZSVBackupStorage[]
  >([]);
  const defaultValues =
    useMemo<UpdateDisasterRecoveryStoragePasswordFormValues>(
      () => ({
        password: "",
        repeatPassword: "",
      }),
      [],
    );
  const formSchema = useMemo(
    () => createUpdateDisasterRecoveryStoragePasswordSchema(intl),
    [intl],
  );
  const form = useForm<UpdateDisasterRecoveryStoragePasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const doAction = useAction();

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (
    values: UpdateDisasterRecoveryStoragePasswordFormValues,
  ) => {
    if (selectedList?.length) {
      // 保存当前选中的列表，用于后续的 reconnect 操作
      setReconnectSelectedList(selectedList);

      const payload = {
        type: selectedList?.[0]?.type,
        password: values.password,
        uuid: selectedList[0].uuid,
      };

      doAction({
        mutation: UpdateZSVBackupStoragePassword,
        payload,
        name: intl.formatMessage({
          id: "update.password",
          defaultMessage: "Update Password",
        }),
        total: 1,
        type: "ZSVBackupStorage",
        onFinish: () => {
          refetch?.();
          SetReconnectVisible(true);
        },
      });
    }
  };

  return (
    <>
      <DialogForm
        form={dialogForm}
        visible={visible}
        setVisible={setVisible}
        onOk={onOk}
        resourceName={selectedList?.[0]?.name}
        title={intl.formatMessage({
          id: "localBackupServer.modal.title.update.password",
          defaultMessage: "Update Password",
        })}
      >
        <Form {...form}>
          <FieldStack>
            <InputPasswordField
              form={form}
              name="password"
              label={intl.formatMessage({
                id: "password",
                defaultMessage: "Password",
              })}
              required
              size="m"
            />
            <InputPasswordField
              form={form}
              name="repeatPassword"
              label={intl.formatMessage({
                id: "vm.field.password.validator.confirm",
                defaultMessage: "Confirm Password",
              })}
              required
              size="m"
            />
          </FieldStack>
        </Form>
      </DialogForm>
      <ReconnectModal
        visible={reconnectVisible}
        setVisible={SetReconnectVisible}
        selectedList={reconnectSelectedList}
        setSelectedList={setSelectedList}
        view=""
        position="row"
      />
    </>
  );
};

export default Action;
