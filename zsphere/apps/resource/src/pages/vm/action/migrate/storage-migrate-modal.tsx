import { gql, useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { Button, DialogFooter } from "@zstack/design";
import { Checkbox } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { primaryStorageList } from "@zstack/virtualization-resource/src/gql/primary-storage.gql";
import { getStorageMigrateVmInstancedepends } from "@zstack/virtualization-resource/src/gql/vm.gql";
import CephPoolList from "@zstack/virtualization-resource/src/pages/ceph-primary-storage-pool/list";
import HostList from "@zstack/virtualization-resource/src/pages/host/list";
import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import {
  Form,
  Input,
  ModalSelect,
  Switch,
  ZSVForm,
} from "@zstack/zsphere-components";
import { DialogWeak, DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import {
  GuestToolsState,
  HostQueryType,
  Op,
  PrimaryStorageQueryType,
  VmInstanceState,
} from "@zstack/zsphere-types";
import type {
  StorageMigrateVmInstancedepends as IStorageMigrateVmInstancedepends,
  VmInstance as IVM,
  StorageMigratePayload,
  Volume,
} from "@zstack/zsphere-types/graphql";
import { formatConditions, isIn, parseNumber } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/lib/form";
import cls from "classnames";
import {
  some as _some,
  filter as _filter,
  includes as _includes,
  get as _get,
  every as _every,
} from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import ClearOriginDataField from "./components/ClearOriginDataField";
import {
  getMigrateAlertMessage,
  isRootAndDataVolumePsTypeDifferent,
} from "./utils";

import actionStyles from "../style.module.less";
import styles from "./style.module.less";

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

const { apolloClient } = window.g_main;

const storageMigrateVmInstance = gql`
  mutation storageMigrateVmInstance($input: StorageMigrateVmInstanceInput!) {
    storageMigrateVmInstance(input: $input) {
      actionId
    }
  }
`;

const GET_VM_SNAPSHOT_COUNT = gql`
  query getVMSnapshoCount($conditions: [Condition!]) {
    volumeSnapshotList(conditions: $conditions) {
      total
    }
  }
`;

const RESOURCE_CONFIG_LIST = gql`
  query resourceConfigList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
  ) {
    resourceConfigList(
      conditions: $conditions
      extraConditions: $extraConditions
    ) {
      list {
        resourceType
        resourceUuid
        uuid
        globalConfigValue
        dependentResourceType
        value
        name
        category
      }
    }
  }
`;

// Style constants
const MIGRATE_DISK_DESCRIPTION_STYLE = {
  position: "relative",
  top: 3,
} as const;
const INPUT_BANDWIDTH_STYLE = { width: 160, marginRight: 4 } as const;

//物理机与主存储
const Migrate: React.FC<IActionWrapperProps<IVM>> = ({
  refetch,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const [form] = Form.useForm();
  const formRef = React.createRef<FormInstance>();
  const [haveSnaphsotVisible, setHaveSnaphsotVisible] =
    useState<boolean>(false);
  const [notConfigStorageVisible, setNotConfigStorageVisible] =
    useState<boolean>(false);
  const [noAvailableTargetHostVisible, setNoAvailableTargetHostVisible] =
    useState<boolean>(false);
  const [selectTargetHostVisible, setSelectTargetHostVisible] =
    useState<boolean>(false);
  const [autoSelect, setAutoSelect] = useState<boolean>(true);
  const [withDataVolumes, setWithDataVolumes] = useState<boolean>(false);
  const [preConfirmVisible, setPreConfirmVisible] = useState<boolean>(false);
  const [preConfirmed, setPreConfirmed] = useState<boolean>(false);

  const migrateDataVolumeFlag: boolean =
    selectedList.filter((t: IVM) => t?.allVolumes && t?.allVolumes?.length > 1)
      ?.length > 0;

  const {
    rootAndDataVolumePsTypeDifferent,
    vm,
    isRunning,
    sourcePrimaryStorageInfo,
    primaryStorageType,
    hasAttachedIso,
    isAttachedShareableVolume,
    isAttachVF,
    isAttachedVolume,
  } = useMemo((): {
    rootAndDataVolumePsTypeDifferent: boolean;
    vm: IVM;
    isRunning: boolean;
    sourcePrimaryStorageInfo: any;
    primaryStorageType: string;
    hasAttachedIso: boolean;
    isAttachedShareableVolume: boolean;
    isAttachVF: boolean;
    isAttachedVolume: boolean;
  } => {
    const instance = (selectedList?.[0] || {}) as IVM;
    const _isRunning: boolean = instance?.state === VmInstanceState.Running;
    const _isAttachedShareableVolume: boolean =
      !!instance?.attachedShareableVolumeUuidList?.length;
    const _rootAndDataVolumePsTypeDifferent =
      isRootAndDataVolumePsTypeDifferent(instance);

    return {
      rootAndDataVolumePsTypeDifferent: _rootAndDataVolumePsTypeDifferent,
      vm: instance,
      isRunning: _isRunning,
      sourcePrimaryStorageInfo: instance?.primaryStorage,
      primaryStorageType: instance?.primaryStorage?.type || "",
      hasAttachedIso: instance?.vmCdRoms?.some((it) => it.isoUuid) ?? false,
      isAttachedShareableVolume: _isAttachedShareableVolume,
      isAttachVF:
        _isRunning &&
        _some(instance?.vmNics || [], (item) => item.type === "VF"),
      isAttachedVolume:
        (instance?.allVolumes?.length ?? 0) >= 2 || _isAttachedShareableVolume,
    };
  }, [selectedList]);

  const [getDepends, { data }] = useLazyQuery(
    getStorageMigrateVmInstancedepends,
  );

  const [queyGlobalConfig] = useLazyQuery(RESOURCE_CONFIG_LIST, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
    onCompleted: (_data: any) => {
      form.setFieldsValue({
        autoconvergencePolicy:
          _data?.resourceConfigList?.list?.[0]?.value === "true",
      });
    },
  });

  const [getSnapshoCount, { data: currentVmSnapshotList = {} }] = useLazyQuery(
    GET_VM_SNAPSHOT_COUNT,
  );

  const currentVmSnapShotCount = useMemo(() => {
    return currentVmSnapshotList?.volumeSnapshotList?.total;
  }, [currentVmSnapshotList?.volumeSnapshotList?.total]);

  //
  //
  // 原来的非同一ceph存储之间的迁移，trash检查逻辑不变
  const validPrimaryStorageTrash = async (psUuid: any) => {
    const { data: trash } = await apolloClient.query({
      query: gql`
        query getTrashOnPrimaryStorage($uuid: String!) {
          getTrashOnPrimaryStorage(uuid: $uuid) {
            list {
              resourceUuid
              resourceType
              trashType
            }
          }
        }
      `,
      variables: {
        uuid: psUuid,
      },
      fetchPolicy: "no-cache",
    });

    const trashList = trash?.getTrashOnPrimaryStorage?.list || [];

    if (trashList?.length) {
      let haveTrashWithVolumes: Volume[] = [];
      if (withDataVolumes) {
        const volumeList = _get(vm, "allVolumes", []);
        const trashResourceUuid = trashList?.map((it: any) => it?.resourceUuid);
        haveTrashWithVolumes = _filter(volumeList, (volume) =>
          _includes(trashResourceUuid, volume?.uuid),
        );
      }
      const _haveTrashWithVolumeUuids = haveTrashWithVolumes?.map(
        (volume) => volume?.uuid,
      );
      const rootVolumeUuid = _get(vm, "rootVolumeUuid", "");
      if (
        _some(trashList, (it) => it.resourceUuid === rootVolumeUuid) &&
        _every(haveTrashWithVolumes, (it) => it.uuid !== rootVolumeUuid)
      ) {
        _haveTrashWithVolumeUuids.push(rootVolumeUuid);
      }
      if (_haveTrashWithVolumeUuids?.length) {
        if (
          !(
            sourcePrimaryStorageInfo?.uuid === psUuid &&
            sourcePrimaryStorageInfo?.type === "Ceph"
          )
        ) {
          form.setFieldsValue({
            primaryStorageTrashWarning: intl.formatMessage(
              {
                id: "vm.migrate.validator.clearOriginData.alert.message",
                defaultMessage:
                  "Detection of Data Storage {primaryStroage} found residual original data due to cross-storage migration retention. You can navigate to the 'Data Cleanup' sub-page on the target data storage details page to clean up the original data.",
              },
              {
                primaryStroage:
                  form?.getFieldValue("primaryStroage")?.[0]?.name,
              },
            ),
          });
          return;
        }
      }
    }
    form.setFieldsValue({
      primaryStorageTrashWarning: "",
    });
    return;
  };

  useEffect(() => {
    if (visible) {
      setWithDataVolumes(isRunning);
      setPreConfirmed(false);
      setPreConfirmVisible(!!isRunning);
      form.resetFields();
    }
  }, [isRunning, visible]);

  useEffect(() => {
    if (visible && vm) {
      queyGlobalConfig({
        variables: {
          conditions: [
            {
              key: "categoryList",
              values: ["kvm"],
              op: Op.in,
            },
            {
              key: "nameList",
              values: ["migrate.autoConverge"],
              op: Op.in,
            },
            {
              key: "resourceUuid",
              value: vm.uuid,
              op: Op.eq,
            },
          ],
        },
      });
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
      form.setFieldsValue({
        // ZSV-11455: 当根盘和数据盘存储类型不同时，强制勾选迁移数据盘
        // 当 VM 处于运行状态且有数据盘时，也默认勾选，避免迁移失败
        migrateDisk:
          rootAndDataVolumePsTypeDifferent ||
          (isRunning && migrateDataVolumeFlag),
        primaryStroage: [],
      });
    }
  }, [visible, vm]);

  const runningVmDetachRelateDeviceModal = (
    <DialogWeak
      title={String(
        intl.formatMessage({
          id: "vm.modal.title.cannot.changeHostAndPrimaryStorage",
          defaultMessage: "Cannot Change Host and Data Storage",
        }),
      )}
      type="warning"
      onConfirm={() => {
        setVisible(false);
      }}
      visible={visible}
      setVisible={setVisible}
      description={intl.formatMessage({
        id: "vm.modal.storageMigrate.extra.detach.iso.sharedvolume.block.device.vfnic.on.vm",
        defaultMessage:
          "Detach all ISOs, shared disks, LUNs, and passed-through USB devices from the virtual machine and try again.",
      })}
    />
  );

  const VmToolsNotRunningModal = (
    <DialogWeak
      title={String(
        intl.formatMessage({
          id: "vm.modal.title.cannot.changeHostAndPrimaryStorage",
          defaultMessage: "Cannot Change Host and Data Storage",
        }),
      )}
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
        <Button onClick={() => setVisible(false)} variant="primary">
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      }
    />
  );

  const stoppedVmDetachRelateDeviceModal = (
    <DialogWeak
      title={String(
        intl.formatMessage({
          id: "vm.modal.title.cannot.changeHostAndPrimaryStorage",
          defaultMessage: "Cannot Change Host and Data Storage",
        }),
      )}
      type="warning"
      onConfirm={() => {
        setVisible(false);
      }}
      visible={visible}
      setVisible={setVisible}
      description={intl.formatMessage({
        id: "vm.modal.storageMigrate.extra.detach.iso.sharedvolume.block.device.pci.on.vm",
        defaultMessage:
          "Detach all ISOs, shared disks, LUNs, peripheral devices, and passed-through USB devices from the virtual machine and try again.",
      })}
    />
  );

  const detachVolumeModal = (
    <DialogWeak
      title={String(
        intl.formatMessage({
          id: "vm.modal.title.cannot.changeHostAndPrimaryStorage",
          defaultMessage: "Cannot Change Host and Data Storage",
        }),
      )}
      type="warning"
      onConfirm={() => {
        setVisible(false);
      }}
      visible={visible}
      setVisible={setVisible}
      description={intl.formatMessage({
        id: "vm.modal.storageMigrate.extra.detach.volume",
        defaultMessage: "Detach all of the attached data disks from the virtual machine and try again.",
      })}
    />
  );

  const noAvailableTargetHostModal = (
    <DialogWeak
      title={String(
        intl.formatMessage({
          id: "vm.modal.title.no.available.target.host",
          defaultMessage: "No Available Destination Host",
        }),
      )}
      type="warning"
      visible={noAvailableTargetHostVisible}
      setVisible={setNoAvailableTargetHostVisible}
      onConfirm={() => setNoAvailableTargetHostVisible(false)}
      description={intl.formatMessage({
        id: "vm.modal.storageMigrate.no.available.target.host.msg",
        defaultMessage:
          "Select a destination data storage first. After selection, you can specify a destination host. If no host is selected, the system will automatically choose the host with the fewest running VMs among those that meet the migration conditions for the migration.",
      })}
      footer={
        <Button
          onClick={() => {
            setNoAvailableTargetHostVisible(false);
          }}
          variant="primary"
        >
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      }
    />
  );

  const notConfigStorageModal = (
    <DialogWeak
      title={String(
        intl.formatMessage({
          id: "vm.modal.title.cannot.change.host.and.data.storage",
          defaultMessage: "Cannot Change Host and Data Storage",
        }),
      )}
      type="warning"
      visible={notConfigStorageVisible}
      setVisible={setNotConfigStorageVisible}
      onConfirm={() => setNotConfigStorageVisible(false)}
      description={intl.formatMessage({
        id: "vm.field.data.storage.validator.required",
        defaultMessage: "Select a destination data storage.",
      })}
      footer={
        <Button
          onClick={() => {
            setNotConfigStorageVisible(false);
          }}
          variant="primary"
        >
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      }
    />
  );

  const runningPreConfirmModal = (
    <DialogWeakP1
      title={String(
        intl.formatMessage({
          id: "vm.modal.title.confirm.change.hostAndPrimaryStorage",
          defaultMessage: "Change Host and Data Storage?",
        }),
      )}
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
            id: "vm.modal.change.host.and.data.storage.preconfirm.message",
            defaultMessage:
              "To ensure a smooth migration and minimize impact on your applications, we recommend：\n\n- Avoid large-scale data operations during the migration.\n- Reduce non-critical workloads appropriately.\n- Perform migration during off-peak business hours.",
          })}
        </ReactMarkdown>
      }
    />
  );

  const primaryStorageDefaultQuery: IQuery = useMemo(() => {
    if (sourcePrimaryStorageInfo?.type === "Ceph") {
      return {
        //Ceph不过滤
        type: PrimaryStorageQueryType.StorageMigrateVm,
        extraConditions: [
          {
            key: "vmInstanceUuid",
            op: Op.eq,
            value: vm.uuid,
          },
        ],
      };
    }

    const defaultQuery: IQuery = {
      //过滤掉源主存储
      conditions: [
        {
          key: "uuid",
          op: Op.ne,
          value: sourcePrimaryStorageInfo?.uuid,
        },
      ],
      type: PrimaryStorageQueryType.StorageMigrateVm,
      extraConditions: [
        {
          key: "vmInstanceUuid",
          op: Op.eq,
          value: vm.uuid,
        },
      ],
    };

    return defaultQuery;
  }, [sourcePrimaryStorageInfo, vm.uuid]);

  const validBand = () => {
    return {
      validateTrigger: "onChange",
      validator(rules: any, value: string) {
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

  const selectPrimaryStorage = () => {
    const onFinish = (values: any = {}) => {
      const systemTags: string[] = [];
      const {
        rootVolumeStoragePool,
        primaryStroage,
        bandWidth,
        migrateDisk,
        autoconvergencePolicy,
        dstHostList = [],
      } = values;

      if (primaryStroage?.length > 0 && primaryStroage?.[0]?.type === "Ceph") {
        if (rootVolumeStoragePool?.length > 0) {
          systemTags.push(
            `ceph::rootPoolName::${rootVolumeStoragePool?.[0]?.poolName}`,
          );
        }
        // 数据盘和根盘强绑定
        if (migrateDisk && rootVolumeStoragePool?.length > 0) {
          systemTags.push(
            `ceph::pool::${rootVolumeStoragePool?.[0]?.poolName}`,
          );
        }
      }

      const payload: StorageMigratePayload = {
        vmInstanceUuid: vm.uuid,
        dstPrimaryStorageUuid: primaryStroage?.[0]?.uuid,
        dstHostUuid: dstHostList?.[0]?.uuid || undefined,
        withDataVolumes: migrateDisk,
        withSnapshots: !isRunning,
        bandwidth: Number(bandWidth),
        strategy: autoconvergencePolicy ? "auto-converge" : undefined,
        systemTags,
      };

      doAction({
        mutation: storageMigrateVmInstance,
        payload,
        name: intl.formatMessage({
          id: "vm.migrate.action.title.change.hostAndPrimaryStorage",
          defaultMessage: "Migrate VM: Change Host and Data Storage",
        }),
        total: selectedList.length,
        middleState: {
          type: "VmInstance",
          field: "state",
          data: { state: VmInstanceState.Migrating },
          uuids: selectedList.map((item) => item.uuid),
        },
        type: "VmInstance",
        onFinish: () => {
          refetch?.();
          setSelectedList?.([]);
        },
      });
      refetch?.();
      setVisible(false);
    };

    const onFormHandle = () => {
      const _values = form.getFieldsValue();
      if (!_values?.primaryStroage?.length) {
        setAutoSelect(false);
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
        title={String(
          intl.formatMessage({
            id: "vm.storage.migrate.extra.delele.snapshot.modal.title",
            defaultMessage: "Delete Snapshot?",
          }),
        )}
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
        <DialogForm
          alertType="warning"
          alertMessage={getMigrateAlertMessage(intl, "migrateHostAndStorage", {
            isRunning,
            hasSchedulingRule: !!vm?.vmGroup?.vmSchedulingRuleCount,
            hasAttachVF: isAttachVF,
            snapshotCount: currentVmSnapShotCount,
          })}
          title={intl.formatMessage({
            id: "vm.migrate.modal.title.change.hostAndPrimaryStorage",
            defaultMessage: "Change Host and Data Storage",
          })}
          resourceName={vm?.name}
          widthClassName="w-200"
          closable={true}
          visible={visible && (!isRunning || preConfirmed)}
          setVisible={setVisible}
          bodyStyle={{ padding: 0 }}
          form={form}
          onCancel={() => {
            setVisible(false);
          }}
          footer={
            <DialogFooter className="gap-2">
              <Button onClick={() => setVisible(false)} variant="link">
                {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
              </Button>
              <Button onClick={onFormHandle} variant="primary">
                {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
              </Button>
            </DialogFooter>
          }
        >
          <Form
            form={form}
            name="vmInstance"
            ref={formRef}
            initialValues={{
              primaryStroageUuid: "",
              primaryStroage: [],
              allocation: "auto",
              dstHostList: [],
            }}
          >
            <ZSVForm.Card
              title={intl.formatMessage({
                id: "virtualization.vm.change.host.form.config.card.title",
                defaultMessage: "Migration Configuration",
              })}
            >
              <div className={actionStyles["resource-card"]}>
                <div className={actionStyles["flex-1"]}>
                  <div className={cls(actionStyles.rect)} />
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
                    <Form.Item
                      name="sourceHost"
                      label={intl.formatMessage({
                        id: "source.host",
                        defaultMessage: "Source Host",
                      })}
                    >
                      <div>
                        <Text>{vm?.host?.name ?? vm?.lastHost?.name}</Text>
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
                        title={intl.formatMessage({
                          id: "virtualization.select.target.primary.storage",
                          defaultMessage: "Select Destination Data Storage",
                        })}
                        className={styles["width-180"]}
                        onChange={() => {
                          form.resetFields([
                            "rootVolumeStoragePool",
                            "dataVolumeStoragePool",
                            "dstHostList",
                          ]);
                        }}
                        autoSelect={autoSelect}
                        autoSelectGql={primaryStorageList}
                      >
                        <PrimaryStorageList
                          view="select"
                          defaultQuery={primaryStorageDefaultQuery}
                        />
                      </ModalSelect>
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, curr) =>
                        prev.primaryStroage !== curr.primaryStroage
                      }
                    >
                      {({ getFieldValue }) => {
                        const primaryStorage =
                          getFieldValue("primaryStroage")?.[0];
                        const hostQuery = {
                          type: HostQueryType.GetHostCandidatesForVmMigration,
                          extraConditions: [
                            {
                              key: "vmInstanceUuid",
                              op: Op.eq,
                              value: vm?.uuid,
                            },
                            {
                              key: "dstPrimaryStorageUuid",
                              op: Op.eq,
                              value: primaryStorage?.uuid,
                            },
                          ],
                        };
                        return (
                          <Form.Item
                            label={intl.formatMessage({
                              id: "targetHost",
                              defaultMessage: "Destination Host",
                            })}
                            tooltip={
                              !isRunning
                                ? intl.formatMessage({
                                    id: "vm.changeHostAndPrimaryStorage.allocation.specify.disabled.stoped.tooltip",
                                    defaultMessage:
                                      "You cannot specify a destination host when migrating a stopped virtual machine.",
                                  })
                                : undefined
                            }
                            className={styles.targetHostType}
                            name="dstHostList"
                          >
                            <ModalSelect
                              visible={selectTargetHostVisible}
                              setVisible={setSelectTargetHostVisible}
                              onSelectModalShow={() => {
                                if (!primaryStorage) {
                                  setNoAvailableTargetHostVisible(true);
                                  return;
                                }
                                if (isRunning) {
                                  setSelectTargetHostVisible(true);
                                }
                              }}
                              disabledItem={!isRunning}
                              title={intl.formatMessage({
                                id: "select.targetHost",
                                defaultMessage: "Select Target Host",
                              })}
                              label={intl.formatMessage({
                                id: "select.targetHost",
                                defaultMessage: "Select Target Host",
                              })}
                              className={styles["width-180"]}
                              autoDispatch={true}
                            >
                              <HostList
                                view="select"
                                defaultQuery={hostQuery}
                              />
                            </ModalSelect>
                          </Form.Item>
                        );
                      }}
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
              className={styles.advanceConfigCard}
            >
              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) =>
                  prev.primaryStroage !== cur.primaryStroage
                }
              >
                {({ getFieldValue }) => {
                  const primaryStorage = getFieldValue("primaryStroage")?.[0];
                  return (
                    <>
                      {primaryStorage?.type === "Ceph" && (
                        <Form.Item
                          name="rootVolumeStoragePool"
                          label={intl.formatMessage({
                            id: "virtualization.volume.one.ceph.pool",
                            defaultMessage: "Disk 1 Storage Pool",
                          })}
                          dependencies={["primaryStroage"]}
                        >
                          <ModalSelect
                            transformKey="poolName"
                            title={intl.formatMessage({
                              id: "virtualization.select.root.ceph.pool",
                              defaultMessage: "Select Disk 1 Storage Pool",
                            })}
                            className={styles["width-320"]}
                            autoDispatch={true}
                          >
                            <CephPoolList
                              view="select"
                              defaultQuery={{
                                conditions: formatConditions({
                                  primaryStorageUuid: primaryStorage?.uuid,
                                  type: "Root",
                                }),
                              }}
                            />
                          </ModalSelect>
                        </Form.Item>
                      )}
                    </>
                  );
                }}
              </Form.Item>

              {migrateDataVolumeFlag && isRunning && (
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, cur) =>
                    prev.primaryStroage !== cur.primaryStroage
                  }
                >
                  {({ getFieldValue }) => {
                    const targetPsType =
                      getFieldValue("primaryStroage")?.[0]?.type;
                    // ZSV-11558: 源存储和目标存储类型不同时（如本地→分布式），数据盘必须一起迁移
                    const isSourceAndTargetPsTypeDifferent =
                      !!targetPsType &&
                      !!sourcePrimaryStorageInfo?.type &&
                      targetPsType !== sourcePrimaryStorageInfo.type;
                    const shouldDisableMigrateDisk =
                      rootAndDataVolumePsTypeDifferent ||
                      isSourceAndTargetPsTypeDifferent;

                    if (
                      isSourceAndTargetPsTypeDifferent &&
                      !getFieldValue("migrateDisk")
                    ) {
                      // 强制勾选
                      form.setFieldsValue({ migrateDisk: true });
                    }

                    return (
                      <Form.Item
                        name="migrateDisk"
                        label={intl.formatMessage({
                          id: "migrate.disk",
                          defaultMessage: "Migrate Data Disk",
                        })}
                        valuePropName="checked"
                        description={
                          <div style={MIGRATE_DISK_DESCRIPTION_STYLE}>
                            {intl.formatMessage({
                              id: "migrate.data.disk.checkbox.description",
                              defaultMessage:
                                "when the destination data storage is ZCE distributed storage, all data disks will be migrated to the storage pool where disk 1 resides.",
                            })}
                          </div>
                        }
                      >
                        <FormCheckbox
                          disabled={shouldDisableMigrateDisk}
                          label={intl.formatMessage({
                            id: "migrate.data.disk.checkbox.content",
                            defaultMessage: "Migrate all attached disks on the VM",
                          })}
                        />
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              )}

              {isRunning && (
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
                          validator(rules, value) {
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

              {isRunning && (
                <Form.Item
                  name="autoconvergencePolicy"
                  label={intl.formatMessage({
                    id: "autoconvergencePolicy",
                    defaultMessage: "autoconvergencePolicy",
                  })}
                  icon="info"
                  iconTooltip={{
                    title: (
                      <ReactMarkdown>
                        {intl.formatMessage({
                          id: "autoConverge.tooltip",
                          defaultMessage: `### Auto-Converge

1. Allows you to enable or disable auto-converge when you hot migrate a KVM VM.

2. If the migration is blocked because the VM has been high-loaded for a long time, you can enable auto-converge to improve the success rate of the migration.

3. If your applications are performance-sensitive, we recommend that you disable auto-converge.`,
                        })}
                      </ReactMarkdown>
                    ),
                  }}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              )}
            </ZSVForm.Card>
          </Form>
        </DialogForm>
        {runningVmHaveSnapshotModal}
        {notConfigStorageModal}
        {noAvailableTargetHostModal}
      </>
    );
  };

  if (data) {
    const { storageMigrateVmInstancedepends } = data as {
      storageMigrateVmInstancedepends: IStorageMigrateVmInstancedepends;
    };

    if (isRunning) {
      if (isAttachVF && vm?.toolsState !== GuestToolsState.Installed) {
        return VmToolsNotRunningModal;
      }

      if (
        hasAttachedIso ||
        isAttachedShareableVolume ||
        storageMigrateVmInstancedepends.isAttachedScsiLunDevice ||
        storageMigrateVmInstancedepends.hasPeripheralAttached ||
        storageMigrateVmInstancedepends.hasUnavailableUsbDevice
      ) {
        return runningVmDetachRelateDeviceModal;
      }

      if (!preConfirmed) {
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
        if (["Ceph", "NFS"].indexOf(primaryStorageType) > -1) {
          return detachVolumeModal;
        }
        if (primaryStorageType === "SharedBlock") {
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
