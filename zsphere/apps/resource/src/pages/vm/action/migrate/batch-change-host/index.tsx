import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { getStorageMigrateVmInstancesDepends } from "@zstack/virtualization-resource/src/gql/instance.gql";
import { DialogBase, DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  GuestToolsState,
  VmInstanceState,
  HostStatus,
} from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { useUnmount } from "ahooks";
import _ from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import Batch from "./batch";

const queryLocalStorageGlobalConfig = gql`
  query globalConfig {
    globalConfig(
      category: "localStoragePrimaryStorage"
      name: "liveMigrationWithStorage.allow"
    ) {
      name
      category
      value
      uuid
    }
  }
`;

const STYLE_DIV_RIGHT = { textAlign: "right" } as const;

const stateJudgeLogic = (selectedList: IVM[]) => {
  const vmStateList = _.uniq(selectedList.map((t) => t.state)) ?? [];
  // 其他逻辑判断...
  return vmStateList.length === 1;
};

/**
 * 批量迁移校验
 * @param vm 当前虚拟机实例
 * @param data 批量迁移依赖数据
 * @param globalConfigData 全局配置数据
 * @returns boolean 是否可以进行迁移
 *
 * 迁移规则：
 * 1. 本地存储(LocalStorage)的特殊处理：
 *    - 已停止状态：主机必须是连接状态
 *    - 运行/暂停/故障状态：需要全局配置允许在线迁移
 *    额外限制：
 *    - 暂停/停止状态：不支持多云盘、外设、USB设备、ISO
 *    - 运行状态：所有卷必须是本地存储，不支持外设、USB设备、ISO、VF网卡
 *
 * 2. 其他共享存储类型(NFS/Ceph/Addon等)：
 *    - 支持在运行/暂停/故障状态时迁移
 *    额外限制：
 *    - 暂停/运行状态：不支持本地存储数据盘、外设、USB设备
 *    - 运行状态：额外不支持VF网卡
 *    - Windows平台：不支持SCSI设备
 */
const migrateJudge = (vm: IVM, data: any, globalConfigData: any): boolean => {
  // 基础检查
  const vmDependency = data?.batchStorageMigrateVmInstancedepends?.find(
    (t: any) => t.uuid === vm.uuid,
  );
  if (!vmDependency) {
    return false;
  }

  // 解构必要数据
  const globalLiveMigrate: boolean =
    globalConfigData?.globalConfig?.value === "true";
  const {
    state,
    platform,
    allVolumes = [],
    vmCdRoms = [],
    vmNics = [],
    host,
    primaryStorage,
    toolsState,
  } = vm;
  const {
    hasUnavailableUsbDevice,
    hasPeripheralAttached,
    isAttachedScsiLunDevice,
  } = vmDependency;

  // 基础状态检查
  const migrateableStates: string[] = ["Running", "Paused", "Crashed"];
  const rootVolumePsType: string = primaryStorage?.type ?? "";

  // 通用检查项
  const hasAttachedIso = vmCdRoms?.some((it) => it.isoUuid);
  const hasAttachedVF = vmNics?.some((it) => it.type === "VF");
  const allVolumesWithoutMemory = allVolumes?.filter(
    (it) => it.type !== "Memory",
  );
  const hasLocalStorageVolume = allVolumesWithoutMemory?.some(
    (volume) => volume?.primaryStorage?.type === "LocalStorage",
  );
  const allAreLocalStorageVolume = allVolumesWithoutMemory?.every(
    (volume) => volume?.primaryStorage?.type === "LocalStorage",
  );

  // 存储类型迁移规则
  const migrationRules = new Map([
    [
      "LocalStorage",
      () => {
        const baseCondition =
          (state === VmInstanceState.Stopped &&
            host?.status === HostStatus.Connected) ||
          (_.includes(migrateableStates, state) && globalLiveMigrate);

        if (!baseCondition) {
          return false;
        }

        // VF网卡工具状态检查 - LocalStorage
        if (
          state === VmInstanceState.Running &&
          hasAttachedVF &&
          toolsState !== GuestToolsState.Installed
        ) {
          return false;
        }

        if (
          [VmInstanceState.Paused, VmInstanceState.Stopped].includes(
            state as VmInstanceState,
          )
        ) {
          return !(
            hasPeripheralAttached ||
            hasUnavailableUsbDevice ||
            hasAttachedIso
          );
        }

        if (state === VmInstanceState.Running) {
          return (
            allAreLocalStorageVolume &&
            !hasPeripheralAttached &&
            !hasUnavailableUsbDevice &&
            !hasAttachedIso
          );
        }

        return true;
      },
    ],
    [
      "SharedStorage",
      () => {
        if (!_.includes(migrateableStates, state)) {
          return false;
        }

        // VF网卡工具状态检查 - SharedStorage
        if (
          state === VmInstanceState.Running &&
          hasAttachedVF &&
          toolsState !== GuestToolsState.Installed
        ) {
          return false;
        }

        const isWindowsWithScsi =
          _.includes(["Windows", "WindowsVirtio"], platform) &&
          isAttachedScsiLunDevice;

        if (
          [VmInstanceState.Paused, VmInstanceState.Running].includes(
            state as VmInstanceState,
          )
        ) {
          const baseCondition = !(
            (allVolumesWithoutMemory?.length > 1 && hasLocalStorageVolume) ||
            hasPeripheralAttached ||
            hasUnavailableUsbDevice ||
            isWindowsWithScsi
          );

          return state === VmInstanceState.Running
            ? baseCondition && !hasAttachedVF
            : baseCondition;
        }

        return true;
      },
    ],
  ]);

  // 判断存储类型并执行对应规则
  const isSharedStorage = _.includes(
    ["NFS", "Ceph", "SharedMountPoint", "SharedBlock", "AliyunNAS", "Addon"],
    rootVolumePsType,
  );
  const ruleKey = isSharedStorage ? "SharedStorage" : rootVolumePsType;
  const rule = migrationRules.get(ruleKey);

  return rule ? rule() : false;
};

