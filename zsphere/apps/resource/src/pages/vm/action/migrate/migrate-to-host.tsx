import { gql, useLazyQuery } from "@apollo/client";
import { Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { getStorageMigrateVmInstancedepends } from "@zstack/virtualization-resource/src/gql/vm.gql";
import List from "@zstack/virtualization-resource/src/pages/host/list";
import { Form, ModalSelect, Switch, ZSVForm } from "@zstack/zsphere-components";
import {
  DialogBase,
  DialogForm,
  DialogWeakP1,
} from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import {
  GuestToolsState,
  HostQueryType,
  Op,
  VmInstanceState,
} from "@zstack/zsphere-types";
import type {
  CdRom,
  Host as IHost,
  StorageMigrateVmInstancedepends as IStorageMigrateVmInstancedepends,
  VmInstance as IVM,
  StorageMigratePayload,
  VmNic,
  Volume,
} from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/es/form";
import cls from "classnames";
import { includes as _includes, find as _find } from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { getMigrateAlertMessage } from "./utils";

import styles from "../style.module.less";

const _migrateVm = gql`
  mutation migrateVm($input: MigrateVmInput!) {
    migrateVm(input: $input) {
      actionId
    }
  }
`;

const _localStorageMigrateVolume = gql`
  mutation localStorageMigrateVolume($input: LocalStorageMigrateVolumeInput!) {
    localStorageMigrateVolume(input: $input) {
      actionId
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

interface fromData {
  autoconvergencePolicy?: boolean;
  sourceHost?: string;
  targetHost?: IHost[];
  vmInstance?: string;
}

const Migrate: React.FC<IActionWrapperProps<IVM>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const formRef = React.createRef<FormInstance>();
  const [listVisible, setListVisible] = useState<boolean>(false);
  const [strategy, setStrategy] = useState<boolean>(false);
  const [notConfigHostVisible, setNotConfigHostVisible] =
    useState<boolean>(false);
  const [preConfirmVisible, setPreConfirmVisible] = useState<boolean>(false);
  const [preConfirmed, setPreConfirmed] = useState<boolean>(false);

  const {
    vm,
    vmInstanceUuid,
    state,
    rootVolumeUuid,
    platform,
    allVolumes,
    zoneUuid,
    primaryStorage,
    rootVolumePsType,
    hasAttachedIso,
    hasAttachVF,
  } = useMemo((): {
    vm: IVM;
    vmInstanceUuid: string;
    state: string | undefined;
    rootVolumeUuid: string | undefined;
    platform: string | undefined;
    allVolumes: Volume[];
    vmCdRoms: CdRom[];
    vmNics: VmNic[];
    zoneUuid: string | undefined;
    primaryStorage: any;
    rootVolumePsType: string;
    hasAttachedIso: boolean;
    hasAttachVF: boolean;
  } => {
    const _vm = selectedList?.[0];
    return {
      vm: _vm,
      vmInstanceUuid: _vm?.uuid,
      state: _vm?.state,
      rootVolumeUuid: _vm?.rootVolumeUuid,
      platform: _vm?.platform,
      allVolumes: _vm?.allVolumes || [],
      vmCdRoms: _vm?.vmCdRoms || [],
      vmNics: _vm?.vmNics || [],
      zoneUuid: _vm?.zoneUuid,
      primaryStorage: _vm?.primaryStorage,
      rootVolumePsType: _vm?.primaryStorage?.type || "",
      hasAttachedIso: _vm?.vmCdRoms?.some((it) => it.isoUuid) || false,
      hasAttachVF: _vm?.vmNics?.some((it) => it.type === "VF") || false,
    };
  }, [selectedList]);

  /**
   * 打了内存快照会出现memory类型的盘，需要过滤
   *
   */
  const allVolumesWithoutMemory: Volume[] = allVolumes?.filter(
    (volume) => volume?.type !== "Memory",
  );

  const allAreLocalStorageVolume: boolean = allVolumesWithoutMemory?.every(
    (volume) => volume?.primaryStorage?.type === "LocalStorage",
  );

  const [queryConfig, { data: resourceConfig }] = useLazyQuery(
    RESOURCE_CONFIG_LIST,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
      onCompleted: (_data) => {
        form.setFieldsValue({
          autoconvergencePolicy:
            _data?.resourceConfigList?.list?.[0]?.value === "true",
        });
      },
    },
  );

  const isAutoConverge: boolean = useMemo(
    () => resourceConfig?.resourceConfigList?.list?.[0]?.value === "true",
    [resourceConfig],
  );

  const [getDepends, { data }] = useLazyQuery(
    getStorageMigrateVmInstancedepends,
  );

  // 合并两个 useEffect
  useEffect(() => {
    if (!visible) {
      form?.resetFields();
      setPreConfirmVisible(false);
      setPreConfirmed(false);
      setListVisible(false);
      setNotConfigHostVisible(false);
      return;
    }

    if (vmInstanceUuid) {
      // 查询配置
      queryConfig({
        variables: {
          conditions: [
            {
              key: "categoryList",
              op: Op.in,
              values: ["kvm"],
            },
            {
              key: "nameList",
              op: Op.in,
              values: ["migrate.autoConverge"],
            },
            {
              key: "resourceUuid",
              op: Op.eq,
              value: vmInstanceUuid,
            },
          ],
        },
      });

      // 获取依赖
      getDepends({ variables: { uuid: vmInstanceUuid } });
      setStrategy(isAutoConverge);

      // reset pre-confirm when opening
      setPreConfirmed(false);
      setPreConfirmVisible(_includes([VmInstanceState.Running], state));
    }
  }, [visible, vmInstanceUuid, isAutoConverge, state]);

  const defaultQuery: IQuery = useMemo(() => {
    return {
      type: _includes([VmInstanceState.Running, VmInstanceState.Paused], state)
        ? HostQueryType.GetVmMigrationCandidateHosts
        : HostQueryType.LocalStorageGetVolumeMigratableHosts,
      extraConditions: _includes(
        [VmInstanceState.Running, VmInstanceState.Paused],
        state,
      )
        ? [{ key: "vmInstanceUuid", op: Op.eq, value: vmInstanceUuid }]
        : [{ key: "volumeUuid", op: Op.eq, value: rootVolumeUuid }],
      conditions: [
        {
          key: "zoneUuid",
          value: zoneUuid,
        },
      ],
    };
  }, [rootVolumeUuid, vmInstanceUuid, state, zoneUuid]);

  const performMigration = (payload: any, mutation: any) => {
    doAction({
      mutation,
      payload,
      name: intl.formatMessage({
        id: "vm.migrate.action.title.change.host",
        defaultMessage: "Migrate VM: Change Host",
      }),
      total: 1,
      middleState: {
        type: "VmInstance",
        field: "state",
        data: { state: VmInstanceState.Migrating },
        uuids: [vmInstanceUuid],
      },
      type: "VmInstance",
      onProgress: () => {},
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  const onOk = (values: fromData) => {
    if (!values?.targetHost?.length) {
      return setNotConfigHostVisible(true);
    }

    const hostUuid = values?.targetHost[0]?.uuid;

    if (
      allAreLocalStorageVolume &&
      _includes([VmInstanceState.Running, VmInstanceState.Stopped], state)
    ) {
      const payload: StorageMigratePayload = {
        vmInstanceUuid: vmInstanceUuid || "",
        dstPrimaryStorageUuid: primaryStorage?.uuid || "",
        dstHostUuid: hostUuid || "",
        strategy: values?.autoconvergencePolicy ? "auto-converge" : undefined,
        withDataVolumes: true,
        withSnapshots: state === VmInstanceState.Stopped,
      };
      performMigration(payload, storageMigrateVmInstance);
    } else if (
      _includes([VmInstanceState.Running, VmInstanceState.Paused], state)
    ) {
      const payload = {
        vmInstanceUuid: vmInstanceUuid || "",
        strategy: values?.autoconvergencePolicy ? "auto-converge" : undefined,
        hostUuid,
      };
      performMigration(payload, _migrateVm);
    } else if (_includes([VmInstanceState.Stopped], state)) {
      const payload = {
        volumeUuid: rootVolumeUuid || "",
        destHostUuid: hostUuid,
      };
      performMigration(payload, _localStorageMigrateVolume);
    }

    refetch?.();
    setListVisible(false);
  };

  /**
   * 1, 云主机rootVolume所在主存储是['LocalStorage']
   *    A, 运行中的云主机提示（Running）
   *       提示：请先卸载云主机上所挂载的云盘、ISO，VF类型的网卡，外接设备。
   *          a, 挂载的有云盘——有本地存储的磁盘就要提示，其中root盘一定是本地存储，所以只用判断是否有挂载磁盘。  (本地存储去掉 见：)
   *          b, 有pci设备
   *          c, 挂载了USB
   *          d, 挂载了ISO
   *          e, 挂载了VF
   *    B, 非运行中的云主机提示（Paused，Stopped）
   *       提示：请先卸载云主机上所挂载的云盘、ISO以及外接设备。
   *          a, 挂载的有云盘——有本地存储的磁盘就要提示，其中root盘一定是本地存储，所以只用判断是否有挂载磁盘。
   *          b, 有pci设备
   *          c, 挂载了USB
   *          d, 挂载了ISO
   * 2, 云主机rootVolume所在主存储是['NFS', 'Ceph', 'SharedMountPoint', 'SharedBlock', 'AliyunNAS']
   *    A, 运行中的云主机（Running）
   *       提示：请先卸载云主机上所挂载的云盘，VF类型的网卡，外接设备。
   *          a, 挂载的有云盘并且云盘主存储为localStorage——只用看allVolumes,因为共享云盘的存储不是localStorage
   *          b, 有pci设备
   *          c, 挂载了usb
   *          d, 挂载了VF
   *       提示：若云主机已部署故障转移群集的master节点，迁移云主机将导致故障转移群集不可用，请谨慎操作。
   *          a: 云主机平台为：['Windows', 'WindowsVirtio']，并且挂载了lun
   *    B, 非运行中的云主机（Paused）
   *       提示：请先卸载云主机上所挂载的云盘及外接设备。
   *          a, 挂载的有云盘并且云盘主存储为localStorage——只用看allVolumes,因为共享云盘的存储不是localStorage
   *          b, 有pci设备
   *          c, 挂载了usb
   *       提示：若云主机已部署故障转移群集的master节点，迁移云主机将导致故障转移群集不可用，请谨慎操作。
   *          a: 云主机平台为：['Windows', 'WindowsVirtio']，并且挂载了lun
   */

  const LocalStorageRunningVmInstanceModal = (
    <DialogBase
      title={intl.formatMessage({
        id: "vm.modal.title.cannot.change.host",
        defaultMessage: "Cannot Change Host",
      })}
      visible={visible}
      setVisible={setVisible}
      hideCancelButton
    >
      {intl.formatMessage({
        id: "vm.modal.migrate.extra.detach.reference.iso.and.peripheral",
        defaultMessage: "Detach all ISOs, peripheral devices, and passed-through USB devices from the virtual machine and try again.",
      })}
    </DialogBase>
  );

  const LocalStorageOtherStateVmInstanceModal = (
    <DialogBase
      title={intl.formatMessage({
        id: "vm.modal.title.cannot.change.host",
        defaultMessage: "Cannot Change Host",
      })}
      visible={visible}
      setVisible={setVisible}
      hideCancelButton
    >
      {intl.formatMessage({
        id: "vm.modal.migrate.extra.detach.reference.iso.and.peripheral",
        defaultMessage: "Detach all ISOs, peripheral devices, and passed-through USB devices from the virtual machine and try again.",
      })}
    </DialogBase>
  );

  const OtherStorageAttachedLunVmInstanceModal = (
    <>
      <DialogBase
        title={intl.formatMessage({
          id: "vm.modal.title.cannot.change.host",
          defaultMessage: "Cannot Change Host",
        })}
        visible={visible}
        setVisible={setVisible}
        hideCancelButton
        onOk={() => {
          setListVisible(true);
        }}
      >
        {intl.formatMessage({
          id: "vm.modal.migrate.extra.failoverCluster",
          defaultMessage:
            "If a virtual machine is deployed as the Master node of Failover Clustering, migrating the virtual machine might cause the Failover Clustering unavailable. Please exercise caution.",
        })}
      </DialogBase>

      <DialogForm
        title={intl.formatMessage({
          id: "vm.migrate.modal.title.change.host",
          defaultMessage: "Change Host",
        })}
        widthClassName="w-150"
        visible={listVisible}
        setVisible={setListVisible}
        onCancel={() => setListVisible(false)}
        onOk={onOk}
        form={form}
      >
        <Form
          form={form}
          name="image"
          ref={formRef}
          onFinish={onOk}
          initialValues={{ downTime: { number: 1, unit: "ms" } }}
        >
          <Form.Item
            name="vmInstance"
            label={intl.formatMessage({
              id: "vmInstance",
              defaultMessage: "Virtual Machine",
            })}
          >
            {vm?.name}
          </Form.Item>
          <Form.Item
            name="sourceHost"
            label={intl.formatMessage({
              id: "source.host",
              defaultMessage: "Source Host",
            })}
            icon="info"
            iconTooltip={{
              title: (
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "source.host.tooltip",
                    defaultMessage: ``,
                  })}
                </ReactMarkdown>
              ),
            }}
          >
            {vm?.host?.name ? vm?.host?.name : "-"}
          </Form.Item>
          <Form.Item
            name="targetHost"
            label={intl.formatMessage({
              id: "target.host",
              defaultMessage: "Destination Host",
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "vm.field.targetHost.validator.required",
                  defaultMessage: "Select a target host.",
                }),
              },
            ]}
          >
            <ModalSelect
              title={intl.formatMessage({
                id: "vm.migrate.modal.title.change.host",
                defaultMessage: "Change Host",
              })}
              selectType="radio"
              className={styles["width-320"]}
            >
              <List view="select.vm.migration" defaultQuery={defaultQuery} />
            </ModalSelect>
          </Form.Item>

          {_includes(
            [VmInstanceState.Running, VmInstanceState.Paused],
            state,
          ) && (
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
            >
              <Switch checked={strategy} onChange={(val) => setStrategy(val)} />
            </Form.Item>
          )}
        </Form>
      </DialogForm>
    </>
  );

  const OtherStorageAttachedLocalVolumeRunningVmInstanceModal = (
    <DialogBase
      title={intl.formatMessage({
        id: "vm.modal.title.cannot.change.host",
        defaultMessage: "Cannot Change Host",
      })}
      visible={visible}
      setVisible={setVisible}
      hideCancelButton
    >
      {intl.formatMessage({
        id: "other-storage.attached-local-volume.vm.migrate.warning",
        defaultMessage:
          "Detach all disks, ISOs, peripheral devices, and passed-through USB devices from the virtual machine and try again.",
      })}
    </DialogBase>
  );

  const OtherStorageAttachedLocalVolumeStoppedVmInstanceModal = (
    <DialogBase
      title={intl.formatMessage({
        id: "vm.modal.title.cannot.change.host",
        defaultMessage: "Cannot Change Host",
      })}
      visible={visible}
      setVisible={setVisible}
      hideCancelButton
    >
      {intl.formatMessage({
        id: "vm.modal.migrate.extra.reference",
        defaultMessage: "Detach all data disks, ISOs, peripheral devices, and passed-through USB devices from the virtual machine and try again.",
      })}
    </DialogBase>
  );

  const VmToolsNotRunningModal = (
    <DialogBase
      title={intl.formatMessage({
        id: "vm.modal.title.vmtools.not.running",
        defaultMessage: "Cannot Change Host",
      })}
      visible={visible}
      setVisible={setVisible}
      hideCancelButton
    >
      {intl.formatMessage({
        id: "isAttachVF.vm.modal.vmtools.not.running.message",
        defaultMessage:
          "To migrate VMs with VF NICs attached, install VMTools first and make sure the VMTools is functioning properly.",
      })}
    </DialogBase>
  );

  const ConfirmIdleWarningModal = (
    <DialogWeakP1
      title={intl.formatMessage({
        id: "vm.modal.title.confirm.change.host",
        defaultMessage: "Change Host?",
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
            id: "vm.modal.change.host.preconfirm.message",
            defaultMessage:
              "To ensure a smooth migration and minimize impact on your applications, we recommend：\n\n- Avoid large-scale data operations during the migration.\n- Reduce non-critical workloads appropriately.\n- Perform migration during off-peak business hours.",
          })}
        </ReactMarkdown>
      }
    />
  );

  const MigrateList = (
    <>
      <DialogForm
        title={intl.formatMessage({
          id: "vm.migrate.modal.title.change.host",
          defaultMessage: "Change Host",
        })}
        setVisible={setVisible}
        visible={
          visible &&
          (!_includes([VmInstanceState.Running], state) || preConfirmed)
        }
        alertType="warning"
        alertMessage={getMigrateAlertMessage(intl, "migrateHost", {
          isRunning: state === VmInstanceState.Running,
          hasSchedulingRule: !!vm?.vmGroup?.vmSchedulingRuleCount,
          hasAttachVF,
        })}
        form={form}
        widthClassName="w-200"
        resourceName={vm?.name}
        closable={true}
        onCancel={() => setVisible(false)}
        onOk={onOk}
      >
        <Form form={form} name="image" ref={formRef}>
          <ZSVForm.Card
            title={intl.formatMessage({
              id: "virtualization.vm.change.host.form.config.card.title",
              defaultMessage: "Migration Configuration",
            })}
          >
            <div className={styles["resource-card"]}>
              <div className={styles["flex-1"]}>
                <div className={cls(styles.rect)} />
                <div className={styles.item}>
                  <div className={styles["item-title"]}>
                    {intl.formatMessage({
                      id: "current.location",
                      defaultMessage: "Current Location",
                    })}
                  </div>
                  <Form.Item
                    name="sourceHost"
                    label={intl.formatMessage({
                      id: "source.host",
                      defaultMessage: "Source Host",
                    })}
                  >
                    <div>
                      <Text>{vm?.host?.name ? vm?.host?.name : "-"}</Text>
                    </div>
                  </Form.Item>
                </div>
              </div>

              <div className={styles["resource-icon"]}>
                <Icon type="arrowhead" className={styles["arrow-icon"]} />
              </div>

              <div className={styles["flex-1"]}>
                <div className={cls(styles.rect, styles["target-bg-color"])} />
                <div className={styles.item}>
                  <div className={styles["item-title"]}>
                    {intl.formatMessage({
                      id: "target.location",
                      defaultMessage: "Destination Location",
                    })}
                  </div>
                  <Form.Item
                    name="targetHost"
                    label={intl.formatMessage({
                      id: "target.host",
                      defaultMessage: "Destination Host",
                    })}
                    required
                  >
                    <ModalSelect
                      title={intl.formatMessage({
                        id: "vm.migrate.modal.title.change.host",
                        defaultMessage: "Change Host",
                      })}
                      selectType="radio"
                      className={styles["width-180"]}
                    >
                      <List
                        view="select.vm.migration"
                        defaultQuery={defaultQuery}
                      />
                    </ModalSelect>
                  </Form.Item>
                </div>
              </div>
            </div>
          </ZSVForm.Card>
          {_includes(
            [VmInstanceState.Running, VmInstanceState.Paused],
            state,
          ) && (
            <ZSVForm.Card
              title={intl.formatMessage({
                id: "virtualization.vm.change.host.form.advance.config.card.title",
                defaultMessage: "Advanced Settings",
              })}
            >
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
            </ZSVForm.Card>
          )}
        </Form>
      </DialogForm>

      <DialogBase
        title={intl.formatMessage({
          id: "vm.modal.title.cannot.change.host",
          defaultMessage: "Cannot Change Host",
        })}
        visible={notConfigHostVisible}
        setVisible={setNotConfigHostVisible}
        hideCancelButton
      >
        {intl.formatMessage({
          id: "vm.field.change.targetHost.validator.required",
          defaultMessage: "Choose a destination host.",
        })}
      </DialogBase>
    </>
  );

  if (data) {
    const hasLocalStorageVolume = _find(
      allVolumesWithoutMemory,
      (volume) => volume?.primaryStorage?.type === "LocalStorage",
    );
    const { storageMigrateVmInstancedepends } = data as {
      storageMigrateVmInstancedepends: IStorageMigrateVmInstancedepends;
    };
    if (
      rootVolumePsType === "LocalStorage" &&
      _includes([VmInstanceState.Paused, VmInstanceState.Stopped], state) &&
      (storageMigrateVmInstancedepends.hasPeripheralAttached ||
        storageMigrateVmInstancedepends.hasUnavailableUsbDevice ||
        hasAttachedIso)
    ) {
      return LocalStorageOtherStateVmInstanceModal;
    }

    // 优先检查 VF 网卡的工具状态
    if (
      rootVolumePsType === "LocalStorage" &&
      state === VmInstanceState.Running &&
      hasAttachVF &&
      !(vm?.toolsState === GuestToolsState.Installed)
    ) {
      return VmToolsNotRunningModal;
    }

    // 其他本地存储相关的检查
    if (
      rootVolumePsType === "LocalStorage" &&
      state === VmInstanceState.Running &&
      (!allAreLocalStorageVolume ||
        storageMigrateVmInstancedepends.hasPeripheralAttached ||
        storageMigrateVmInstancedepends.hasUnavailableUsbDevice ||
        hasAttachedIso)
    ) {
      return LocalStorageRunningVmInstanceModal;
    }

    if (
      _includes(
        ["NFS", "Ceph", "SharedMountPoint", "SharedBlock", "AliyunNAS"],
        rootVolumePsType,
      ) &&
      state === VmInstanceState.Paused &&
      ((allVolumesWithoutMemory?.length > 1 && hasLocalStorageVolume) ||
        storageMigrateVmInstancedepends.hasPeripheralAttached ||
        storageMigrateVmInstancedepends.hasUnavailableUsbDevice)
    ) {
      return OtherStorageAttachedLocalVolumeStoppedVmInstanceModal;
    }

    // // 优先检查 VF 网卡的工具状态
    if (
      _includes(
        ["NFS", "Ceph", "SharedMountPoint", "SharedBlock", "AliyunNAS"],
        rootVolumePsType,
      ) &&
      state === VmInstanceState.Running &&
      hasAttachVF &&
      vm?.toolsState !== GuestToolsState.Installed
    ) {
      return VmToolsNotRunningModal;
    }

    // 其他存储相关的检查
    if (
      _includes(
        ["NFS", "Ceph", "SharedMountPoint", "SharedBlock", "AliyunNAS"],
        rootVolumePsType,
      ) &&
      state === VmInstanceState.Running &&
      ((allVolumesWithoutMemory?.length > 1 && hasLocalStorageVolume) ||
        storageMigrateVmInstancedepends.hasPeripheralAttached ||
        storageMigrateVmInstancedepends.hasUnavailableUsbDevice)
    ) {
      return OtherStorageAttachedLocalVolumeRunningVmInstanceModal;
    }

    if (
      _includes(
        ["NFS", "Ceph", "SharedMountPoint", "SharedBlock", "AliyunNAS"],
        rootVolumePsType,
      ) &&
      _includes([VmInstanceState.Paused, VmInstanceState.Running], state) &&
      storageMigrateVmInstancedepends.isAttachedScsiLunDevice &&
      _includes(["Windows", "WindowsVirtio"], platform)
    ) {
      return OtherStorageAttachedLunVmInstanceModal;
    }

    if (state === VmInstanceState.Running && !preConfirmed) {
      return ConfirmIdleWarningModal;
    }

    return MigrateList; //冷/热存储迁移
  }
  return <div />;
};

export default Migrate;
