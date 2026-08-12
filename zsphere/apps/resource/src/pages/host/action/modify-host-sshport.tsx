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
  createModifyHostSshPortSchema,
  type ModifyHostSshPortFormValues,
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
    const value: ModifyHostSshPortFormValues = {
      sshPort: "0",
    };
    if (selectedList?.length) {
      value.sshPort = String(selectedList[0].sshPort ?? 0);
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(() => createModifyHostSshPortSchema(intl), [intl]);
  const form = useForm<ModifyHostSshPortFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: ModifyHostSshPortFormValues) => {
    if (selectedList?.length) {
      const payload = {
        sshPort: Number(values.sshPort),
        uuid: selectedList[0].uuid,
      };
      doAction({
        mutation: updateKVMHost,
        payload,
        name: intl.formatMessage({
          id: "modify.hostSshPort",
          defaultMessage: "Modify Host SSH Port",
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
          const sshPortError = form.getFieldState("sshPort").error;
          throw {
            errorFields: [
              {
                name: ["sshPort"],
                errors: sshPortError?.message ? [sshPortError.message] : [],
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
        id: "host.modal.title.confirm.modify.sshPort",
        defaultMessage: "Edit SSH Port",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="sshPort"
          label={intl.formatMessage({
            id: "sshPort",
            defaultMessage: "SSH Port",
          })}
          required
          className={styles["width-80"]}
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
