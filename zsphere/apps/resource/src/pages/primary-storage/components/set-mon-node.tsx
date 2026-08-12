import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputField,
  InputPasswordField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { CephMon as ICephMon } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createPrimaryStorageSetMonNodeSchema,
  type PrimaryStorageSetMonNodeFormValues,
} from "../action/schema";

interface IProps {
  current?: ICephMon;
  mons?: ICephMon[];
  onSubmit: Function;
}

const SetMonNode: React.FC<
  Omit<
    IActionWrapperProps<ICephMon>,
    "view" | "position" | "selectedList" | "setSelectedList"
  > &
    IProps
> = ({ visible, setVisible, current, mons, onSubmit }) => {
  const intl = useIntl();

  const defaultValues = useMemo<PrimaryStorageSetMonNodeFormValues>(() => {
    const value = {
      hostname: "",
      sshPort: "22",
      sshUsername: "root",
      sshPassword: "",
    };
    if (current) {
      value.hostname = current?.hostname || "";
      value.sshPort = current?.sshPort?.toString() || "22";
      value.sshUsername = current?.sshUsername || "root";
      value.sshPassword = current?.sshPassword || "";
    }
    return value;
  }, [current]);
  const formSchema = useMemo(
    () => createPrimaryStorageSetMonNodeSchema(intl, mons, current),
    [current, intl, mons],
  );
  const form = useForm<PrimaryStorageSetMonNodeFormValues>({
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

  const onOk = async ({
    hostname,
    sshPassword,
    sshPort,
    sshUsername,
  }: PrimaryStorageSetMonNodeFormValues) => {
    setVisible(false);
    onSubmit({ hostname, sshPassword, sshPort, sshUsername });
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={
        current
          ? intl.formatMessage({
              id: "modify.monNode",
              defaultMessage: "Modify Monitoring Node",
            })
          : intl.formatMessage({
              id: "set.monNode",
              defaultMessage: "Add Monitoring Node",
            })
      }
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="hostname"
            label={intl.formatMessage({
              id: "monNodeManageIP",
              defaultMessage: "Monitoring Node IP",
            })}
            required
            size="m"
          />
          <InputField
            form={form}
            label={intl.formatMessage({
              id: "sshPort",
              defaultMessage: "SSH Port",
            })}
            name="sshPort"
            required
            size="m"
          />
          <InputField
            form={form}
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
            name="sshUsername"
            required
            size="m"
          />
          <InputPasswordField
            form={form}
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
            name="sshPassword"
            required
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default SetMonNode;
