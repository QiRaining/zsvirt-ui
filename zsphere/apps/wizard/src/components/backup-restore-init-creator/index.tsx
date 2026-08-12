import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { ZSVForm, ModalSelect, Form, Input } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { BackupDataFormImageStorage } from "@zstack/zsphere-types/graphql";
import { isIP, isPort, isPath } from "@zstack/zsphere-utils";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import RecoverDbConfirmModal from "zsv_data_protection/backup-management/protected-resource/action/platform-database/overwrite-revert-database";
import DbBackupDatalist from "zsv_data_protection/backup-management/protected-resource/platformDatabase/components/db-backup-data/list";

import { ErrorField } from "../../utils/error-field";

import styles from "./style.module.less";

interface IBackupRestoreInitCreatorProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

type ConnectionStatus = "disabled" | "initial" | "success" | "failed";

interface FormValues {
  hostname: string;
  url: string;
  sshPort: string;
  username: string;
  password: string;
  dbbackupdata: any;
  testConnError?: string;
}

const { Card } = ZSVForm;

const testDatabaseBackupStorageConnection = gql`
  mutation testDatabaseBackupStorageConnection(
    $input: TestDatabaseBackupStorageConnectionInput!
  ) {
    testDatabaseBackupStorageConnection(input: $input) {
      actionId
    }
  }
`;

