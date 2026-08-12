import { gql, useLazyQuery } from "@apollo/client";
import {
  Button,
  Checkbox,
  DialogFooter,
  RadioGroup,
  Text,
} from "@zstack/design";
import { Form, Table } from "@zstack/zsphere-components";
import { ZSVForm } from "@zstack/zsphere-components";
import { AlertType } from "@zstack/zsphere-components/lib/modal/action";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { DialogBase, DialogSelectedResource } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { SnapshotType } from "@zstack/zsphere-types";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import SelectTable from "../components/select-table/index";

import style from "./style.module.less";

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

const { Card } = ZSVForm;
export enum RecoveryMethod {
  CompleteMachineRecovery = "CompleteMachineRecovery",
  CustomRecovery = "CustomRecovery",
}

const revertVolumeFromSnapshot = gql`
  mutation revertVolumeFromSnapshot($input: RevertVolumeFromSnapshotInput!) {
    revertVolumeFromSnapshot(input: $input) {
      actionId
    }
  }
`;

const zsvRevertVolumeFromSnapshot = gql`
  mutation zsvRevertVolumeFromSnapshot(
    $input: ZSVRevertVolumeFromSnapshotInput!
  ) {
    zsvRevertVolumeFromSnapshot(input: $input) {
      actionId
    }
  }
`;

const CHECK_MEMORY_SNAPSHOT_GROUP_CONFLICT = gql`
  query checkMemorySnapshotGroupConflict($uuid: String!) {
    checkMemorySnapshotGroupConflict(uuid: $uuid) {
      vmNicConflict {
        ip
        mac
        vmInstanceUuid
        vmInstanceName
        vmNicName
      }
    }
  }
`;
const initialValues = {
  recoverMethod: RecoveryMethod.CompleteMachineRecovery,
  recoveryStart: false,
};

interface IProps extends IActionWrapperProps<any> {
  view: "main" | "sub.vm" | "sub.volume" | "sub.single" | "sub.group";
}

interface IColumns {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  render?: Function;
}

interface IData {
  key: string;
  driveOrder: number;
  volumeName: string;
  location: string | number;
}

