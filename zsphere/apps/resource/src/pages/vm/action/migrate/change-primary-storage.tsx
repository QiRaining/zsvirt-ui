import { gql, useLazyQuery } from "@apollo/client";
import { Alert, Button, Checkbox, Text, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { primaryStorageList } from "@zstack/virtualization-resource/src/gql/primary-storage.gql";
import { getStorageMigrateVmInstancedepends } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { primaryStorageMigrateVolume } from "@zstack/virtualization-resource/src/gql/volume.gql";
import CephPoolList from "@zstack/virtualization-resource/src/pages/ceph-primary-storage-pool/list";
import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import {
  Form,
  Input,
  ModalSelect,
  Switch,
  Table,
  ZSVForm,
} from "@zstack/zsphere-components";
import {
  DialogBase,
  DialogWeak,
  DialogWeakP1,
} from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import {
  GuestToolsState,
  Op,
  PrimaryStorageQueryType,
  PrimaryStorageType,
  VmInstanceState,
  VolumeType,
} from "@zstack/zsphere-types";
import type {
  StorageMigrateVmInstancedepends as IStorageMigrateVmInstancedepends,
  VmInstance as IVM,
  StorageMigratePayload,
  TrashOnPrimaryStorage,
} from "@zstack/zsphere-types/graphql";
import {
  formatBytesToSize,
  formatConditions,
  isIn,
  parseNumber,
} from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/lib/form";
import cls from "classnames";
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
import { some as _some, get as _get } from "lodash-es";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import {
  buildDataVolumeMigratePayload,
  buildDataVolumeMigrateVmPayload,
  buildDataVolumePrimaryStorageDefaultQuery,
  buildVolumeMigrationAOs,
  canMigrateAnyDataDisk,
  canMigrateMoreDataVolumes,
  DATA_VOLUME_MIGRATE_DISABLED_CODE,
  getDataVolumeMigrateRows,
  getDefaultMigrationRange,
  hasPrimaryStorageTrashForResource,
  isZceStorage,
  type DataVolumeMigrateRow,
  type MigrationRange,
  MIGRATION_RANGE,
  isSystemDiskRangeDisabled,
} from "./change-primary-storage-helper";
import ClearOriginDataField from "./components/ClearOriginDataField";
import { getMigrateAlertMessage } from "./utils";

import actionStyles from "../style.module.less";
import styles from "./style.module.less";

const { apolloClient } = window.g_main;

const FOOTER_DIALOG_STYLE = { textAlign: "right" } as const;
const INPUT_BANDWIDTH_STYLE = { width: 160, marginRight: 4 } as const;
const DATA_VOLUME_TARGET_STORAGE_FIELD_PREFIX =
  "dataVolumeTargetPrimaryStorage";
const DATA_VOLUME_STORAGE_POOL_FIELD_PREFIX = "dataVolumeStoragePool";

const getDataVolumeTargetStorageField = (volumeUuid: string) =>
  `${DATA_VOLUME_TARGET_STORAGE_FIELD_PREFIX}_${volumeUuid}`;

const getDataVolumeStoragePoolField = (volumeUuid: string) =>
  `${DATA_VOLUME_STORAGE_POOL_FIELD_PREFIX}_${volumeUuid}`;

const getVMSnapshoCount = gql`
  query getVMSnapshoCount($conditions: [Condition!]) {
    volumeSnapshotList(conditions: $conditions) {
      total
    }
  }
`;

const getTrashOnPrimaryStorage = gql`
  query getTrashOnPrimaryStorage($uuid: String!) {
    getTrashOnPrimaryStorage(uuid: $uuid) {
      list {
        resourceUuid
        resourceType
        trashType
      }
    }
  }
`;

const storageMigrateVmInstance = gql`
  mutation storageMigrateVmInstance($input: StorageMigrateVmInstanceInput!) {
    storageMigrateVmInstance(input: $input) {
      actionId
    }
  }
`;

const Migrate: React.FC<IActionWrapperProps<IVM>> = ({
  refetch,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const [haveSnaphsotVisible, setHaveSnaphsotVisible] =
    useState<boolean>(false);
  const [form] = Form.useForm();
  const [notConfigStorageVisible, setNotConfigStorageVisible] =
    useState<boolean>(false);
  const [autoSelect, setAutoSelect] = useState<boolean>(true);
  const [preConfirmVisible, setPreConfirmVisible] = useState<boolean>(false);
  const [preConfirmed, setPreConfirmed] = useState<boolean>(false);
  const [migrationRange, setMigrationRange] = useState<MigrationRange>(
    MIGRATION_RANGE.SYSTEM,
  );
  const [dataVolumeRows, setDataVolumeRows] = useState<DataVolumeMigrateRow[]>(
    [],
  );
  const [dataVolumeSearchKeyword, setDataVolumeSearchKeyword] = useState("");
  const [notConfigStorageDescription, setNotConfigStorageDescription] =
    useState("");
  const [notSharedBlockVolumeVisible, setNotSharedBlockVolumeVisible] =
    useState(false);
  const [
    dataVolumePrimaryStorageTrashWarnings,
    setDataVolumePrimaryStorageTrashWarnings,
  ] = useState<Record<string, React.ReactNode>>({});
  const migrateDataVolumeFlag: boolean =
    selectedList.filter((t: IVM) => t?.allVolumes && t?.allVolumes?.length > 1)
      ?.length > 0;
  const formRef = React.createRef<FormInstance>();

  const vm = useMemo(() => {
    return selectedList?.[0] || {};
  }, [selectedList]);

  const isRunning = useMemo(() => {
    return vm?.state === VmInstanceState.Running;
  }, [vm]);

  const hasAttachedIso = useMemo(() => {
    return vm?.vmCdRoms?.some((it) => it.isoUuid);
  }, [vm]);

  const isAttachedShareableVolume = useMemo(() => {
    return (
      !!vm.attachedShareableVolumeUuidList &&
      vm.attachedShareableVolumeUuidList.length > 0
    );
  }, [vm]);

  const sourcePrimaryStorageInfo = useMemo(() => {
    return vm?.primaryStorage;
  }, [vm]);

  const primaryStorageType = useMemo(() => {
    return vm?.primaryStorage?.type || "";
  }, [vm]);

  const isAttachVF = useMemo(() => {
    return isRunning && _some(vm.vmNics, (item) => item.type === "VF");
  }, [isRunning, vm]);

  const isAttachedVolume = useMemo(() => {
    return (
      (vm.allVolumes && vm.allVolumes.length >= 2) || isAttachedShareableVolume
    );
  }, [vm, isAttachedShareableVolume]);

  const hasNotSharedBlockVolume = useMemo(() => {
    //需要先过滤内存快照产生的盘，不然会影响判断条件
    const allVolumesWithoutMemory = vm?.allVolumes?.filter(
      (it) => it.type !== VolumeType.Memory,
    );

    return (
      vm?.primaryStorage?.type === PrimaryStorageType.SharedBlock &&
      allVolumesWithoutMemory?.some(
        (it) => it?.primaryStorage?.type !== PrimaryStorageType.SharedBlock,
      )
    );
  }, [vm]);
  const hasDataVolumeMigrateCapability = useMemo(
    () => canMigrateAnyDataDisk(vm),
    [vm],
  );
  const systemDiskRangeDisabled = useMemo(
    () => isSystemDiskRangeDisabled(vm),
    [vm],
  );
  const getDataVolumeDiskLabel = useCallback(
    (diskNo: number) =>
      intl.formatMessage(
        {
          id: "vm.change.data.storage.data.volume.disk.label",
          defaultMessage: "Disk {diskNo}",
        },
        {
          diskNo,
        },
      ),
    [intl],
  );
  const filteredDataVolumeRows = useMemo(() => {
    const keyword = dataVolumeSearchKeyword.trim().toLowerCase();
    if (!keyword) {
      return dataVolumeRows;
    }

    return dataVolumeRows.filter((row) => {
      return [
        getDataVolumeDiskLabel(row.diskNo),
        row.volume.name,
        row.currentPrimaryStorage?.name,
        row.currentPrimaryStorage?.type,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [dataVolumeRows, dataVolumeSearchKeyword]);
  const canMigrateMoreDataVolumeRows = useMemo(
    () => canMigrateMoreDataVolumes(dataVolumeRows),
    [dataVolumeRows],
  );
  const dataVolumePrimaryStorageTrashWarning = useMemo(
    () =>
      Object.values(dataVolumePrimaryStorageTrashWarnings).find(Boolean) ?? "",
    [dataVolumePrimaryStorageTrashWarnings],
  );

  const [getDepends, { data }] = useLazyQuery(
    getStorageMigrateVmInstancedepends,
  );
  const [getSnapshoCount, { data: currentVmSnapshotList = {} }] =
    useLazyQuery(getVMSnapshoCount);

  const currentVmSnapShotCount = useMemo(() => {
    return currentVmSnapshotList?.volumeSnapshotList?.total;
  }, [currentVmSnapshotList?.volumeSnapshotList?.total]);

  const getPrimaryStorageTrashList = async (
    psUuid?: string | null,
  ): Promise<TrashOnPrimaryStorage[]> => {
    if (!psUuid) {
      return [];
    }

    const { data: trash } = await apolloClient.query({
      query: getTrashOnPrimaryStorage,
      variables: {
        uuid: psUuid,
      },
      fetchPolicy: "no-cache",
    });

    return trash?.getTrashOnPrimaryStorage?.list || [];
  };

  const getPrimaryStorageTrashWarningMessage = (
    primaryStorageName?: string | null,
  ) =>
    intl.formatMessage(
      {
        id: "vm.migrate.validator.clearOriginData.alert.message",
        defaultMessage:
          "Detection of Data Storage {primaryStroage} found residual original data due to cross-storage migration retention. You can navigate to the 'Data Cleanup' sub-page on the target data storage details page to clean up the original data.",
      },
      {
        primaryStroage: primaryStorageName ?? "-",
      },
    );

  const validPrimaryStorageTrash = async (psUuid: any) => {
    const list = await getPrimaryStorageTrashList(psUuid);

    if (
      hasPrimaryStorageTrashForResource(list, _get(vm, "rootVolumeUuid", ""))
    ) {
      form.setFieldsValue({
        primaryStorageTrashWarning: getPrimaryStorageTrashWarningMessage(
          form?.getFieldValue("primaryStroage")?.[0]?.name,
        ),
      });
      return;
    }
    form.setFieldsValue({
      primaryStorageTrashWarning: "",
    });
    return;
  };

  const clearDataVolumePrimaryStorageTrashWarning = (volumeUuid: string) => {
    setDataVolumePrimaryStorageTrashWarnings((warnings) => {
      if (!warnings[volumeUuid]) {
        return warnings;
      }
      const nextWarnings = { ...warnings };
      delete nextWarnings[volumeUuid];
      return nextWarnings;
    });
  };

  const updateDataVolumePrimaryStorageTrashWarning = async (
    row: DataVolumeMigrateRow,
    targetPrimaryStorage?: DataVolumeMigrateRow["targetPrimaryStorage"],
  ) => {
    if (!targetPrimaryStorage?.uuid) {
      clearDataVolumePrimaryStorageTrashWarning(row.volumeUuid);
      return;
    }

    const list = await getPrimaryStorageTrashList(targetPrimaryStorage.uuid);
    const hasTrash = hasPrimaryStorageTrashForResource(list, row.volumeUuid);

    setDataVolumePrimaryStorageTrashWarnings((warnings) => {
      if (!hasTrash) {
        if (!warnings[row.volumeUuid]) {
          return warnings;
        }
        const nextWarnings = { ...warnings };
        delete nextWarnings[row.volumeUuid];
        return nextWarnings;
      }

      return {
        ...warnings,
        [row.volumeUuid]: getPrimaryStorageTrashWarningMessage(
          targetPrimaryStorage.name,
        ),
      };
    });
  };

  useEffect(() => {
    if (visible && vm) {
      setPreConfirmed(false);
      setPreConfirmVisible(vm?.state === VmInstanceState.Running);
      getSnapshoCount({
        variables: {
          conditions: [
            {
              key: "volumeUuid",
              op: Op.eq,
              value: vm.rootVolumeUuid,
            },
          ],
        },
      });
      getDepends({ variables: { uuid: vm.uuid } });
      form.resetFields();
      setDataVolumeRows(getDataVolumeMigrateRows(vm));
      setDataVolumeSearchKeyword("");
      setMigrationRange(getDefaultMigrationRange(vm));
      setNotConfigStorageDescription("");
      setNotSharedBlockVolumeVisible(false);
      setDataVolumePrimaryStorageTrashWarnings({});
      // ZSV-11455: 当 VM 有数据盘时，默认勾选迁移数据盘，避免跨存储迁移失败
      if (migrateDataVolumeFlag) {
        form.setFieldsValue({ migrateDisk: true });
      }
    }
  }, [form, getDepends, getSnapshoCount, migrateDataVolumeFlag, visible, vm]);

  const runningVDetachRelateDeviceModal = (
    <DialogWeak
      title={intl.formatMessage({
        id: "vm.modal.title.cannot.changePrimaryStorage",
        defaultMessage: "Cannot Change Data Storage",
      })}
      type="warning"
      onConfirm={() => {
        setVisible(false);
      }}
      visible={visible}
      setVisible={setVisible}
      description={intl.formatMessage({
        id: "vm.modal.changePrimaryStorage.extra.detach.iso.sharedvolume.block.device.vfnic.on.vm",
        defaultMessage:
          "Detach all ISOs, shared disks, LUNs, peripheral devices, and passed-through USB devices from the virtual machine and try again.",
      })}
    />
  );

  const runningPreConfirmModal = (
    <DialogWeakP1
      title={intl.formatMessage({
        id: "vm.modal.title.confirm.change.data.storage",
        defaultMessage: "Change Data Storage?",
      })}
      type="warning"
      onConfirm={() => {
        setPreConfirmVisible(false);
        setPreConfirmed(true);
      }}
      onCancel={() => {
        setPreConfirmVisible(false);
        setVisible(false);
      }}
      visible={preConfirmVisible}
      setVisible={setPreConfirmVisible}
      description={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "vm.modal.change.data.storage.preconfirm.message",
            defaultMessage:
              "To ensure a smooth migration and minimize impact on your applications, we recommend：\n\n- Avoid large-scale data operations during the migration.\n- Reduce non-critical workloads appropriately.\n- Perform migration during off-peak business hours.",
          })}
        </ReactMarkdown>
      }
    />
  );

  const VmToolsNotRunningModal = (
    <DialogWeak
      title={intl.formatMessage({
        id: "vm.modal.title.cannot.changePrimaryStorage",
        defaultMessage: "Cannot Change Data Storage",
      })}
      type="warning"
      onConfirm={() => {
        setVisible(false);
      }}
      visible={visible}
      setVisible={setVisible}
      description={intl.formatMessage({
        id: "isAttachVF.vm.modal.vmtools.not.running.message",
        defaultMessage:
          "To migrate VMs with VF NICs attached, install VMTools first and make sure the VMTools is functioning properly.",
      })}
      footer={
        <div style={FOOTER_DIALOG_STYLE}>
          <Button onClick={() => setVisible(false)} variant="primary">
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        </div>
      }
    />
  );

  const stoppedVmDetachRelateDeviceModal = (
    <DialogWeak
      title={intl.formatMessage({
        id: "vm.modal.title.cannot.changePrimaryStorage",
        defaultMessage: "Cannot Change Data Storage",
      })}
      type="warning"
      onConfirm={() => {
        setVisible(false);
      }}
      visible={visible}
      setVisible={setVisible}
      description={intl.formatMessage({
        id: "vm.modal.changePrimaryStorage.extra.detach.iso.sharedvolume.block.device.pci.on.vm",
        defaultMessage:
          "Detach all ISOs, shared disks, LUNs, peripheral devices, and passed-through USB devices from the virtual machine and try again.",
      })}
    />
  );

  const detachVolumeModal = (
    <DialogWeak
      title={intl.formatMessage({
        id: "vm.modal.title.cannot.changePrimaryStorage",
        defaultMessage: "Cannot Change Data Storage",
      })}
      type="warning"
      onConfirm={() => {
        setVisible(false);
      }}
      visible={visible}
      setVisible={setVisible}
      description={intl.formatMessage({
        id: "vm.modal.changePrimaryStorage.extra.detach.volume",
        defaultMessage: "Detach all of the attached data disks from the virtual machine and try again.",
      })}
    />
  );

  const detachNotSharedBlockVolumeModal = (
    <DialogWeak
      title={intl.formatMessage({
        id: "vm.modal.title.cannot.changePrimaryStorage",
        defaultMessage: "Cannot Change Data Storage",
      })}
      type="warning"
      onConfirm={() => {
        setNotSharedBlockVolumeVisible(false);
      }}
      visible={notSharedBlockVolumeVisible}
      setVisible={setNotSharedBlockVolumeVisible}
      description={intl.formatMessage({
        id: "vm.modal.changePrimaryStorage.extra.detach.not.sharedbloack.volume.on.vm",
        defaultMessage: "The virtual machine has disks that are not stored on the SAN Storage. Detach these disks and try again.",
      })}
    />
  );

  const primaryStorageDefaultQuery: IQuery = useMemo(() => {
    const defaultQuery: IQuery = {
      // ，支持迁移：sblk -> sblk，sblk -> ceph, ceph -> sblk， 不支持迁移：ceph-> ceph
      conditions: [
        {
          key: "type",
          op: Op.in,
          values:
            selectedList?.[0]?.primaryStorage?.type ===
            PrimaryStorageType.SharedBlock
              ? [PrimaryStorageType.SharedBlock, PrimaryStorageType.Ceph]
              : [PrimaryStorageType.SharedBlock],
        },
      ],
      type: PrimaryStorageQueryType.StorageMigrateVm,
      extraConditions: [
        {
          key: "vmInstanceUuid",
          op: Op.eq,
          value: vm.uuid,
        },
        {
          key: "migrateStorageOnly",
          op: Op.eq,
          value: "true",
        },
      ],
    };

    if (vm && !!vm.cdpTaskStatus) {
      defaultQuery?.conditions?.push({
        key: "type",
        op: Op.eq,
        value: PrimaryStorageType.Ceph,
      });
    }

    return defaultQuery;
  }, [selectedList, vm]);

  const validBand = () => {
    return {
      validateTrigger: "onChange",
      validator(_rules: any, value: string) {
        const range = {
          maxValue: 1024 * 1024 * 1024 * 100,
          minValue: 1024 * 1024,
        };

        const _v = parseNumber(Number(value), "MB/s");

        if (value && !isIn(_v, range.minValue, range.maxValue)) {
          return Promise.reject(
            intl.formatMessage({
              id: "volume.field.readingAndWritingSpeed.validator.format",
              defaultMessage: "The speed must be an integer between 1 MB/s and 100 GB/s.",
            }),
          );
        }

        return Promise.resolve();
      },
    };
  };

  const getDataVolumeRowsWithFormValues = () =>
    dataVolumeRows.map((row) => {
      const targetPrimaryStorage =
        form.getFieldValue(
          getDataVolumeTargetStorageField(row.volumeUuid),
        )?.[0] ?? null;
      const targetStoragePool =
        form.getFieldValue(
          getDataVolumeStoragePoolField(row.volumeUuid),
        )?.[0] ?? null;

      return {
        ...row,
        targetPrimaryStorage,
        targetStoragePool,
      };
    });

  const clearDataVolumeFields = (rows: DataVolumeMigrateRow[]) => {
    form.setFieldsValue(
      rows.reduce<Record<string, []>>((acc, row) => {
        acc[getDataVolumeTargetStorageField(row.volumeUuid)] = [];
        acc[getDataVolumeStoragePoolField(row.volumeUuid)] = [];
        return acc;
      }, {}),
    );
  };

  const setDataVolumeMigrate = (
    volumeUuid: string,
    migrate: boolean,
    disabled?: boolean,
  ) => {
    if (disabled) {
      return;
    }

    const row = dataVolumeRows.find((item) => item.volumeUuid === volumeUuid);
    if (!row) {
      return;
    }

    if (!migrate) {
      clearDataVolumeFields([row]);
      clearDataVolumePrimaryStorageTrashWarning(row.volumeUuid);
    }

    setDataVolumeRows((rows) =>
      rows.map((item) =>
        item.volumeUuid === volumeUuid ? { ...item, migrate } : item,
      ),
    );
  };

  const migrateAllDataVolumes = () => {
    setDataVolumeRows((rows) =>
      rows.map((row) => ({
        ...row,
        migrate: !row.disabledCode,
      })),
    );
  };

  const cancelAllDataVolumes = () => {
    clearDataVolumeFields(dataVolumeRows);
    setDataVolumePrimaryStorageTrashWarnings({});
    setDataVolumeRows((rows) =>
      rows.map((row) => ({
        ...row,
        migrate: false,
      })),
    );
  };

  const getDataVolumeValidationDescription = (validateCode: string) => {
    if (validateCode === "NO_SELECTED_VOLUME") {
      return intl.formatMessage({
        id: "vm.change.data.storage.data.volume.validator.no.selected.volume",
        defaultMessage: "Select the disks to migrate and configure target storage before retrying.",
      });
    }

    if (validateCode === "SUBMIT_FAILED") {
      return intl.formatMessage({
        id: "vm.change.data.storage.data.volume.validator.submit.failed",
        defaultMessage: "Failed to submit the data disk migration task. Try again later.",
      });
    }

    return intl.formatMessage({
      id: "vm.change.data.storage.data.volume.validator.missing.target.storage",
      defaultMessage: "Configure target storage or a storage pool before retrying.",
    });
  };

  const renderDataVolumeMigrateSwitch = (row: DataVolumeMigrateRow) => {
    const disabled = Boolean(row.disabledCode);
    const disabledTooltip = (() => {
      if (
        row.disabledCode ===
        DATA_VOLUME_MIGRATE_DISABLED_CODE.VM_STATE_NOT_SUPPORT_MIGRATION
      ) {
        return intl.formatMessage({
          id: "vm.change.data.storage.data.volume.current.vm.state.unsupported",
          defaultMessage:
            "Disk migration is not supported in the current VM state. Stop the VM and try again.",
        });
      }

      if (
        row.disabledCode ===
        DATA_VOLUME_MIGRATE_DISABLED_CODE.CURRENT_STORAGE_NOT_SUPPORT_MIGRATION
      ) {
        return intl.formatMessage({
          id: "vm.change.data.storage.data.volume.current.storage.unsupported",
          defaultMessage: "Disk migration is not supported for the current storage location.",
        });
      }

      return undefined;
    })();

    return (
      <Tooltip title={disabled ? disabledTooltip : undefined}>
        <span>
          <Switch
            checked={row.migrate}
            disabled={disabled}
            onChange={(checked) =>
              setDataVolumeMigrate(row.volumeUuid, checked, disabled)
            }
          />
        </span>
      </Tooltip>
    );
  };

  const renderDataVolumeTargetStorage = (row: DataVolumeMigrateRow) => {
    if (!row.migrate) {
      return <span className="text-neutral-400">-</span>;
    }

    return (
      <Form.Item
        name={getDataVolumeTargetStorageField(row.volumeUuid)}
        noStyle
        rules={[
          {
            async validator(_rules, value) {
              await updateDataVolumePrimaryStorageTrashWarning(row, value?.[0]);
              return Promise.resolve();
            },
          },
        ]}
      >
        <ModalSelect
          className="!w-full"
          title={intl.formatMessage({
            id: "virtualization.select.target.primary.storage",
            defaultMessage: "Select Destination Data Storage",
          })}
          autoSelect
          autoSelectGql={primaryStorageList}
          modalZIndex={1200}
          onOk={(selectedPrimaryStorages) => {
            form.setFieldsValue({
              [getDataVolumeStoragePoolField(row.volumeUuid)]: [],
            });
            void updateDataVolumePrimaryStorageTrashWarning(
              row,
              selectedPrimaryStorages?.[0],
            );
          }}
        >
          <PrimaryStorageList
            view="select"
            defaultQuery={buildDataVolumePrimaryStorageDefaultQuery(row, vm)}
          />
        </ModalSelect>
      </Form.Item>
    );
  };

  const renderDataVolumeStoragePool = (row: DataVolumeMigrateRow) => {
    if (!row.migrate) {
      return <span className="text-neutral-400">-</span>;
    }

    return (
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) =>
          prev[getDataVolumeTargetStorageField(row.volumeUuid)] !==
          cur[getDataVolumeTargetStorageField(row.volumeUuid)]
        }
      >
        {({ getFieldValue }) => {
          const targetPrimaryStorage = getFieldValue(
            getDataVolumeTargetStorageField(row.volumeUuid),
          )?.[0] as DataVolumeMigrateRow["targetPrimaryStorage"];

          if (!isZceStorage(targetPrimaryStorage)) {
            return <span className="text-neutral-400">-</span>;
          }

          return (
            <Form.Item
              name={getDataVolumeStoragePoolField(row.volumeUuid)}
              noStyle
            >
              <ModalSelect
                transformKey="poolName"
                title={intl.formatMessage({
                  id: "virtualization.select.data.volume.ceph.pool",
                  defaultMessage: "Select a storage pool",
                })}
                className="!w-full"
                autoDispatch
                modalZIndex={1200}
              >
                <CephPoolList
                  view="select"
                  defaultQuery={{
                    conditions: formatConditions({
                      primaryStorageUuid: targetPrimaryStorage?.uuid,
                      type: "Data",
                    }),
                  }}
                />
              </ModalSelect>
            </Form.Item>
          );
        }}
      </Form.Item>
    );
  };

  const dataVolumeMigrateColumns = [
    {
      title: intl.formatMessage({
        id: "vm.change.data.storage.data.volume.disk.name",
        defaultMessage: "Disk No.",
      }),
      dataIndex: "diskNo",
      key: "diskNo",
      width: 60,
      render: (diskNo: number) => <Text>{getDataVolumeDiskLabel(diskNo)}</Text>,
    },
    {
      title: intl.formatMessage({
        id: "vm.change.data.storage.data.volume.migrate",
        defaultMessage: "Migrate",
      }),
      dataIndex: "volumeUuid",
      key: "migrateSwitch",
      width: 90,
      render: (_volumeUuid: string, row: DataVolumeMigrateRow) =>
        renderDataVolumeMigrateSwitch(row),
    },
    {
      title: intl.formatMessage({
        id: "capacity",
        defaultMessage: "Capacity",
      }),
      dataIndex: "size",
      key: "capacity",
      width: 60,
      render: (size: number | undefined) => formatBytesToSize(size ?? 0),
    },
    {
      title: intl.formatMessage({
        id: "current.location",
        defaultMessage: "Current Location",
      }),
      dataIndex: "currentPrimaryStorage",
      key: "currentLocation",
      width: 200,
      render: (
        _currentPrimaryStorage: DataVolumeMigrateRow["currentPrimaryStorage"],
        row: DataVolumeMigrateRow,
      ) => (
        <Text>
          {row.currentPrimaryStorage?.name ||
            row.volume.primaryStorageUuid ||
            "-"}
        </Text>
      ),
    },
    {
      title: (
        <span className="inline-flex items-center gap-1">
          {intl.formatMessage({
            id: "vm.change.data.storage.data.volume.target.storage",
            defaultMessage: "Target Storage",
          })}
          <span className="text-danger-500">*</span>
        </span>
      ),
      dataIndex: "volumeUuid",
      key: "targetLocation",
      width: 200,
      render: (_volumeUuid: string, row: DataVolumeMigrateRow) =>
        renderDataVolumeTargetStorage(row),
    },
    {
      title: intl.formatMessage({
        id: "storage.pool",
        defaultMessage: "Storage Pool",
      }),
      dataIndex: "volumeUuid",
      key: "storagePool",
      width: 200,
      render: (_volumeUuid: string, row: DataVolumeMigrateRow) =>
        renderDataVolumeStoragePool(row),
    },
  ];

  const renderDataVolumeMigrateTable = () => (
    <ZSVForm.Card
      title={intl.formatMessage({
        id: "virtualization.vm.change.data.storage.data.volume.config.card.title",
        defaultMessage: "Migration Configuration",
      })}
    >
      <div className="-ml-3 flex items-center justify-start gap-2">
        <div className="flex gap-2">
          <Button
            className="disabled:cursor-not-allowed disabled:!bg-neutral-100 disabled:!text-neutral-400 disabled:!opacity-100 disabled:!shadow-none"
            disabled={!canMigrateMoreDataVolumeRows}
            onClick={migrateAllDataVolumes}
            variant="secondary"
          >
            {intl.formatMessage({
              id: "vm.change.data.storage.data.volume.migrate.all",
              defaultMessage: "Migrate All",
            })}
          </Button>
          <Button
            className="disabled:cursor-not-allowed disabled:!bg-neutral-100 disabled:!text-neutral-400 disabled:!opacity-100 disabled:!shadow-none"
            disabled={!dataVolumeRows.some((row) => row.migrate)}
            onClick={cancelAllDataVolumes}
            variant="secondary"
          >
            {intl.formatMessage({
              id: "vm.change.data.storage.data.volume.cancel.all",
              defaultMessage: "Cancel All",
            })}
          </Button>
        </div>
        <Input
          className="w-[280px] max-w-full"
          value={dataVolumeSearchKeyword}
          onChange={(event) => setDataVolumeSearchKeyword(event.target.value)}
          placeholder={intl.formatMessage({
            id: "search.name",
            defaultMessage: "Search by name",
          })}
          suffix={<Icon type="search" />}
        />
      </div>
      <ClearOriginDataField
        value={dataVolumePrimaryStorageTrashWarning}
        className="mt-2 -ml-3"
      />
      <div className="mt-2 -ml-3 overflow-x-auto rounded-sm border border-solid border-neutral-300">
        <Table
          rowKey="volumeUuid"
          className="zsv-table zsv-table-height-320 w-full [&_.ant-switch-disabled]:!opacity-50"
          columns={dataVolumeMigrateColumns}
          dataSource={filteredDataVolumeRows}
          showClear={false}
          fixHeaderOnTop={false}
          tableLayout="fixed"
          scroll={{ x: "max-content" }}
        />
      </div>
    </ZSVForm.Card>
  );

  const selectPrimaryStorage = () => {
    const onFinish = (values: any) => {
      const systemTags: string[] = [];
      const {
        rootVolumeStoragePool = [],
        primaryStroage,
        bandWidth,
        migrateDisk,
      } = values;
      const dstPrimaryStorageUuid = primaryStroage?.[0]?.uuid ?? "";

      if (
        primaryStroage?.length > 0 &&
        primaryStroage?.[0]?.type === PrimaryStorageType.Ceph
      ) {
        if (rootVolumeStoragePool?.length > 0) {
          systemTags.push(
            `ceph::rootPoolName::${rootVolumeStoragePool?.[0]?.poolName}`,
          );
        }
        // 数据盘和根盘 pool强绑定
        if (migrateDisk && rootVolumeStoragePool.length > 0) {
          systemTags.push(
            `ceph::pool::${rootVolumeStoragePool?.[0]?.poolName}`,
          );
        }
      }

      const payload: StorageMigratePayload = {
        vmInstanceUuid: vm.uuid,
        dstHostUuid: vm?.hostUuid,
        volumeMigrationAOs: buildVolumeMigrationAOs(
          vm.allVolumes,
          dstPrimaryStorageUuid,
          migrateDisk,
          !isRunning,
        ),
        bandwidth: Number(bandWidth),
        systemTags,
      };

      doAction({
        mutation: storageMigrateVmInstance,
        payload,
        name: intl.formatMessage({
          id: "vm.migrate.action.title.change.primaryStorage",
          defaultMessage: "Migrate VM: Change Data Storage",
        }),
        total: selectedList?.length,
        middleState: {
          type: "VmInstance",
          field: "state",
          data: { state: VmInstanceState.Migrating },
          uuids: selectedList?.map((item) => item.uuid),
        },
        type: "VmInstance",
        onFinish: () => {
          refetch?.();
          setSelectedList?.([]);
        },
      });
      setVisible(false);
      refetch?.();
    };

    const onDataVolumeFormHandle = async () => {
      const rowsWithValues = getDataVolumeRowsWithFormValues();
      const payloadResult = buildDataVolumeMigratePayload(rowsWithValues);
      setDataVolumeRows(rowsWithValues);

      if (!payloadResult.ok) {
        setNotConfigStorageDescription(
          getDataVolumeValidationDescription(payloadResult.code),
        );
        setNotConfigStorageVisible(true);
        return;
      }

      try {
        if (vm.state === VmInstanceState.Running) {
          const vmPayload = buildDataVolumeMigrateVmPayload(
            vm.uuid,
            payloadResult.payload,
          );

          await doAction({
            mutation: storageMigrateVmInstance,
            payload: {
              ...vmPayload,
              dstHostUuid: vm?.hostUuid,
            } as StorageMigratePayload,
            name: intl.formatMessage({
              id: "vm.migrate.action.title.change.primaryStorage",
              defaultMessage: "Migrate VM: Change Data Storage",
            }),
            total: 1,
            middleState: {
              type: "VmInstance",
              field: "state",
              data: { state: VmInstanceState.Migrating },
              uuids: [vm.uuid],
            },
            type: "VmInstance",
            onFinish: () => {
              refetch?.();
            },
          });
        } else {
          await doAction({
            mutation: primaryStorageMigrateVolume,
            payload: payloadResult.payload,
            name: intl.formatMessage({
              id: "volume.migrate.action.title.change.primaryStorage",
              defaultMessage: "Migrate Volume: Change Primary Storage",
            }),
            total: payloadResult.payload.length,
            type: "Volume",
            onFinish: () => {
              refetch?.();
            },
          });
        }
      } catch {
        setNotConfigStorageDescription(
          getDataVolumeValidationDescription("SUBMIT_FAILED"),
        );
        setNotConfigStorageVisible(true);
        return;
      }

      setVisible(false);
      setSelectedList?.([]);
      refetch?.();
    };

    const onFormHandle = () => {
      if (migrationRange === MIGRATION_RANGE.DATA) {
        return onDataVolumeFormHandle();
      }

      if (hasNotSharedBlockVolume) {
        setNotSharedBlockVolumeVisible(true);
        return;
      }

      const _values = form.getFieldsValue();
      if (!_values?.primaryStroage?.length) {
        setAutoSelect(false);
        setNotConfigStorageDescription(
          intl.formatMessage({
            id: "vm.field.data.storage.validator.required",
            defaultMessage: "Select a destination data storage.",
          }),
        );
        setNotConfigStorageVisible(true);
        return;
      }
      if (currentVmSnapShotCount) {
        return setHaveSnaphsotVisible(true);
      }
      return onFinish(_values);
    };

    const values = form.getFieldsValue();

    const runningVmHaveSnapshotModal = (
      <DialogWeakP1
        title={intl.formatMessage({
          id: "vm.storage.migrate.extra.delele.snapshot.modal.title",
          defaultMessage: "Delete Snapshot?",
        })}
        type="warning"
        onConfirm={() => {
          setHaveSnaphsotVisible(false);
          onFinish(values);
        }}
        visible={haveSnaphsotVisible}
        setVisible={setHaveSnaphsotVisible}
        description={intl.formatMessage(
          {
            id: "vm.modal.storageMigrate.extra.delete.snapshot",
            defaultMessage:
              "The virtual machine has {snapshotCount} snapshots. Migrating storage while the VM is running will delete these snapshots. Proceed with caution.",
          },
          {
            snapshotCount: currentVmSnapShotCount,
          },
        )}
      />
    );

    return (
      <>
        <DialogBase
          title={intl.formatMessage({
            id: "virtualization.change.data.storage",
            defaultMessage: "Change Data Storage",
          })}
          widthClassName="w-200"
          visible={visible}
          setVisible={setVisible}
          onCancel={() => {
            setVisible(false);
          }}
          footer={
            <div className="flex items-center gap-2">
              <Button onClick={() => setVisible(false)} variant="subtle">
                {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
              </Button>
              <Button onClick={onFormHandle} variant="primary">
                {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
              </Button>
            </div>
          }
        >
          {getMigrateAlertMessage(intl, "migrateDataStorage", {
            isRunning,
            hasAttachVF: isAttachVF,
            snapshotCount: currentVmSnapShotCount,
          }) && (
            <div className="px-6 pt-6">
              <Alert variant="warning">
                {getMigrateAlertMessage(intl, "migrateDataStorage", {
                  isRunning,
                  hasAttachVF: isAttachVF,
                  snapshotCount: currentVmSnapShotCount,
                })}
              </Alert>
            </div>
          )}
          <Form
            form={form}
            name="vmInstance"
            ref={formRef}
            initialValues={{
              primaryStroage: [],
            }}
          >
            <ZSVForm.Card
              title={intl.formatMessage({
                id: "vm.change.data.storage.migration.scope",
                defaultMessage: "Migration Scope",
              })}
            >
              <Form.Item
                label={intl.formatMessage({
                  id: "vm.change.data.storage.scope.label",
                  defaultMessage: "Scope",
                })}
              >
                <div className="flex gap-8">
                  <label
                    className={cls("inline-flex items-center gap-2", {
                      "cursor-not-allowed text-neutral-400 [&_input]:cursor-not-allowed":
                        systemDiskRangeDisabled,
                      "cursor-pointer text-neutral-700 [&_input]:cursor-pointer":
                        !systemDiskRangeDisabled,
                    })}
                  >
                    <input
                      type="radio"
                      checked={migrationRange === MIGRATION_RANGE.SYSTEM}
                      disabled={systemDiskRangeDisabled}
                      onChange={() => {
                        if (!systemDiskRangeDisabled) {
                          setMigrationRange(MIGRATION_RANGE.SYSTEM);
                        }
                      }}
                    />
                    {intl.formatMessage({
                      id: "vm.change.data.storage.scope.system.disk",
                      defaultMessage: "System Disk",
                    })}
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-neutral-700 [&_input]:cursor-pointer">
                    <input
                      type="radio"
                      checked={migrationRange === MIGRATION_RANGE.DATA}
                      onChange={() => setMigrationRange(MIGRATION_RANGE.DATA)}
                    />
                    {intl.formatMessage({
                      id: "vm.change.data.storage.scope.data.disk",
                      defaultMessage: "Data Disk",
                    })}
                  </label>
                </div>
              </Form.Item>
            </ZSVForm.Card>
            {migrationRange === MIGRATION_RANGE.SYSTEM ? (
              <>
                <ZSVForm.Card
                  title={intl.formatMessage({
                    id: "virtualization.vm.change.host.form.config.card.title",
                    defaultMessage: "Migration Configuration",
                  })}
                >
                  <div className={actionStyles["resource-card"]}>
                    <div className={actionStyles["flex-1"]}>
                      <div className={actionStyles.rect} />
                      <div className={actionStyles.item}>
                        <div className={actionStyles["item-title"]}>
                          {intl.formatMessage({
                            id: "current.location",
                            defaultMessage: "Current Location",
                          })}
                        </div>
                        <Form.Item
                          label={intl.formatMessage({
                            id: "sourcePrimaryStorage",
                            defaultMessage: "Source Data Storage",
                          })}
                          name="sourcePrimaryStorage"
                          textFormItem
                        >
                          <div>
                            <Text>{sourcePrimaryStorageInfo?.name}</Text>
                          </div>
                        </Form.Item>
                      </div>
                    </div>

                    <div className={actionStyles["resource-icon"]}>
                      <Icon
                        type="arrowhead"
                        className={actionStyles["arrow-icon"]}
                      />
                    </div>

                    <div className={actionStyles["flex-1"]}>
                      <div
                        className={cls(
                          actionStyles.rect,
                          actionStyles["target-bg-color"],
                        )}
                      />
                      <div className={actionStyles.item}>
                        <div className={actionStyles["item-title"]}>
                          {intl.formatMessage({
                            id: "target.location",
                            defaultMessage: "Destination Location",
                          })}
                        </div>
                        <Form.Item
                          name="primaryStroage"
                          label={intl.formatMessage({
                            id: "targetPrimaryStorage",
                            defaultMessage: "Destination Data Storage",
                          })}
                          required
                          rules={[
                            {
                              validator(__, value) {
                                return (
                                  value?.[0]?.uuid &&
                                  validPrimaryStorageTrash(value?.[0]?.uuid)
                                );
                              },
                            },
                          ]}
                        >
                          <ModalSelect
                            className={actionStyles["width-180"]}
                            title={intl.formatMessage({
                              id: "virtualization.select.target.primary.storage",
                              defaultMessage: "Select Destination Data Storage",
                            })}
                            autoSelect={autoSelect}
                            autoSelectGql={primaryStorageList}
                            modalZIndex={1200}
                          >
                            <PrimaryStorageList
                              view="select"
                              defaultQuery={primaryStorageDefaultQuery}
                            />
                          </ModalSelect>
                        </Form.Item>
                      </div>
                    </div>
                  </div>

                  <Form.Item noStyle name="primaryStorageTrashWarning">
                    <ClearOriginDataField />
                  </Form.Item>
                </ZSVForm.Card>
                <ZSVForm.Card
                  title={intl.formatMessage({
                    id: "virtualization.vm.change.host.form.advance.config.card.title",
                    defaultMessage: "Advanced Settings",
                  })}
                >
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, cur) =>
                      prev.primaryStroage !== cur.primaryStroage
                    }
                  >
                    {({ getFieldValue }) => {
                      const primaryStorage =
                        getFieldValue("primaryStroage")?.[0];
                      return primaryStorage?.type ===
                        PrimaryStorageType.Ceph ? (
                        <Form.Item
                          name="rootVolumeStoragePool"
                          label={intl.formatMessage({
                            id: "virtualization.volume.one.ceph.pool",
                            defaultMessage: "Disk 1 Storage Pool",
                          })}
                          dependencies={["primaryStroage"]}
                          rules={[
                            {
                              required:
                                primaryStorage?.uuid ===
                                sourcePrimaryStorageInfo?.uuid,
                              message: intl.formatMessage({
                                id: "vm.field.rootVolumeStoragePool.validator.required",
                                defaultMessage: "Select a disk 1 storage pool.",
                              }),
                            },
                          ]}
                        >
                          <ModalSelect
                            transformKey="poolName"
                            title={intl.formatMessage({
                              id: "virtualization.select.root.ceph.pool",
                              defaultMessage: "Select Disk 1 Storage Pool",
                            })}
                            className={styles["width-320"]}
                            autoDispatch={true}
                            modalZIndex={1200}
                          >
                            <CephPoolList
                              view="select"
                              defaultQuery={{
                                conditions: formatConditions({
                                  primaryStorageUuid: primaryStorage?.uuid,
                                  type: VolumeType.Root,
                                }),
                              }}
                            />
                          </ModalSelect>
                        </Form.Item>
                      ) : null;
                    }}
                  </Form.Item>

                  {migrateDataVolumeFlag && (
                    <Form.Item
                      name="migrateDisk"
                      label={intl.formatMessage({
                        id: "migrate.disk",
                        defaultMessage: "Migrate Data Disk",
                      })}
                      valuePropName="checked"
                      description={
                        <div>
                          {intl.formatMessage({
                            id: "migrate.data.disk.checkbox.description",
                            defaultMessage:
                              "when the destination data storage is ZCE distributed storage, all data disks will be migrated to the storage pool where disk 1 resides.",
                          })}
                        </div>
                      }
                    >
                      <FormCheckbox
                        label={intl.formatMessage({
                          id: "migrate.data.disk.checkbox.content",
                          defaultMessage: "Migrate all attached disks on the VM",
                        })}
                      />
                    </Form.Item>
                  )}

                  {vm.state !== VmInstanceState.Stopped && (
                    <Form.Item noStyle>
                      <div className={styles.flex}>
                        <Form.Item
                          name="bandWidth"
                          label={intl.formatMessage({
                            id: "migrate.bandWidth",
                            defaultMessage: "Migration Bandwidth",
                          })}
                          icon="info"
                          iconTooltip={{
                            title: (
                              <ReactMarkdown>
                                {intl.formatMessage({
                                  id: "migrate.storage.host.bandWidth.tooltip",
                                  defaultMessage: `### Migration Bandwidth

Specify the data transmission rate in a VM storage migration. Default: Unlimited.

1. The platform limits the maximum I/O read rate of the  entire virtual machine in the source data storage.
2. Set a reasonale migration bandwidth according to the actual business requirements and network storage conditions to aviod affecting normal business operations.`,
                                })}
                              </ReactMarkdown>
                            ),
                          }}
                          rules={[
                            {
                              validator(_rules, value) {
                                if (!value || value.trim() === "") {
                                  return Promise.resolve();
                                }
                                const reg = new RegExp(/^[0-9]*$/);
                                if (reg.test(value)) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(
                                  new Error(
                                    intl.formatMessage({
                                      id: "secretServer.create.field.keyNumSM2.validate.format",
                                      defaultMessage: "Digits only.",
                                    }),
                                  ),
                                );
                              },
                            },
                            validBand,
                          ]}
                        >
                          <Input
                            style={INPUT_BANDWIDTH_STYLE}
                            placeholder={intl.formatMessage({
                              id: "unlimited",
                              defaultMessage: "Unlimited",
                            })}
                          />
                        </Form.Item>
                        <span>MB/s</span>
                      </div>
                    </Form.Item>
                  )}
                </ZSVForm.Card>
              </>
            ) : (
              renderDataVolumeMigrateTable()
            )}
          </Form>
        </DialogBase>
        {runningVmHaveSnapshotModal}
        <DialogWeak
          title={intl.formatMessage({
            id: "vm.modal.title.cannot.change.data.storage",
            defaultMessage: "Cannot Change Data Storage",
          })}
          type="warning"
          visible={notConfigStorageVisible}
          setVisible={setNotConfigStorageVisible}
          onConfirm={() => {
            setNotConfigStorageVisible(false);
          }}
          description={
            notConfigStorageDescription ||
            intl.formatMessage({
              id: "vm.field.data.storage.validator.required",
              defaultMessage: "Select a destination data storage.",
            })
          }
          footer={
            <div style={FOOTER_DIALOG_STYLE}>
              <Button
                onClick={() => {
                  setNotConfigStorageVisible(false);
                }}
                variant="primary"
              >
                {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
              </Button>
            </div>
          }
        />
        {detachNotSharedBlockVolumeModal}
      </>
    );
  };

  if (data) {
    const { storageMigrateVmInstancedepends } = data as {
      storageMigrateVmInstancedepends: IStorageMigrateVmInstancedepends;
    };

    if (isRunning || vm?.state === VmInstanceState.Paused) {
      if (
        isRunning &&
        isAttachVF &&
        vm?.toolsState !== GuestToolsState.Installed
      ) {
        return VmToolsNotRunningModal;
      }

      if (
        hasAttachedIso ||
        isAttachedShareableVolume ||
        storageMigrateVmInstancedepends.isAttachedScsiLunDevice ||
        storageMigrateVmInstancedepends.hasPeripheralAttached ||
        storageMigrateVmInstancedepends.hasUnavailableUsbDevice
      ) {
        return runningVDetachRelateDeviceModal;
      }

      if (isRunning && !preConfirmed) {
        return runningPreConfirmModal;
      }

      return selectPrimaryStorage();
    }

    if (vm.state === VmInstanceState.Stopped) {
      if (
        hasAttachedIso ||
        isAttachedShareableVolume ||
        storageMigrateVmInstancedepends.isAttachedScsiLunDevice ||
        storageMigrateVmInstancedepends.hasPeripheralAttached ||
        storageMigrateVmInstancedepends.hasUnavailableUsbDevice
      ) {
        return stoppedVmDetachRelateDeviceModal;
      }
      if (isAttachedVolume) {
        if (
          [PrimaryStorageType.Ceph, PrimaryStorageType.NFS].includes(
            primaryStorageType as PrimaryStorageType,
          )
        ) {
          return hasDataVolumeMigrateCapability
            ? selectPrimaryStorage()
            : detachVolumeModal;
        }
        if (
          primaryStorageType === PrimaryStorageType.SharedBlock ||
          hasDataVolumeMigrateCapability
        ) {
          return selectPrimaryStorage();
        }
      } else {
        return selectPrimaryStorage();
      }
    }
    return <div />;
  }

  return <div />;
};

export default Migrate;
