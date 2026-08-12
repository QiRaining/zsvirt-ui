import { RadioGroup } from "@zstack/design";
import { Checkbox } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { ModalSelect, Form, Input } from "@zstack/zsphere-components";
import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import { calculateCIDRRange, isCidr } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import type { FC } from "react";
import React, { useMemo, useState, useRef } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

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
import DiskList from "../../components/freeDisk/list";

import styles from "../style.module.less";

export interface IProps {
  form: any;
}

export enum BackupWay {
  FreeDisk = "FreeDisk",
  LocalDir = "LocalDir",
}

const DiskConfig: FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const onOkRef = useRef<((value: boolean) => void) | null>(null);

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

  const queryDiskListConditions = useMemo(() => {
    const { username, password, sshPort, hostname } = form.getFieldsValue();
    return {
      conditions: [
        { key: "username", op: Op.eq, value: username },
        { key: "password", op: Op.eq, value: password },
        { key: "sshPort", op: Op.eq, value: Number(sshPort) },
        { key: "hostName", op: Op.ne, value: hostname },
      ],
    };
  }, []);

  const handleSelectDisk = async (freeDisk: any) => {
    if (!freeDisk?.[0]?.withPartition) {
      return true;
    }
    setConfirmVisible(true);
    const result = await new Promise<boolean>((resolve) => {
      onOkRef.current = resolve;
    });
    setConfirmVisible(false);
    onOkRef.current = null;
    return result;
  };

  const renderFooter = usePersistFn(({ node, selectedList }) => {
    const [cancelBtn, okBtn] = React.Children.toArray(
      (node as React.ReactElement).props.children,
    );
    return (
      <>
        {cancelBtn}
        {React.cloneElement(okBtn as React.ReactElement, {
          onClick: async () => {
            const result = await handleSelectDisk(selectedList);
            if (result) {
              (okBtn as React.ReactElement).props.onClick?.();
            }
          },
        })}
      </>
    );
  });

  return (
    <>
      <Form.Item
        className={styles.backupWay}
        name="backupWay"
        label={intl.formatMessage({
          id: "backupWay",
          defaultMessage: "Storage Method",
        })}
        description={intl.formatMessage({
          id: "backup.storage.create.field.store.location.description",
          defaultMessage:
            "This configuration will format the selected disks and completely erase all partitions, file systems, and data on the disk.",
        })}
      >
        <RadioGroup
          options={[
            {
              value: BackupWay.FreeDisk,
              label: intl.formatMessage({
                id: "free.disk",
                defaultMessage: "Free Disk",
              }),
            },
            {
              value: BackupWay.LocalDir,
              label: intl.formatMessage({
                id: "local.directory",
                defaultMessage: "Local Directory",
              }),
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => prev.backupWay !== next.backupWay}
      >
        {({ getFieldValue }) => {
          return getFieldValue("backupWay") === BackupWay.FreeDisk ? (
            <>
              <Form.Item
                name="freeDisk"
                label={intl.formatMessage({
                  id: "free.disk",
                  defaultMessage: "Free Disk",
                })}
                required
                rules={[isRequired(IIsRequiredType.select)]}
              >
                <ModalSelect
                  title={intl.formatMessage({
                    id: "select.disk",
                    defaultMessage: "Select Disk",
                  })}
                  selectType="radio"
                  className={styles["width-320"]}
                  alertMessage={intl.formatMessage({
                    id: "backup.storage.select.disk.alert",
                    defaultMessage:
                      "This configuration will format the selected disks and completely erase all partitions, file systems, and data on the disk.",
                  })}
                  alertClosable={false}
                  alertType="error"
                  renderFooter={renderFooter}
                >
                  <DiskList
                    view="select"
                    defaultQuery={queryDiskListConditions}
                  />
                </ModalSelect>
              </Form.Item>
              <Form.Item noStyle name="formatDisk" />
            </>
          ) : null;
        }}
      </Form.Item>

      <Form.Item
        name="url"
        label={intl.formatMessage({
          id: "backup.url",
          defaultMessage: "Backup Storage Path",
        })}
        rules={[isRequired(IIsRequiredType.input)]}
      >
        <Input className={styles["width-240"]} />
      </Form.Item>

      <Form.Item label=" " style={{ marginTop: -8 }}>
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ height: 20, display: "flex", alignItems: "center" }}>
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
              id: "backup.storage.dedicated.storage.path.alert",
              defaultMessage:
                "System directories such as /, /dev, /proc, /sys, /usr/bin, and /bin cannot be used. Using system directories might cause backup storage unable to work properly.",
            })}
          </div>
        </div>
      </Form.Item>

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

      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => prev.backupWay !== next.backupWay}
      >
        {({ getFieldValue }) => {
          return getFieldValue("backupWay") === BackupWay.LocalDir ? (
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
          ) : null;
        }}
      </Form.Item>

      <DialogWeakP1
        visible={confirmVisible}
        setVisible={setConfirmVisible}
        type="warning"
        title={intl.formatMessage({
          id: "confirm.format.disk.title",
          defaultMessage: "Format Selected Disk?",
        })}
        onConfirm={() => onOkRef.current?.(true)}
        onCancel={() => onOkRef.current?.(false)}
        description={
          <div>
            {intl.formatMessage({
              id: "confirm.format.disk.description",
              defaultMessage:
                "Formatting selected disks will erase all partitions, file systems, and data on the disk. Proceed with caution.",
            })}
          </div>
        }
      />
    </>
  );
};

export default DiskConfig;