const BatchChangeHost: React.FC<IActionWrapperProps<IVM>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  source,
  setSelectedList,
}) => {
  const intl = useIntl();

  const [batchVisible, setBatchVisible] = useState(false);

  //可以迁移的列表
  const [notMigrateableList, setNotMigrateableList] = useState<any[]>([]);
  const [migrateableVisible, setMigrateableVisible] = useState(false);

  const [batchSelectedList, setBatchSelectedList] = useState([]);

  //执行检测部分,此处逻辑需要重构：输入vmUUids，返回vmUUids和对应的结果

  useUnmount(() => {
    setMigrateableVisible(false);
    setNotMigrateableList([]);
    setVisible(false);
    setBatchVisible(false);
    setSelectedList?.([]);
    setBatchSelectedList?.([]);
  });

  const [getDepends, { data }] = useLazyQuery(
    getStorageMigrateVmInstancesDepends,
  );
  const [getGlobalConfig, { data: globalConfigData }] = useLazyQuery(
    queryLocalStorageGlobalConfig,
  );

  //状态检测逻辑
  const stateJudge = useMemo(
    () => stateJudgeLogic(selectedList),
    [selectedList],
  );

  //这里应该等状态检测后在进行
  useEffect(() => {
    if (visible && selectedList.length !== 0) {
      getDepends({ variables: { uuids: selectedList.map((t) => t.uuid) } });
      getGlobalConfig({});
    }
  }, [visible, selectedList]);

  //确认弹框内容
  const modalConfirmContent = useMemo(() => {
    let content = intl.formatMessage({
      id: "instance.modal.migrate.host.action.judge.content",
      defaultMessage: "All selected virtual machines are unable to execute host operation changes.",
    });

    //状态检测通过
    if (!stateJudge) {
      content = intl.formatMessage({
        id: "instance.modal.migrate.host.state.judge.content",
        defaultMessage: "All virtual machines to be batch-migrated must be in the same power state.",
      });
    }

    return content;
  }, [stateJudge, intl]);

  const canMigrateList = useMemo(() => {
    if (!data?.batchStorageMigrateVmInstancedepends || !globalConfigData) {
      return [];
    }
    //能迁移的list
    return selectedList.filter((t) => migrateJudge(t, data, globalConfigData));
  }, [data, globalConfigData, selectedList]);

  useEffect(() => {
    if (
      visible &&
      data?.batchStorageMigrateVmInstancedepends?.length !== 0 &&
      stateJudge
    ) {
      const cannotMigrateList = selectedList
        .concat(canMigrateList)
        .filter(
          (v) => !selectedList.includes(v) || !canMigrateList.includes(v),
        );

      setNotMigrateableList(cannotMigrateList);
      setBatchSelectedList(canMigrateList as any);
      if (cannotMigrateList.length !== 0) {
        setMigrateableVisible(true);
      } else if (canMigrateList.length !== 0) {
        setBatchVisible(true);
      }
    }
  }, [
    stateJudge,
    selectedList,
    visible,
    canMigrateList,
    data?.batchStorageMigrateVmInstancedepends,
  ]);

  if (data && visible) {
    if (!stateJudge || notMigrateableList.length === selectedList?.length) {
      return (
        <DialogBase
          title={intl.formatMessage({
            id: "vm.modal.title.cannot.change.host",
            defaultMessage: "Cannot Change Host",
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
            id: "vm.migrate.modal.title.cannot.change.host",
            defaultMessage: "Cannot Change Host",
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
            if (batchSelectedList.length !== 0) {
              setBatchVisible(true);
            } else {
              setVisible(false);
            }
          }}
        />
      );
    }

    if (batchSelectedList.length !== 0 && canMigrateList.length !== 0) {
      return (
        <Batch
          source={source}
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
};

export default BatchChangeHost;
