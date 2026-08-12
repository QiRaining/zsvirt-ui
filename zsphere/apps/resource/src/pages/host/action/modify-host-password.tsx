import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputPasswordField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateKVMHost } from "../../../gql/host.gql";
import {
  createModifyHostPasswordSchema,
  type ModifyHostPasswordFormValues,
} from "./schema";

import styles from "./style.module.less";

const Action: React.FC<IActionWrapperProps<IHost>> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<ModifyHostPasswordFormValues>(
    () => ({
      password: "",
    }),
    [],
  );
  const formSchema = useMemo(
    () => createModifyHostPasswordSchema(intl),
    [intl],
  );
  const form = useForm<ModifyHostPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = async (values: ModifyHostPasswordFormValues) => {
    if (selectedList?.length) {
      const payload = {
        password: values?.password,
        uuid: selectedList[0].uuid,
      };
      doAction({
        mutation: updateKVMHost,
        payload,
        name: intl.formatMessage({
          id: "update.hostPassword",
          defaultMessage: "Update Host Password",
        }),
        total: selectedList.length,
        onFinish: () => {
          refetch?.();
          setSelectedList?.([]);
        },
        type: "HostVO",
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
    >
      <Form {...form}>
        <InputPasswordField
          form={form}
          name="password"
          label={intl.formatMessage({ id: "password", defaultMessage: "Password" })}
          required
          className={styles["width-320"]}
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
