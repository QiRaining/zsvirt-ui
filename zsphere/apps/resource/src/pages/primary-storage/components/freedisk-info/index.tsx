import { Button, Text } from "@zstack/design";
import DiskList from "@zstack/virtualization-resource/src/pages/backup-storage/components/FreeDisk/list";
import { Form, Table } from "@zstack/zsphere-components";
import { ModalSelect } from "@zstack/zsphere-components";
import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { FreeHardDiskInfo, Host } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import type { FormProps } from "antd";
import {
  findIndex as _findIndex,
  cloneDeep as _cloneDeep,
  get as _get,
  has as _has,
  find as _find,
} from "lodash-es";
import type { FC } from "react";
import React, { useCallback, useRef, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

const buttonMarginRightStyle = { marginRight: 8 } as const;

interface FreeDiskSelectorSingleProps {
  host?: {
    username?: string;
    sshPort?: string | number;
    managementIp?: string;
  };
  form: FormProps["form"];
}

const FreeDiskSelectorSingle: FC<FreeDiskSelectorSingleProps> = ({
  host,
  form,
}) => {
  const intl = useIntl();
  const [selectDiskListVisible, setSelectDiskListVisible] =
    useState<boolean>(false);
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const diskInfoRef = useRef<FreeHardDiskInfo>();

  const handleDiskSelection = useCallback(
    (freeHardDiskInfo: FreeHardDiskInfo[]) => {
      const freeDisk = freeHardDiskInfo[0];

      if (freeDisk?.withPartition) {
        diskInfoRef.current = freeDisk;
        setSelectDiskListVisible(false);
        setConfirmVisible(true);
      } else {
        form?.setFieldsValue({ freeDisk: freeHardDiskInfo });
        setSelectDiskListVisible(false);
      }
    },
    [form],
  );

  const handleConfirm = useCallback(() => {
    form?.setFieldsValue({ freeDisk: [diskInfoRef.current] });
    setConfirmVisible(false);
  }, [form]);

  return (
    <>
      <Form.Item
        name="freeDisk"
        label={intl.formatMessage({
          id: "host.free.disk",
          defaultMessage: "Host Disk",
        })}
        icon="info"
        description={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.primaryStorage.field.freeDisk.description",
              defaultMessage:
                "If host disks are left unselected, the specified mount path will be added as the local directory.",
            })}
          </ReactMarkdown>
        }
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.primaryStorage.field.freeDisk.tooltip",
              defaultMessage:
                "### Host Disk\n\nDisplays the unmounted or unpartitioned disks on hosts that are in a \"Connected\" status under the selected cluster.\n\n- If there are disconnected hosts under the selected cluster, when the host starts up or reconnects, the mount path will be automatically added as a local directory, and the host will also be automatically added to the local storage.",
            })}
          </ReactMarkdown>
        }
      >
        <ModalSelect
          title={intl.formatMessage({
            id: "select.free.disk",
            defaultMessage: "Select Free Disk",
          })}
          alertMessage={intl.formatMessage({
            id: "select.disk.alert",
            defaultMessage:
              "This configuration will format the selected disks and completely erase all partitions, file systems, and data on the disk.",
          })}
          visible={selectDiskListVisible}
          setVisible={setSelectDiskListVisible}
          alertClosable={false}
          alertType="error"
          className="width-320"
          selectType="radio"
          renderFooter={({ onCancel, selectedList }) => {
            return (
              <>
                <Button variant="link" onClick={() => onCancel()}>
                  {intl.formatMessage({
                    id: "cancel",
                    defaultMessage: "Cancel",
                  })}
                </Button>
                <Button
                  onClick={() => handleDiskSelection(selectedList)}
                  variant="primary"
                  style={buttonMarginRightStyle}
                  disabled={!selectedList.length}
                >
                  {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
                </Button>
              </>
            );
          }}
        >
          <DiskList
            view="select"
            defaultQuery={{
              conditions: [
                {
                  key: "username",
                  op: Op.eq,
                  value: host?.username,
                },
                {
                  key: "sshPort",
                  op: Op.eq,
                  value: Number(host?.sshPort),
                },
                {
                  key: "hostName",
                  op: Op.ne,
                  value: host?.managementIp,
                },
              ],
            }}
          />
        </ModalSelect>
      </Form.Item>

      <DiskFormatConfirm
        visible={confirmVisible}
        setVisible={setConfirmVisible}
        onOk={handleConfirm}
      />
    </>
  );
};