const BackupRestoreInitCreator: FC<IBackupRestoreInitCreatorProps> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm<FormValues>();
  const { isRequired } = useValidator(intl);
  const doAction = useAction();
  const [recoverDbVisible, setRecoverDbVisible] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disabled");
  const [backupStorageUrl, setBackupStorageUrl] = useState<string>("");
  const [dbbackupdata, setDbbackupdata] = useState<
    BackupDataFormImageStorage[]
  >([]);

  const handleFinish = (_values: any) => {
    setRecoverDbVisible(true);
  };

  const validIp = async (_rule: any, value: string) => {
    if (!value) {
      throw intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      });
    }
    if (isIP(value)) {
      return;
    }
    throw intl.formatMessage({
      id: "field.ip.validator.format",
      defaultMessage: "Invalid IP address",
    });
  };

  const handleFormChange = () => {
    const { hostname, sshPort, username, password } =
      form?.getFieldsValue() ?? {};
    if (hostname && sshPort && username && password) {
      setConnectionStatus("initial");
    } else {
      setConnectionStatus("disabled");
    }
  };

  const testConnection = async () => {
    form.setFieldsValue({ testConnError: "" });
    await form.validateFields([
      "hostname",
      "url",
      "sshPort",
      "username",
      "password",
    ]);
    const { hostname, sshPort, username, password, url } = form.getFieldsValue([
      "password",
      "hostname",
      "sshPort",
      "username",
      "url",
    ]);

    if (hostname && sshPort && username && password && url) {
      setConnectionStatus("initial");
    } else {
      setConnectionStatus("disabled");
    }

    doAction({
      mutation: testDatabaseBackupStorageConnection,
      payload: {
        url: `ssh://${username}:${encodeURIComponent(password)}@${hostname}:${sshPort}${url}`,
      },
      name: intl.formatMessage({
        id: "test.connection",
        defaultMessage: "Test Connection",
      }),
      total: 1,
      onFinish: (result) => {
        if (result?.inventory?.success) {
          setConnectionStatus("success");
          setBackupStorageUrl(
            `ssh://${username}:${encodeURIComponent(password)}@${hostname}:${sshPort}${url}`,
          );
        } else {
          setConnectionStatus("failed");
          form.setFieldsValue({
            testConnError: intl.formatMessage({
              id: "add.backup.storage.error.connection.fail",
              defaultMessage: "Connection Failed. Check your configurations.",
            }),
          });
        }
      },
    });
  };

  useEffect(() => {
    const { hostname, sshPort, username, password, url } =
      form?.getFieldsValue() ?? {};

    if (hostname && sshPort && username && password && url) {
      setConnectionStatus("initial");
    } else {
      setConnectionStatus("disabled");
    }
  }, [form]);

  const defaultQuery = useMemo<IQuery>(() => {
    const { hostname, sshPort, username, password, url } =
      form?.getFieldsValue() ?? {};

    if (
      connectionStatus === "success" &&
      hostname &&
      sshPort &&
      username &&
      password &&
      url
    ) {
      return {
        conditions: [
          {
            key: "url",
            op: Op.eq,
            value: `ssh://${username}:${encodeURIComponent(password)}@${hostname}:${sshPort}${url}`,
          },
        ],
      };
    }
    return {};
  }, [connectionStatus, form]);

  return (
    <>
      <DialogForm
        title={intl.formatMessage({
          id: "backup.restore.init.title",
          defaultMessage: "Restore from Backup Data",
        })}
        visible={visible}
        setVisible={setVisible}
        widthClassName="w-150"
        form={form}
        onOk={handleFinish}
        onCancel={() => setVisible(false)}
        className={styles["backup-restore-init-creator"]}
      >
        <Form
          form={form}
          initialValues={{
            sshPort: "22",
          }}
        >
          <Card
            title={intl.formatMessage({
              id: "server.config",
              defaultMessage: "Server Configurations",
            })}
          >
            <Form.Item
              name="hostname"
              label={intl.formatMessage({
                id: "backup.storage.ip",
                defaultMessage: "Backup Storage IP",
              })}
              required
              rules={[{ validator: validIp }]}
            >
              <Input className="width-320" onChange={handleFormChange} />
            </Form.Item>

            <Form.Item
              name="url"
              label={intl.formatMessage({
                id: "backup.storage.url",
                defaultMessage: "URL",
              })}
              validateTrigger="onBlur"
              required
              rules={[
                isRequired(),
                {
                  validator(rule, value: string) {
                    if (!isPath(value)) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "backup.server.form.url.validator.format",
                          defaultMessage: "Invalid URL.",
                        }),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input className="width-320" onChange={handleFormChange} />
            </Form.Item>

            <Form.Item
              name="sshPort"
              label={intl.formatMessage({
                id: "ssh.port",
                defaultMessage: "SSH Port",
              })}
              required
              rules={[
                isRequired(),
                {
                  validator: (_rule, value) => {
                    if (!isPort(value)) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "field.port.validator.format",
                          defaultMessage: "Invalid port.",
                        }),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input className="width-80" onChange={handleFormChange} />
            </Form.Item>

            <Form.Item
              name="username"
              label={intl.formatMessage({
                id: "username",
                defaultMessage: "Username",
              })}
              required
              rules={[isRequired()]}
            >
              <Input className="width-320" onChange={handleFormChange} />
            </Form.Item>

            <Form.Item
              required
              label={intl.formatMessage({
                id: "password",
                defaultMessage: "Password",
              })}
            >
              <Form.Item
                noStyle
                name="password"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: "global.field.validator.input.required",
                      defaultMessage: "This field is required.",
                    }),
                  },
                ]}
              >
                <Input.Password
                  className={styles["width-235"]}
                  onChange={handleFormChange}
                />
              </Form.Item>
              <Button
                className={styles["test-connect"]}
                disabled={connectionStatus === "disabled"}
                onClick={async () => {
                  testConnection();
                }}
                style={{ display: "inline-block" }}
              >
                {intl.formatMessage({
                  id: "test.connect",
                  defaultMessage: "Test Connection",
                })}
              </Button>
              <Form.Item noStyle name="testConnError">
                <ErrorField className={styles["error-field"]} />
              </Form.Item>
            </Form.Item>
          </Card>

          <Card
            title={intl.formatMessage({
              id: "backup.data.config",
              defaultMessage: "Backup Data Configurations",
            })}
          >
            <Form.Item
              name="dbbackupdata"
              label={intl.formatMessage({
                id: "backup.storage.data.db",
                defaultMessage: "Database Backup",
              })}
              required
              rules={[
                {
                  validator: (_rule, value) => {
                    if (!value) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "global.field.validator.select.dbbackupdata.required",
                          defaultMessage: "This field is required.",
                        }),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              tooltip={
                connectionStatus !== "success"
                  ? intl.formatMessage({
                      id: "please.test.connection.backup.storage.ip",
                      defaultMessage:
                        "To select a platform database backup, test connection to the backup storage first.",
                    })
                  : undefined
              }
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "select.backup.storage.data",
                  defaultMessage: "Select Database Backup",
                })}
                className="width-320"
                showSelect
                disabledItem={connectionStatus !== "success"}
                value={dbbackupdata}
                onChange={setDbbackupdata}
              >
                <DbBackupDatalist
                  view="select.wizard"
                  defaultQuery={defaultQuery}
                />
              </ModalSelect>
            </Form.Item>
          </Card>
        </Form>
      </DialogForm>
      <RecoverDbConfirmModal
        visible={recoverDbVisible}
        setVisible={setRecoverDbVisible}
        selectedList={form.getFieldValue("dbbackupdata")}
        getParams={(mysqlRootPassword: string) => {
          return {
            mysqlRootPassword,
            backupInstallPath: dbbackupdata?.[0]?.installPath,
            backupStorageUrl,
          };
        }}
        view=""
        position="header"
      />
    </>
  );
};

export default BackupRestoreInitCreator;
