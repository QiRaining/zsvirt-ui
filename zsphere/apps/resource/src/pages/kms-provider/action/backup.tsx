import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Form } from "@zstack/design";
import { FieldStack, InputPasswordField, RadioGroupField } from "@zstack/form";
import { DialogBase, DialogWeakP1 } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import { downloadFile } from "@zstack/zsphere-utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createBackupKmsProviderSchema,
  type BackupKmsProviderValues,
} from "./schema";

const backupNkp = gql`
  mutation backupNkp($input: BackupNkpInput!) {
    backupNkp(input: $input) {
      actionId
    }
  }
`;

const Backup: React.FC<IActionWrapperProps<Item>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const current = selectedList?.[0];
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmKey, setConfirmKey] = useState(0);
  const confirmResolveRef = useRef<(() => void) | null>(null);
  const defaultValues = useMemo<BackupKmsProviderValues>(
    () => ({
      backupMethod: "direct",
      password: "",
      confirmPassword: "",
    }),
    [],
  );
  const formSchema = useMemo(() => createBackupKmsProviderSchema(intl), [intl]);
  const form = useForm<BackupKmsProviderValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const backupMethod = form.watch("backupMethod");

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const waitConfirm = () => {
    return new Promise<void>((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmKey((k) => k + 1);
      setConfirmVisible(true);
    });
  };

  const onOk = async (values: BackupKmsProviderValues) => {
    if (values.backupMethod === "password") {
      await waitConfirm();
    }
    if (!current?.uuid) {
      return;
    }
    const payload: {
      uuid: string;
      password?: string;
    } = {
      uuid: current.uuid,
    };
    if (values.backupMethod === "password") {
      payload.password = values.password;
    }
    doAction({
      mutation: backupNkp,
      payload,
      name: intl.formatMessage({
        id: "backup.kmsProvider",
        defaultMessage: "Back Up Key Provider",
      }),
      total: 1,
      type: "KmsProvider",
      forceRunCallback: true,
      onFinish: (result: IActionResult) => {
        const content = result?.inventory?.content;
        if (content) {
          downloadFile(`${current.name}.bak`, content);
        }
        setTimeout(() => {
          setVisible(false);
        }, 0);
      },
    });
  };

  const footer = (
    <>
      <Button variant="subtle" onClick={() => setVisible(false)}>
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      <Button
        variant="primary"
        onClick={async () => {
          const isValid = await form.trigger();
          if (isValid) {
            await onOk(form.getValues());
          }
        }}
      >
        {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
      </Button>
    </>
  );

  return (
    <>
      <DialogBase
        visible={visible}
        setVisible={setVisible}
        title={intl.formatMessage({
          id: "backup.kmsProvider",
          defaultMessage: "Back Up Key Provider",
        })}
        footer={footer}
      >
        <Alert variant="warning" style={{ marginBottom: 16 }}>
          {intl.formatMessage({
            id: "kmsProvider.backup.alert",
            defaultMessage:
              "Backing up the Native Key Provider without password protection exposes its configuration data and the virtual machines encrypted with key providers to potential security threats.",
          })}
        </Alert>
        <Form {...form}>
          <FieldStack>
            <RadioGroupField
              form={form}
              name="backupMethod"
              label={intl.formatMessage({
                id: "backup.method",
                defaultMessage: "Backup Mode",
              })}
              options={[
                {
                  value: "direct",
                  label: intl.formatMessage({
                    id: "backup.method.direct",
                    defaultMessage: "Without Password Protection",
                  }),
                },
                {
                  value: "password",
                  label: intl.formatMessage({
                    id: "backup.method.password",
                    defaultMessage: "Password Protection",
                  }),
                },
              ]}
            />
            {backupMethod === "password" ? (
              <FieldStack className="border-l border-neutral-300 pl-3">
                <InputPasswordField
                  form={form}
                  name="password"
                  label={intl.formatMessage({
                    id: "password",
                    defaultMessage: "Password",
                  })}
                  required
                  size="m"
                  rowClassName="grid grid-cols-[148px_1fr] gap-2"
                  labelClassName="!w-[148px] !min-w-0"
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
                  rowClassName="grid grid-cols-[148px_1fr] gap-2"
                  labelClassName="!w-[148px] !min-w-0"
                />
              </FieldStack>
            ) : null}
          </FieldStack>
        </Form>
      </DialogBase>
      <DialogWeakP1
        key={confirmKey}
        visible={confirmVisible}
        setVisible={setConfirmVisible}
        title={intl.formatMessage({
          id: "kmsProvider.backup.confirm.title",
          defaultMessage: "Save Your Password Securely",
        })}
        description={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "kmsProvider.backup.confirm.message",
              defaultMessage:
                "The platform cannot access or recover the password you set. Make sure this password is securely saved, as it will be required to restore the Native Key Provider configuration in case of disaster.\n\nIf you forget or lose the password:\n\n- The key provider cannot be restored.\n- Encrypted resources (such as TPM-enabled VMs and encrypted VMs) that depend on this key provider will become inaccessible.",
            })}
          </ReactMarkdown>
        }
        onConfirm={() => {
          setConfirmVisible(false);
          setVisible(false);
          confirmResolveRef.current?.();
        }}
      />
    </>
  );
};

export default Backup;