interface FreeDiskSelectorMultipleProps {
  form: FormProps["form"];
  hostDataInTable?: Host[];
  diskInfo?: any[];
  setDiskInfo?: (info: any[]) => void;
}

const FreeDiskSelectorMultiple: FC<FreeDiskSelectorMultipleProps> = ({
  form,
  hostDataInTable = [],
  diskInfo = [],
  setDiskInfo,
}) => {
  const intl = useIntl();
  const [selectDiskListVisible, setSelectDiskListVisible] = useState<any>({});
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const diskInfoRef = useRef<FreeHardDiskInfo>();
  const rowUuidRef = useRef<string>("");

  const updateDiskInfo = useCallback(
    (rowUuid: string, freeDisk: FreeHardDiskInfo) => {
      const index = _findIndex(diskInfo, (obj) => obj.hasOwnProperty(rowUuid));
      const newDiskInfo =
        index !== -1
          ? diskInfo.map((item, i) =>
              i === index
                ? { [rowUuid]: { type: freeDisk?.type, size: freeDisk?.size } }
                : item,
            )
          : [
              ...diskInfo,
              { [rowUuid]: { type: freeDisk?.type, size: freeDisk?.size } },
            ];

      setDiskInfo?.(_cloneDeep(newDiskInfo));
    },
    [diskInfo, setDiskInfo],
  );

  const selectDiskHandler = (
    freeHardDiskInfo: FreeHardDiskInfo[],
    row: Host,
    setVisible: (visible: boolean) => void,
  ) => {
    const freeDisk = freeHardDiskInfo[0];

    if (freeDisk?.withPartition) {
      diskInfoRef.current = freeDisk;
      rowUuidRef.current = row.uuid;
      setVisible(false);
      setConfirmVisible(true);
    } else {
      form?.setFieldsValue({ [`disk-${row.uuid}`]: freeHardDiskInfo });
      updateDiskInfo(row.uuid, freeDisk);
      setVisible(false);
    }
  };

  const getDiskModalSelect = (
    row: Host,
    visible: boolean,
    setVisible: (visible: boolean) => void,
  ) => {
    const queryDiskListConditions = {
      conditions: [
        { key: "username", op: Op.eq, value: row.username },
        { key: "sshPort", op: Op.eq, value: Number(row.sshPort) },
        { key: "hostName", op: Op.ne, value: row.managementIp },
      ],
    };

    return (
      <Form.Item name={`disk-${row.uuid}`} key={row.uuid}>
        <ModalSelect
          key={row.uuid}
          title={intl.formatMessage({
            id: "select.free.disk",
            defaultMessage: "Select Free Disk",
          })}
          visible={visible}
          setVisible={setVisible}
          selectType="radio"
          className={styles["width-160"]}
          alertMessage={intl.formatMessage({
            id: "select.disk.alert",
            defaultMessage:
              "This configuration will format the selected disks and completely erase all partitions, file systems, and data on the disk.",
          })}
          alertClosable={false}
          alertType="error"
          onChange={(value) => {
            if (!value.length) {
              setDiskInfo?.(
                diskInfo.filter((obj) => !obj.hasOwnProperty(row.uuid)),
              );
            }
          }}
          renderFooter={({ onCancel, selectedList }) => {
            return (
              <>
                <Button
                  variant="link"
                  onClick={() => {
                    onCancel();
                  }}
                >
                  {intl.formatMessage({
                    id: "cancel",
                    defaultMessage: "Cancel",
                  })}
                </Button>
                <Button
                  onClick={() => {
                    selectDiskHandler(selectedList, row, setVisible);
                  }}
                  variant="primary"
                  style={buttonMarginRightStyle}
                  disabled={!selectedList.length}
                >
                  {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
                </Button>
              </>
            );
          }}
        >
          <DiskList view="select" defaultQuery={queryDiskListConditions} />
        </ModalSelect>
      </Form.Item>
    );
  };

  const hostColumns = [
    {
      title: intl.formatMessage({
        id: "host.ip",
        defaultMessage: "Host IP",
      }),
      key: "hostIp",
      width: 120,
      render: (row: Host) => <Text>{row.managementIp}</Text>,
    },
    {
      title: intl.formatMessage({
        id: "hard.disk",
        defaultMessage: "Disk",
      }),
      key: "hardDisk",
      width: 120,
      render: (row: Host) => {
        return getDiskModalSelect(
          row,
          selectDiskListVisible[row.uuid],
          (_selectDiskVisible) =>
            setSelectDiskListVisible((prev: any) => ({
              ...prev,
              [row.uuid]: _selectDiskVisible,
            })),
        );
      },
    },
    {
      title: intl.formatMessage({
        id: "model",
        defaultMessage: "Model",
      }),
      key: "model",
      width: 60,
      render: (row: Host) => {
        const type = _get(
          _find(diskInfo, (obj) => _has(obj, row?.uuid)),
          `${row.uuid}.type`,
          "-",
        );
        return type;
      },
    },
    {
      title: intl.formatMessage({
        id: "capacity",
        defaultMessage: "Capacity",
      }),
      key: "capacity",
      width: 60,
      render: (row: Host) => {
        const size = _get(
          _find(diskInfo, (obj) => _has(obj, row?.uuid)),
          `${row.uuid}.size`,
          null,
        );
        return size ? formatStorage(size) : "-";
      },
    },
  ];

  const onOk = () => {
    form?.setFieldsValue({
      [`disk-${rowUuidRef.current}`]: [diskInfoRef.current],
    });
    updateDiskInfo(rowUuidRef.current, diskInfoRef.current as FreeHardDiskInfo);
    setConfirmVisible(false);
  };

  return (
    <>
      <Form.Item
        name="freeDisk"
        label={intl.formatMessage({
          id: "host.free.disk",
          defaultMessage: "Host Disk",
        })}
        className={styles.freeDisk}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.primaryStorage.field.freeDisk.tooltip",
              defaultMessage:
                "### Host Disk\n\nDisplays the unmounted or unpartitioned disks on hosts that are in a \"Connected\" status under the selected cluster.\n\n- If there are disconnected hosts under the selected cluster, when the host starts up or reconnects, the mount path will be automatically added as a local directory, and the host will also be automatically added to the local storage.",
            })}
          </ReactMarkdown>
        }
        description={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.primaryStorage.field.freeDisk.description",
              defaultMessage:
                "If host disks are left unselected, the specified mount path will be added as the local directory.",
            })}
          </ReactMarkdown>
        }
      >
        <div className={styles["table-container"]}>
          <Table
            className={styles[`table-form`]}
            fixHeaderOnTop={false}
            dataSource={hostDataInTable}
            rowKey="uuid"
            showClear={false}
            columns={hostColumns}
            rowSelection={false as any}
          />
          {hostDataInTable.length === 0 && (
            <div className={styles["table-empty-description"]}>
              {intl.formatMessage({
                id: "resource.primaryStorage.table.tips",
                defaultMessage: "Automatically obtain the host info after selecting a cluster.",
              })}
            </div>
          )}
        </div>
      </Form.Item>

      <DiskFormatConfirm
        visible={confirmVisible}
        setVisible={setConfirmVisible}
        onOk={onOk}
      />
    </>
  );
};