const RevertAction: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
  source,
  view: _view,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const [radioValue, setRadioValue] = useState<RecoveryMethod>(
    RecoveryMethod.CompleteMachineRecovery,
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [ipMacCheckVisible, setIpMacCheckVisible] = useState(false);
  const [pendingRecoveryValues, setPendingRecoveryValues] = useState<any>(null);

  const [reassignChecked, setReassignChecked] = useState(false);
  const [startVmChecked, setStartVmChecked] = useState(false);
  const current = selectedList?.[0];
  const volumeSnapshotRefs = Array.from(
    current?.group?.volumeSnapshotRefs || current?.volumeSnapshotRefs || [],
  );

  const withMemory: boolean = volumeSnapshotRefs.some(
    (it: any) => it?.volumeType === "Memory",
  );

  const [getConflictData, { data: conflictData }] = useLazyQuery(
    CHECK_MEMORY_SNAPSHOT_GROUP_CONFLICT,
    {
      fetchPolicy: "no-cache",
    },
  );
  const checkIpMacConflict = useMemo(() => {
    return conflictData?.checkMemorySnapshotGroupConflict?.vmNicConflict || [];
  }, [conflictData]);

  useEffect(() => {
    if (visible && current?.uuid && withMemory) {
      getConflictData({
        variables: { uuid: current.uuid },
      });
    }
  }, [visible, current?.uuid, withMemory, getConflictData]);

  const vmInstance = useMemo(
    () => current?.vmInstance || current?.group?.vmInstance || {},
    [current],
  );

  const allVolumes = vmInstance?.allVolumes?.map((it: any) => {
    return {
      uuid: it.uuid,
      lastAttachDate: it.lastAttachDate,
    };
  });

  //排序后
  const _volumeSnapshotRefs = volumeSnapshotRefs?.sort((pre: any, cur: any) => {
    return (
      new Date(pre.volumeLastAttachDate as any).valueOf() -
      new Date(cur.volumeLastAttachDate as any).valueOf()
    );
  }) as any;
  //排序后
  const _allVolumes = allVolumes?.sort((pre: any, cur: any) => {
    return (
      new Date(pre.lastAttachDate as any).valueOf() -
      new Date(cur.lastAttachDate as any).valueOf()
    );
  }) as any;

  //最新虚拟机的盘uuids
  const volumeUuids = _allVolumes?.map((it: any) => it.uuid);

  const _dataSource: IData[] = useMemo(() => {
    let _location = "";
    return _volumeSnapshotRefs?.map((item: any, index: number) => {
      if (volumeUuids.includes(item.volumeUuid)) {
        _location =
          volumeUuids.findIndex((uuid: string) => uuid === item.volumeUuid) + 1;
      } else {
        _location = "uninstalled";
      }
      return {
        key: item.volumeSnapshotUuid, //单盘快照 uuids
        driveOrder: index + 1,
        volumeName: item?.volumeName,
        location: _location,
      };
    });
  }, [_volumeSnapshotRefs, volumeUuids]);

  const vmSnapShotModalTitle = intl.formatMessage({
    id: "snapshot.revert.vm.confirm.title",
    defaultMessage: "Restore Virtual Machine",
  });

  const actionName = intl.formatMessage({
    id: "revert.vmSnapshot",
    defaultMessage: "Revert VM Snapshot",
  });

  const revertDescription = useMemo(() => {
    return intl.formatMessage({
      id: "recover.method.field.description",
      defaultMessage: "A full recovery restores both the VM data and disk sequence, which may attach the previously detached disks or detach existing disks. Proceed with caution.",
    });
  }, [intl]);

  const handleOk = (values: any) => {
    if (!withMemory) {
      onOk(values);
      return;
    }

    if (checkIpMacConflict.length > 0) {
      setPendingRecoveryValues(values);
      setIpMacCheckVisible(true);
    } else {
      onOk(values);
    }
  };
  const onOk = (values: any) => {
    let payload;
    //快照组情况
    if (current?.snapshotType === SnapshotType.Group) {
      //自定义恢复
      if (radioValue === RecoveryMethod.CustomRecovery) {
        payload = {
          uuids: selectedRowKeys,
          type: SnapshotType.Single,
          vmUuid: vmInstance.uuid,
          isStartVm: values.recoveryStart ?? true,
          withMemory,
        };
      } else {
        payload = selectedList.map((item) => {
          return {
            uuid: item?.groupUuid || item?.uuid,
            vmUuid: vmInstance.uuid,
            isStartVm: values.recoveryStart ?? true,
            type: item?.snapshotType,
            withMemory,
          };
        })[0];
      }
    } else {
      // 被动生成单品的情况
      payload = selectedList.map((item) => {
        return {
          uuid: item.uuid,
          type: SnapshotType.Single,
          vmUuid: item?.vmInstance?.uuid || item?.volume?.vmInstanceUuid,
          isStartVm: startVmChecked,
          withMemory,
        };
      })[0];
    }
    doAction({
      mutation:
        radioValue === RecoveryMethod.CustomRecovery
          ? zsvRevertVolumeFromSnapshot
          : revertVolumeFromSnapshot,
      payload,
      name: actionName,
      total: 1,
      type: "snapshotList",
      onFinish: () => {
        setVisible(false);
        form.resetFields();
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  const revertSnapMassage = (
    <ReactMarkdown>
      {withMemory
        ? intl.formatMessage({
            id: "snapshot.modal.revert.warn.havememoryshot",
            defaultMessage: `1. Reverting a VM to the selected snapshot overwrites the existing data (including the VM memory state).

2. If the number of NICs or CD/DVD drives differs from the snapshot configuration, any removed NICs or CD/DVD drives after the snapshot creation will be attached, and any newly added ones after the snapshot creation will be removed.`,
          })
        : intl.formatMessage({
            id: "snapshot.modal.revert.warn.nomemoryshot",
            defaultMessage:
              "Reverting a VM to the selected snapshot automatically powers off the VM and overwrites the existing data.",
          })}
    </ReactMarkdown>
  );

  const onCancel = () => {
    setSelectedRowKeys([]);
    setRadioValue(RecoveryMethod.CompleteMachineRecovery);
    form.resetFields();
    setReassignChecked(false);
  };

  const columns: IColumns[] = [
    {
      title: intl.formatMessage({ id: "hard.drive", defaultMessage: "Disk" }),
      dataIndex: "driveOrder",
      key: "driveOrder",
      width: 80,
    },
    {
      title: intl.formatMessage({
        id: "hard.drive.file",
        defaultMessage: "Disk File",
      }),
      dataIndex: "volumeName",
      key: "volumeName",
      width: 140,
      render: (value: string, _record: IData) => {
        return <Text>{value}</Text>;
      },
    },
    {
      title: intl.formatMessage({
        id: "hard.drive.current.location",
        defaultMessage: "Current Location",
      }),
      key: "location",
      dataIndex: "location",
      width: 120,
      render: (value: any, _record: IData) => {
        return (
          <span>
            {value === "uninstalled"
              ? intl.formatMessage({
                  id: "disk.been.uninstalled",
                  defaultMessage: "The disk has been unloaded.",
                })
              : value}
          </span>
        );
      },
    },
  ];

  if (current?.snapshotType === SnapshotType.Single) {
    return (
      <DialogBase
        visible={visible}
        setVisible={setVisible}
        title={intl.formatMessage({
          id: "snapshot.modal.title.action.confirm.recover.snapshot",
          defaultMessage: "Revert Snapshot?",
        })}
        footer={
          <>
            <Button variant="subtle" onClick={() => setVisible(false)}>
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onOk({ startVM: startVmChecked });
              }}
            >
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </Button>
          </>
        }
      >
        <div className="mb-4">{revertSnapMassage}</div>
        <DialogSelectedResource
          names={selectedList.map((r) => r.name ?? r.uuid)}
        />
        <div className="mt-4 flex items-center gap-2">
          <Checkbox
            checked={startVmChecked}
            onCheckedChange={(v) => setStartVmChecked(v === true)}
          />
          <label className="cursor-pointer text-sm">
            {intl.formatMessage({
              id: "revert.and.start.vm",
              defaultMessage: "Auto-Start VM Upon Reversion Completion",
            })}
          </label>
        </div>
      </DialogBase>
    );
  }
  const ipColumns = [
    {
      title: intl.formatMessage({
        id: "ip.address",
        defaultMessage: "IP Address",
      }),
      key: "ip",
      width: 130,
      render: (row: any) => {
        return <Text>{row?.ip || "-"}</Text>;
      },
    },
    {
      title: intl.formatMessage({
        id: "mac.address",
        defaultMessage: "MAC Address",
      }),
      key: "mac",
      width: 140,
      render: (row: any) => {
        return <Text>{row?.mac || "-"}</Text>;
      },
    },
    {
      title: intl.formatMessage({
        id: "current.vm",
        defaultMessage: "Current VM",
      }),
      key: "vmInstanceName",
      width: 140,
      render: (row: any) => {
        return <Text>{row?.vmInstanceName || "-"}</Text>;
      },
    },
    {
      title: intl.formatMessage({
        id: "current.nic",
        defaultMessage: "Current NIC",
      }),
      key: "vmNicName",
      flex: 1,
      render: (row: any) => {
        return <Text>{row?.vmNicName || "-"}</Text>;
      },
    },
  ];
  const footer = (
    <DialogFooter className="gap-2">
      <Button
        variant="link"
        onClick={() => {
          setIpMacCheckVisible(false);
          setPendingRecoveryValues(null);
          setReassignChecked(false);
        }}
      >
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      <Button
        variant="primary"
        disabled={!reassignChecked}
        onClick={() => {
          // 直接恢复
          setIpMacCheckVisible(false);
          if (pendingRecoveryValues) {
            onOk(pendingRecoveryValues);
          }
          setReassignChecked(false);
        }}
      >
        {intl.formatMessage({
          id: "continue.recover",
          defaultMessage: "Continue",
        })}
      </Button>
    </DialogFooter>
  );
  return (
    <>
      <DialogForm
        visible={ipMacCheckVisible}
        setVisible={setIpMacCheckVisible}
        form={form}
        title={intl.formatMessage({
          id: "snapshot.revert.ipmac.check.title",
          defaultMessage: "Revert Snapshot: IP/MAC Address Conflicted",
        })}
        alertType="warning"
        alertMessage={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "snapshot.revert.ipmac.conflict.warning",
              defaultMessage: `The snapshot contains IP or MAC addresses that are currently in use by other VMs.

Resolve conflicts before reverting the snapshot. If you force revert, the platform will handle conflicts as follows:

· Conflicting IP addresses: Keeps the IP addresses from the snapshot and you need to manually modify these IP addresses after restoration.

· Conflicting MAC addresses: Keeps the MAC addresses from the snapshot but disables affected NICs after restoration.`,
            })}
          </ReactMarkdown>
        }
        footer={footer}
        className={style.conflictShow}
      >
        <Card
          title={intl.formatMessage({
            id: "conflict.info",
            defaultMessage: "Conflict Information",
          })}
          className={style.formWrapper}
        >
          <Table
            dataSource={checkIpMacConflict}
            columns={ipColumns}
            className={style.table}
            pagination={false}
            scroll={{ y: 320, x: "max-content" }}
          />
          <div
            className="flex items-center"
            style={{
              marginLeft: "-12px",
            }}
          >
            <Checkbox
              checked={reassignChecked}
              onCheckedChange={(val) => setReassignChecked(val === true)}
              id="reassign-check"
            />
            <label
              htmlFor="reassign-check"
              className="cursor-pointer pl-2 text-sm"
              style={{ color: "#4A4C4F" }}
            >
              {intl.formatMessage({
                id: "snapshot.revert.risk.confirm",
                defaultMessage: "I acknowledge",
              })}
            </label>
          </div>
        </Card>
      </DialogForm>

      <DialogForm
        visible={visible}
        setVisible={setVisible}
        widthClassName="w-150"
        alertType="warning"
        className={style.revertModal}
        alertMessage={revertSnapMassage}
        title={vmSnapShotModalTitle}
        form={form}
        onOk={handleOk}
        onCancel={onCancel}
      >
        <Form form={form} initialValues={initialValues}>
          <Form.Item
            label={intl.formatMessage({
              id: "recover.method",
              defaultMessage: "Recovery Method",
            })}
            name="recoverMethod"
            required
            description={
              radioValue === RecoveryMethod.CompleteMachineRecovery && (
                <span>{revertDescription}</span>
              )
            }
          >
            <RadioGroup
              onValueChange={(value) => setRadioValue(value as RecoveryMethod)}
              options={[
                {
                  value: RecoveryMethod.CompleteMachineRecovery,
                  label: intl.formatMessage({
                    id: "complete.machine.recovery",
                    defaultMessage: "Full Recovery",
                  }),
                },
                {
                  value: RecoveryMethod.CustomRecovery,
                  label: intl.formatMessage({
                    id: "custom.recovery",
                    defaultMessage: "Custom Recovery",
                  }),
                  disabled: withMemory,
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.recoverMethod !== currentValues.recoverMethod
            }
          >
            {({ getFieldValue }) => {
              return (
                getFieldValue("recoverMethod") ===
                  RecoveryMethod.CustomRecovery && (
                  <Form.Item
                    name="customRecovery"
                    style={{ marginTop: "-8px", marginLeft: "168px" }}
                  >
                    <SelectTable
                      dataSource={_dataSource}
                      columns={columns}
                      setSelectedRowKeys={setSelectedRowKeys}
                      selectedRowKeys={selectedRowKeys}
                    />
                  </Form.Item>
                )
              );
            }}
          </Form.Item>
          {!withMemory ? (
            <Form.Item
              label={intl.formatMessage({
                id: "snapshot.revert.powerState.",
                defaultMessage: "Power Status",
              })}
              name="recoveryStart"
              valuePropName="checked"
            >
              <FormCheckbox
                label={intl.formatMessage({
                  id: "automatically.start.virtualmachine.after.recovery",
                  defaultMessage: "Power on after recovery",
                })}
              />
            </Form.Item>
          ) : (
            ""
          )}
        </Form>
      </DialogForm>
    </>
  );
};

export default RevertAction;
