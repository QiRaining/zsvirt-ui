import { useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { getStorageMigrateVmInstancesDepends } from "@zstack/virtualization-resource/src/gql/instance.gql";
import { verifyStorageMigrate } from "@zstack/virtualization-resource/src/pages/vm/action/validators";
import { DialogBase, DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { GuestToolsState, VmInstanceState } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { useUnmount } from "ahooks";
import _ from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import Batch from "./batch";

const STYLE_DIV_RIGHT = { textAlign: "right" } as const;

/**
 * 判断虚拟机是否可以进行存储迁移
 * @param vm 虚拟机实例
 * @returns boolean 是否可以进行存储迁移
 *
 * 存储迁移限制：
 * 1. 运行状态限制：
 *    - 不支持挂载ISO
 *    - 不支持共享卷
 *    - 不支持SCSI设备
 *    - 不支持VF网卡
 *
 * 2. 停止状态限制：
 *    - 不支持挂载ISO
 *    - 不支持共享卷
 *    - 不支持SCSI设备
 *    - 不支持外设
 */
const migrateJudge = (vm: IVM, data: any): boolean => {
  // 基础检查：确保有迁移依赖数据
  const vmStorageMigDepends = data?.batchStorageMigrateVmInstancedepends?.find(
    (t: any) => t.uuid === vm.uuid,
  );
  if (!vmStorageMigDepends) {
    return false;
  }

  // 解构虚拟机状态相关数据
  const {
    state,
    vmCdRoms,
    attachedShareableVolumeUuidList,
    vmNics,
    toolsState,
  } = vm || {};

  // 通用限制检查
  const restrictions: { [key: string]: boolean } = {
    hasAttachedIso: vmCdRoms?.some((it) => it.isoUuid) ?? false,
    hasShareableVolume: !!attachedShareableVolumeUuidList?.length,
    hasScsiDevice: vmStorageMigDepends.isAttachedScsiLunDevice,
    hasPeripheralAttached: vmStorageMigDepends.hasPeripheralAttached,
    hasUnavailableUsbDevice: vmStorageMigDepends.hasUnavailableUsbDevice,
    hasVFNic:
      (state === VmInstanceState.Running &&
        vmNics?.some((item) => item.type === "VF")) ??
      false,
    hasToolsState: toolsState === GuestToolsState.Installed,
  };

  // 根据虚拟机状态判断
  switch (state) {
    case VmInstanceState.Running:
      return !(
        restrictions.hasAttachedIso ||
        restrictions.hasShareableVolume ||
        restrictions.hasScsiDevice ||
        restrictions.hasUnavailableUsbDevice ||
        (restrictions.hasVFNic && !restrictions.hasToolsState)
      );

    case VmInstanceState.Stopped:
      return !(
        restrictions.hasAttachedIso ||
        restrictions.hasShareableVolume ||
        restrictions.hasScsiDevice ||
        restrictions.hasPeripheralAttached ||
        restrictions.hasUnavailableUsbDevice
      );

    default:
      return true;
  }
};

const BatchChangeHostStorage: React.FC<IActionWrapperProps<IVM>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();

  const [batchVisible, setBatchVisible] = useState(false);

  //可以迁移的列表
  const [notMigrateableList, setNotMigrateableList] = useState<any[]>([]);

  const [migrateableVisible, setMigrateableVisible] = useState(false);

  const [batchSelectedList, setBatchSelectedList] = useState([]);

  /**
   * 点击操作按钮时，需要依次进行检测：
    状态检测：
    批量迁移的虚拟机需要为相同状态。选中主机有两个或以上状态时，不支持批量操作
    仅运行中、停止、暂停 状态的虚拟机支持批量迁移，故障、未知、各个中间状态均不支持迁移
   * */

  //执行检测部分,此处逻辑需要重构：输入vmUUids，返回vmUUids和对应的结果
  const [getDepends, { data }] = useLazyQuery(
    getStorageMigrateVmInstancesDepends,
  );

  useUnmount(() => {
    setMigrateableVisible(false);
    setNotMigrateableList([]);
    setVisible(false);
    setBatchVisible(false);
    setSelectedList?.([]);
    setBatchSelectedList?.([]);
  });

  useEffect(() => {
    if (visible) {
      getDepends({ variables: { uuids: selectedList.map((t) => t.uuid) } });
    }
  }, [visible, selectedList]);

  //状态检测逻辑
  const stateJudge = useMemo(() => {
    const vmStateList = _.uniq(selectedList.map((t) => t.state)) ?? [];
    //其他逻辑，详见：/zstack-ui/apps/resource-center/resource-pool/src/pages/vm/action/validator.ts
    // verifyMigrate方法
    return vmStateList.length === 1;
  }, [selectedList]);

  //确认弹框内容
  const modalConfirmContent = useMemo(() => {
    let content = intl.formatMessage({
      id: "instance.modal.migrate.storage.and.host.action.judge.content",
      defaultMessage: "The selected virtual machines cannot perform the operation of changing host and data storage.",
    });

    if (!stateJudge) {
      content = intl.formatMessage({
        id: "instance.modal.migrate.storage.state.judge.content",
        defaultMessage: "All virtual machines that need to be batch-migrated must be in the same power state.",
      });
    }

    return content;
  }, [stateJudge, intl]);

  useEffect(() => {
    setBatchSelectedList(selectedList as any);
  }, [selectedList]);

  const canMigrateList = useMemo(() => {
    if (!data?.batchStorageMigrateVmInstancedepends) {
      return [];
    }

    return selectedList.filter(
      (t) => migrateJudge(t, data) && verifyStorageMigrate(t),
    );
  }, [data, selectedList]);

  /**
   * 处理批量存储迁移的可迁移性检查
   * 根据检查结果显示不同的对话框：
   * 1. 如果有不可迁移的虚拟机，显示提示对话框
   * 2. 如果全部可迁移，显示迁移配置对话框
   */
  useEffect(() => {
    // 基础条件检查
    const hasDependencies =
      data?.batchStorageMigrateVmInstancedepends?.length > 0;
    if (!visible || !data || !hasDependencies) {
      return;
    }

    // 计算可迁移和不可迁移列表
    const allVMs = new Set([...selectedList, ...canMigrateList]);
    const cannotMigrateList = Array.from(allVMs).filter(
      (vm) => !selectedList.includes(vm) || !canMigrateList.includes(vm),
    );

    // 更新状态
    setNotMigrateableList(cannotMigrateList);
    setBatchSelectedList(canMigrateList as any);

    // 显示对应的对话框
    if (cannotMigrateList.length > 0) {
      setMigrateableVisible(true);
    } else if (canMigrateList.length > 0) {
      setBatchVisible(true);
    }
  }, [visible, data, selectedList, canMigrateList]);

  const renderBatchChangeHostStorageEle = useMemo(() => {
    if (data && visible) {
      if (!stateJudge || notMigrateableList.length === selectedList?.length) {
        return (
          <DialogBase
            title={intl.formatMessage({
              id: "vm.migrate.modal.title.cannot.change.host.and.storage",
              defaultMessage: "Cannot Change Host and Data Storage",
            })}
            visible={visible}
            setVisible={setVisible}
            footer={
              <div style={STYLE_DIV_RIGHT}>
                <Button
                  onClick={() => {
                    setVisible(false);
                    setSelectedList?.([]);
                  }}
                  variant="primary"
                >
                  {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
                </Button>
              </div>
            }
          >
            {modalConfirmContent}
          </DialogBase>
        );
      }
      if (
        migrateableVisible &&
        notMigrateableList.length !== 0 &&
        notMigrateableList.length < selectedList?.length
      ) {
        return (
          <DialogP3
            title={intl.formatMessage({
              id: "vm.migrate.modal.title.cannot.change.host.and.storage",
              defaultMessage: "Cannot Change Host and Data Storage",
            })}
            confirmText={intl.formatMessage({
              id: "skipAndContinue",
              defaultMessage: "Skip and Continue",
            })}
            resourceDescription={intl.formatMessage(
              {
                id: "notSupportedCount.X",
                defaultMessage: "You could not perform this operation on these {total} items:",
              },
              { total: notMigrateableList.length },
            )}
            visible={migrateableVisible}
            setVisible={setMigrateableVisible}
            resourceNames={notMigrateableList.map(
              (item) => item.name ?? item.uuid,
            )}
            onConfirm={() => {
              setBatchVisible(true);
            }}
          />
        );
      }
      if (batchSelectedList.length !== 0 && canMigrateList.length !== 0) {
        return (
          <Batch
            view="main"
            position="toolbar"
            refetch={refetch}
            visible={batchVisible}
            setVisible={setBatchVisible}
            setOriginVisible={setVisible}
            selectedList={batchSelectedList}
            setSelectedList={setBatchSelectedList as any}
            setOriginSelectedList={setSelectedList}
          />
        );
      }
    }
    return <div />;
  }, [
    batchSelectedList,
    batchVisible,
    canMigrateList,
    data,
    intl,
    migrateableVisible,
    modalConfirmContent,
    notMigrateableList,
    selectedList,
    stateJudge,
    visible,
  ]);

  return renderBatchChangeHostStorageEle;
};

export default BatchChangeHostStorage;