interface IDiskFormatConfirmProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onOk: () => void;
}

const DiskFormatConfirm: FC<IDiskFormatConfirmProps> = ({
  visible,
  setVisible,
  onOk,
}) => {
  const intl = useIntl();

  return (
    <DialogWeakP1
      visible={visible}
      setVisible={setVisible}
      type="warning"
      title={intl.formatMessage({
        id: "confirm.format.disk",
        defaultMessage: `Format Selected Disk?`,
      })}
      onCancel={() => setVisible(false)}
      onConfirm={() => {
        onOk();
      }}
      description={
        <div>
          {intl.formatMessage({
            id: "confirm.format.disk.content",
            defaultMessage:
              "Formatting selected disks will erase all partitions, file systems, and data on the disk. Proceed with caution.",
          })}
        </div>
      }
    />
  );
};

interface IProps {
  form: FormProps["form"];
  freeDiskSelectorType: "multiple" | "single";
  hostDataInTable?: Host[];
  diskInfo?: any[];
  setDiskInfo?: (info: any[]) => void;
  host?: {
    username?: string;
    sshPort?: string | number;
    managementIp?: string;
  };
}

const FreeDiskSelector = ({
  freeDiskSelectorType = "multiple",
  ...props
}: IProps) => {
  return freeDiskSelectorType === "multiple" ? (
    <FreeDiskSelectorMultiple {...props} />
  ) : (
    <FreeDiskSelectorSingle {...props} />
  );
};

export default FreeDiskSelector;
