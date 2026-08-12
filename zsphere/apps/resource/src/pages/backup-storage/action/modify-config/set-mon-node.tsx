import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormItem, FormLabel } from "@zstack/design";
import {
  FieldStack,
  InputField,
  InputNumberField,
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
  createBackupStorageSetMonNodeSchema,
  type BackupStorageSetMonNodeFormValues,
} from "../schema";

interface IProps {
  current?: ICephMon;
  onSubmit: Function;
}

const Action: React.FC<
  Omit<
    IActionWrapperProps<ICephMon>,
    "view" | "position" | "selectedList" | "setSelectedList"
  > &
    IProps
> = ({ visible, setVisible, current, onSubmit }) => {
  const intl = useIntl();

  const defaultValues = useMemo<BackupStorageSetMonNodeFormValues>(() => {
    const value = {
      hostname: "",
      sshPort: 22,
      sshUsername: "root",
      sshPassword: "",
    };
    if (current) {
      value.hostname = current?.hostname || "";
      value.sshPort = current?.sshPort || 22;
      value.sshUsername = current?.sshUsername || "root";
      value.sshPassword = current?.sshPassword || "";
    }
    return value;
  }, [current]);
  const formSchema = useMemo(
    () =>
      createBackupStorageSetMonNodeSchema(intl, {
        current,
        requirePassword: !current?.hostname,
      }),
    [current, intl],
  );
  const form = useForm<BackupStorageSetMonNodeFormValues>({
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
    sshPassword = defaultValues?.sshPassword,
    sshPort,
    sshUsername,
  }: BackupStorageSetMonNodeFormValues) => {
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
          {current?.hostname ? (
            <FormItem className="flex flex-row gap-2">
              <FormLabel className="mt-[5px] flex">
                {intl.formatMessage({
                  id: "monNodeManageIP",
                  defaultMessage: "Monitoring Node IP",
                })}
              </FormLabel>
              <div className="flex min-h-8 items-center text-neutral-700">
                {current.hostname}
              </div>
            </FormItem>
          ) : (
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
          )}
          <InputNumberField
            form={form}
            label={intl.formatMessage({
              id: "sshPort",
              defaultMessage: "SSH Port",
            })}
            name="sshPort"
            required
            controls={false}
            className="w-80"
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
          {!current?.hostname && (
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
          )}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
