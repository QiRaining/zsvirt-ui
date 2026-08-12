import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputPasswordField, useDialogHookFormAdapter } from "@zstack/form";
import { Icon } from "@zstack/icon";
import { Alert } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BackupData, BackupDatabase } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import type { IConsole } from "./RecoverDbConsoleModal";
import { RecoverDatabaseStatus } from "./RecoverDbConsoleModal";
import {
  createRecoverDbConfirmSchema,
  type RecoverDbConfirmFormValues,
} from "./schema";

import styles from "./style.module.less";

const recoverDatabaseBackup = gql`
  mutation recoverDatabaseBackup($input: RecoverDatabaseBackupActionInput!) {
    recoverDatabaseBackup(input: $input) {
      actionId
    }
  }
`;

// 处理 wizard 情况
interface IWizardProps {
  onCancel?: () => void;
  getParams?: (password: string) => object;
}

const Action: React.FC<
  IActionWrapperProps<BackupData | BackupDatabase> & IConsole & IWizardProps
> = ({
  visible,
  selectedList,
  setVisible,
  setConsoleVis,
  setConsoleStatus,
  getParams,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<RecoverDbConfirmFormValues>(
    () => ({
      password: "",
    }),
    [],
  );
  const formSchema = useMemo(() => createRecoverDbConfirmSchema(intl), [intl]);
  const form = useForm<RecoverDbConfirmFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = (values: RecoverDbConfirmFormValues) => {
    return (
      doAction({
        mutation: recoverDatabaseBackup,
        payload: getParams
          ? getParams(values.password)
          : {
              uuid: selectedList[0].uuid,
              mysqlRootPassword: values.password,
            },
        name: intl.formatMessage({
          id: "recover.database",
          defaultMessage: "Recover Database",
        }),
        total: 1,
        onProgress(data: ITaskResult) {
          const { error } = data;

          const status = error?.status as RecoverDatabaseStatus;
          if (error) {
            if (RecoverDatabaseStatus[status]) {
              //启动完成
              setConsoleStatus(status);
            } else {
              //还没到websocket ， 密码Aciton 失败
              setConsoleVis(false);
            }
          }
        },
      }),
      setConsoleVis(true)
    );
  };

  const title = useMemo(() => {
    if (getParams) {
      return intl.formatMessage({
        id: "restore.platform.database",
        defaultMessage: "Restore Platform Database",
      });
    }

    return intl.formatMessage({
      id: "recover.platform.database",
      defaultMessage: "Restore Platform Database",
    });
  }, [getParams, intl]);

  return (
    <DialogForm
      form={dialogForm}
      onOk={onOk}
      resourceName={selectedList?.[0]?.name}
      visible={visible}
      setVisible={setVisible}
      title={title}
    >
      <Form {...form}>
        <div className={styles.formWrap}>
          <Alert
            display="blockStrong"
            message={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "restore.platform.database.alert.warning.message",
                  defaultMessage:
                    "1. Restoring the platform database requires a management node restart, during which the management interface will be unavailable. This process takes a few minutes and does not affect your resources.\n2. Resources deleted after the backup point will become invalid data and cannot be restored during the recovery.\n",
                })}
              </ReactMarkdown>
            }
            type="warning"
            showIcon
            icon={<Icon type="alert-triangle-fill" />}
          />
          <div className={styles.formItem}>
            <InputPasswordField
              form={form}
              name="password"
              label={intl.formatMessage({
                id: "platform.database.root.password",
                defaultMessage: "Database Root Password",
              })}
              required
              size="m"
            />
          </div>
        </div>
      </Form>
    </DialogForm>
  );
};

export default Action;
