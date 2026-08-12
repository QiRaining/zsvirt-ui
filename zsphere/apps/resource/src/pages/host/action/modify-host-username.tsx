import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateKVMHost } from "../../../gql/host.gql";
import {
  createModifyHostUsernameSchema,
  type ModifyHostUsernameFormValues,
} from "./schema";

import styles from "./style.module.less";

const Action: React.FC<IActionWrapperProps<IHost>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo(() => {
    const value: ModifyHostUsernameFormValues = {
      username: "",
    };
    if (selectedList?.length) {
      value.username = selectedList[0].username ?? "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createModifyHostUsernameSchema(intl),
    [intl],
  );
  const form = useForm<ModifyHostUsernameFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: ModifyHostUsernameFormValues) => {
    if (selectedList?.length) {
      const payload = {
        ...values,
        uuid: selectedList[0].uuid,
      };
      doAction({
        mutation: updateKVMHost,
        payload,
        name: intl.formatMessage({
          id: "modify.ssh.username",
          defaultMessage: "Modify SSH Username",
        }),
        total: 1,
        onFinish: () => {
          refetch?.();
        },
        type: "HostVO",
      });
      setVisible(false);
    }
  };

  const dialogForm = useMemo(
    () => ({
      validateFields: async () => {
        const isValid = await form.trigger();

        if (!isValid) {
          const usernameError = form.getFieldState("username").error;
          throw {
            errorFields: [
              {
                name: ["username"],
                errors: usernameError?.message ? [usernameError.message] : [],
              },
            ],
          };
        }

        return form.getValues();
      },
      resetFields: () => {
        form.reset(defaultValues);
      },
    }),
    [defaultValues, form],
  );

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "host.modal.title.confirm.modify.ssh.username",
        defaultMessage: "Modify SSH Username",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="username"
          label={intl.formatMessage({
            id: "ssh.username",
            defaultMessage: "SSH Username",
          })}
          required
          className={styles["width-320"]}
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
