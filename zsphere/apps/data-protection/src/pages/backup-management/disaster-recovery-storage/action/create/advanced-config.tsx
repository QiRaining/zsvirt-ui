import { Checkbox } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { ModalSelect, ZSVForm, Form, Input } from "@zstack/zsphere-components";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import {
  calculateCIDRRange,
  isCidr,
  isIP,
  isPort,
} from "@zstack/zsphere-utils";
import cls from "classnames";
import React, { useContext, useMemo, useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { BackupStoragePlainList } from "zsv_resource_shared/backup-storage/mf-index";
import { HostPlainList } from "zsv_resource_shared/host/mf-index";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});
import {
  HostState,
  HostStatus,
  Op,
  HostQueryType,
} from "@zstack/zsphere-types";

import BackupStorageCreateContext from "./context";

import styles from "../style.module.less";

const { Card } = ZSVForm;

const AdvancedConfig = () => {
  const intl = useIntl();
  const { source = {} } = useContext(BackupStorageCreateContext);
  const { createWay } = source;
  const { isRequired } = useValidator(intl);
  const form = Form.useFormInstance();

  const validaBackupNetwork = (_rule: any, value: string | undefined) => {
    if (!value) {
      return Promise.reject(
        intl.formatMessage({
          id: "global.field.validator.input.required",
          defaultMessage: "This field is required.",
        }),
      );
    }

    if (!isCidr(value)) {
      return Promise.reject(
        intl.formatMessage({
          id: "localBackupServer.field.backup.network.validator.format",
          defaultMessage: "Invalid backup network format.",
        }),
      );
    }

    const [ip, prefix] = value.split("/");
    const { networkAddress } = calculateCIDRRange(value);
    if (ip !== networkAddress) {
      return Promise.reject(
        intl.formatMessage(
          {
            id: "disaster.recovery.storage.field.backup.network.validator.cidr",
            defaultMessage:
              "{wrongCidr} is not a valid CIDR. Do you want to use {correctCidr} instead?",
          },
          {
            wrongCidr: value,
            correctCidr: `${networkAddress}/${prefix}`,
          },
        ),
      );
    }

    return Promise.resolve();
  };

  const queryBSConditions = useMemo(() => {
    return {
      conditions: [
        { key: "state", op: Op.eq, value: "Enabled" },
        { key: "status", op: Op.eq, value: "Connected" },
        { key: "zone.uuid", op: Op.eq, value: source?.selectedZone?.uuid },

        { key: "type", op: Op.ne, value: "Ceph" },
        { key: "type", op: Op.ne, value: "SftpBackupStorage" },
        {
          key: "__systemTag__",
          op: Op.notIn,
          values: [
            "remote",
            "onlybackup",
            "aliyun",
            "remotebackup",
            "allowbackup",
          ],
        },
      ],
    };
  }, [source]);

  const queryHostConditions = useMemo(() => {
    return {
      type: HostQueryType.GetDisasterRecoveryStorageCandidates,
      conditions: [
        { key: "zoneUuid", op: Op.eq, value: source?.selectedZone?.uuid },
        { key: "state", op: Op.eq, value: HostState.Enabled },
        { key: "status", op: Op.eq, value: HostStatus.Connected },
        { key: "hypervisorType", op: Op.ne, value: "ESX" },
      ],
    };
  }, [source]);

  const backupConfigContent = useMemo(() => {
    const backupUrlItem = (
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.backupStorage !== curr.backupStorage}
      >
        {({ getFieldValue, _setFieldsValue }) => {
          const hasBackupStorage = getFieldValue("backupStorage")?.length;
          const backupUrl = hasBackupStorage
            ? getFieldValue("backupStorage")[0]?.url
            : "-";

          return (
            <Form.Item
              name="url"
              label={intl.formatMessage({
                id: "backup.url",
                defaultMessage: "Backup Storage Path",
              })}
              rules={
                createWay === "localFromHost"
                  ? [isRequired(IIsRequiredType.input)]
                  : []
              }
            >
              {createWay === "localFromHost" ? (
                <Input className={styles["width-240"]} />
              ) : (
                backupUrl
              )}
            </Form.Item>
          );
        }}
      </Form.Item>
    );

    const backupNetworkItem = (
      <Form.Item
        label={intl.formatMessage({
          id: "backup.network",
          defaultMessage: "Backup Network",
        })}
        name="backupNetwork"
        tooltip="192.168.1.0/24"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "backup.storage.create.field.network.tooltip",
              defaultMessage:
                "### Backup Network\n\n1. The network used for backups. Enter a backup network CIDR.\n2. Data backup is implemented by using the backup network. A dedicated backup network can avoid network congestion and improve transmission efficiency.\n",
            })}
          </ReactMarkdown>
        }
        rules={[{ required: true, validator: validaBackupNetwork }]}
      >
        <Input className={styles["width-240"]} />
      </Form.Item>
    );

    const scanBackupDataItem = (
      <Form.Item
        label={intl.formatMessage({
          id: "backup.data",
          defaultMessage: "Backup Data",
        })}
        name="scanBackupData"
        valuePropName="checked"
      >
        <FormCheckbox
          label={intl.formatMessage({
            id: "scan.backup.data",
            defaultMessage: "Scan Backup Data",
          })}
        />
      </Form.Item>
    );

    switch (createWay) {
      case "localFromImageStorage":
        return (
          <>
            <Form.Item
              validateFirst
              rules={[isRequired(IIsRequiredType.select)]}
              name="backupStorage"
              label={intl.formatMessage({
                id: "virtualization.image.storage",
                defaultMessage: "Image Storage",
              })}
              required
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "select.backupStorage",
                  defaultMessage: "Select Image Storage",
                })}
                selectType="radio"
                className={styles["width-320"]}
                modalWidth={800}
                onChange={(val) => {
                  const backupUrl = val?.[0]?.url;
                  if (backupUrl) {
                    form.setFieldsValue({ url: backupUrl });
                  }
                }}
              >
                <BackupStoragePlainList
                  view="select"
                  defaultQuery={queryBSConditions}
                />
              </ModalSelect>
            </Form.Item>

            {backupUrlItem}
            {backupNetworkItem}
            {scanBackupDataItem}
          </>
        );

      case "localFromHost":
        return (
          <>
            <Form.Item
              label={intl.formatMessage({
                id: "host",
                defaultMessage: "Host",
              })}
              name="host"
              rules={[isRequired(IIsRequiredType.select)]}
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "select.host",
                  defaultMessage: "Select Host",
                })}
                selectType="radio"
                className={styles["width-320"]}
              >
                <HostPlainList
                  view="select"
                  defaultQuery={queryHostConditions}
                />
              </ModalSelect>
            </Form.Item>

            {backupUrlItem}

            <Form.Item label=" " style={{ marginTop: -8 }}>
              <div style={{ display: "flex", gap: 4 }}>
                <div
                  style={{ height: 20, display: "flex", alignItems: "center" }}
                >
                  <Icon size={16} type="alert-triangle-fill" color="danger" />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: "20px",
                    color: "var(--neutral-500)",
                  }}
                >
                  {intl.formatMessage({
                    id: "backup.storage.reuse.host.path.alert",
                    defaultMessage:
                      "System directories such as /, /dev, /proc, /sys, /usr/bin, and /bin cannot be used. Using system directories might cause hosts unable to work properly.",
                  })}
                </div>
              </div>
            </Form.Item>

            {backupNetworkItem}
            {scanBackupDataItem}
          </>
        );

      case "localCreate":
      case "remoteCreate":
        return (
          <>
            <Form.Item
              name="hostname"
              label={intl.formatMessage({
                id: "back.up.server.ip",
                defaultMessage: "Backup Storage IP",
              })}
              rules={[
                {
                  required: true,
                  validator(rule, value: string) {
                    if (!value) {
                      return Promise.reject(
                        createWay === "remoteCreate"
                          ? intl.formatMessage({
                              id: "remote.back.up.storage.form.hostname.validator.required",
                              defaultMessage: "Enter a remote backup storage IP address.",
                            })
                          : intl.formatMessage({
                              id: "local.back.up.storage.form.hostname.validator.required",
                              defaultMessage: "Enter a local backup storage IP address.",
                            }),
                      );
                    }

                    if (!isIP(value)) {
                      return Promise.reject(
                        createWay === "remoteCreate"
                          ? intl.formatMessage({
                              id: "remote.back.up.storage.form.hostname.validator.format",
                              defaultMessage: "Invalid remote backup storage IP.",
                            })
                          : intl.formatMessage({
                              id: "local.back.up.storage.form.hostname.validator.format",
                              defaultMessage: "Invalid local backup storage IP.",
                            }),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input className={styles["width-240"]} />
            </Form.Item>
            <Form.Item
              name="sshPort"
              label={intl.formatMessage({
                id: "ssh.port",
                defaultMessage: "SSH Port",
              })}
              rules={[
                {
                  required: true,
                  validator(rule, value: string) {
                    if (!value) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "remote.disaster.backup.storage.form.backup.ssh.port",
                          defaultMessage: "Enter an SSH port.",
                        }),
                      );
                    }

                    if (!isPort(value)) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "remote.disaster.backup.storage.form.backup.ssh.port.validator",
                          defaultMessage: "Invalid SSH port.",
                        }),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input className={styles["width-80"]} />
            </Form.Item>
            <Form.Item
              name="username"
              label={intl.formatMessage({
                id: "username",
                defaultMessage: "Username",
              })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "remote.disaster.backup.storage.form.backup.username",
                    defaultMessage: "Enter a username.",
                  }),
                },
              ]}
            >
              <Input className={styles["width-240"]} />
            </Form.Item>
            <Form.Item
              name="password"
              label={intl.formatMessage({
                id: "password",
                defaultMessage: "Password",
              })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "remote.disaster.backup.storage.form.backup.password",
                    defaultMessage: "Enter a password.",
                  }),
                },
              ]}
            >
              <Input.Password className={styles["width-240"]} />
            </Form.Item>
            <Form.Item noStyle name="testConnError">
              <ErrorField />
            </Form.Item>
          </>
        );
      default:
        return <></>;
    }
  }, [createWay, intl]);

  return (
    <Card
      title={intl.formatMessage({
        id: "config.info",
        defaultMessage: "Configurations",
      })}
    >
      {backupConfigContent}
    </Card>
  );
};

export default AdvancedConfig;

interface IErrorFieldProps {
  value?: React.ReactNode;
  className?: string;
}

export const ErrorField = ({ value, className }: IErrorFieldProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      divRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [value]);

  if (!value) {
    return null;
  }
  return (
    <div
      ref={divRef}
      className={cls(
        "ant-form-item-explain ant-form-item-explain-error",
        styles["error-field"],
        className,
      )}
    >
      {value}
    </div>
  );
};
