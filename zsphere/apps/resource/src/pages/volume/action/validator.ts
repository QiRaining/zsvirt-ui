import { gql } from "@apollo/client";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import {
  Op,
  VolumeStatus,
  VmInstanceState,
  VolumeType,
  VolumeState,
  Identity,
  VolumeBackupTaskType,
  CdpTaskStatus,
  State,
} from "@zstack/zsphere-types";
import type {
  Volume as IVolume,
  VmInstance as IVM,
  PrimaryStorage as IPrimaryStorage,
  VolumeBandwidth as IVolumeBandwidth,
  BareMetal2Instance as IBareMetal2Instance,
} from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";

const { apolloClient } = window.g_main;

const vmNotInCdpTask = (vm: IVM) =>
  vm?.state !== VmInstanceState?.VolumeRecovering;

// 没有选中
export const verifyNotSelect = (selectedList: IVolume[]): boolean => {
  return selectedList?.length <= 0;
};

// 多选
export const verifyMultiSelect = (selectedList: IVolume[]): boolean => {
  return selectedList?.length > 0;
};

// 单选
export const verifySingleSelect = (selectedList: IVolume[]): boolean => {
  return selectedList?.length === 1;
};

export const verifyCreate = (selectedList: IVolume[], source?: IVM) => {
  return vmNotInCdpTask(source!);
};

// 启用云盘
export const verifyEnableVolume = (current: IVolume): boolean => {
  return (
    current.state === VolumeState.Disabled && current.type !== VolumeType.Root
  );
};

// 解绑标签
export const verifyDetachTag = (current: IVolume): boolean => {
  return !!current?.tag && current?.tag?.length > 0;
};

// 停用云盘
export const verifyDisableVolume = (current: IVolume): boolean => {
  return (
    current.state === VolumeState.Enabled && current.type !== VolumeType.Root
  );
};

// 云盘加载云主机
// export const verifyVolumeAttachPre = (selectedList: IVolume[]): boolean => {
//   return _.every(selectedList, volume => verifyAttachVmInstance(volume))
//   // return selectedList.every((ele: IVolume) => {
//   //   return ele.vmInstance?.length === 0 || ele.isShareable
//   // })
// }

// 云盘加载云主机
export const verifyAttachVmInstance = (current: IVolume): boolean => {
  return (
    current?.type !== VolumeType.Root &&
    (current?.isShareable || !current?.vmInstanceUuid) &&
    current?.state === VolumeState.Enabled &&
    _.includes(
      [VolumeStatus.Ready, VolumeStatus.NotInstantiated],
      current?.status,
    )
  );
};

// 云主机详情配置信息页云盘加载云主机
export const verifyVolumeAttachVm = (selectedList: IVolume[], source: any) => {
  const { attachedShareableVolumeUuidList = [], allVolumes = [] } = source;
  return (
    _.includes(["Running", "Stopped"], source.state) &&
    allVolumes.length + attachedShareableVolumeUuidList.length <= 24 &&
    vmNotInCdpTask(source)
  );
};

// cdp恢复中禁止操作
export const verifyActionWithCdpRecover = (current: IVolume): boolean => {
  const { vmInstance = [] } = current;
  if (vmInstance?.length > 0) {
    return !vmInstance.some((it) =>
      [VmInstanceState.VolumeRecovering, VmInstanceState.NoState].includes(
        it?.state as VmInstanceState,
      ),
    );
  }
  return true;
};

// 云盘卸载云主机
export const verifyDetachVmInstance = async (current: IVolume) => {
  const { vmInstance = [], isHaveMemorySnapshot } = current;

  return (vmInstance?.length > 0 && !isHaveMemorySnapshot) as boolean;
};

// 云主机卸载云盘
export const verifyVmDetachDataVolume = async (
  current: IVolume,
  source: any,
) => {
  const { isHaveMemorySnapshot } = current;
  if (source && source.type === "baremetal2") {
    return current.type !== VolumeType.Root && !!source.clusterUuid;
  }

  return (current.type !== VolumeType.Root &&
    vmNotInCdpTask(source) &&
    !isHaveMemorySnapshot) as boolean;
};

// 云盘迁移
export const verifyVolumeMigrate = (current: IVolume): boolean => {
  return (
    !_.includes(
      [VolumeStatus.NotInstantiated, VolumeStatus.Deleted],
      current.status,
    ) && current.type !== VolumeType.Root
  );
};

// 云盘存储迁移
export const verifyStorageMigrate = (current: IVolume): boolean => {
  const primaryStorage: IPrimaryStorage =
    current.primaryStorage as IPrimaryStorage;
  const vmInstanceUuid: string = current.vmInstanceUuid || "";
  const vmInstance: IVM = _.find(
    current.vmInstance || [],
    (it) => it.uuid === vmInstanceUuid,
  ) as IVM;
  if (_.includes(["Ceph", "NFS"], primaryStorage.type)) {
    return (
      current.type === "Data" ||
      (current.type === VolumeType.Root && vmInstance?.state === "Stopped")
    );
  }
  if (_.includes(["SharedBlock"], primaryStorage.type)) {
    return vmInstance?.state === "Stopped" || !vmInstance;
  }
  return false;
};

// 删除硬盘
export const verifyMoveToRecycleBin = async (current: IVolume) => {
  const {
    isHaveMemorySnapshot,
    isHaveSnapshot,
    vmInstanceUuid,
    lastVmOrTemplate,
    type,
    status,
  } = current;
  //zsv 存在快照的
  if (!vmInstanceUuid && isHaveSnapshot) {
    return !lastVmOrTemplate;
  }

  return (
    status !== VolumeStatus.Deleted &&
    type !== VolumeType.Root &&
    !vmInstanceUuid &&
    !isHaveMemorySnapshot
  );
};

// 删除云盘
export const verifyDelete = async (current: IVolume) => {
  const { isHaveMemorySnapshot } = current;

  return (current.status !== VolumeStatus.Deleted &&
    current.type !== VolumeType.Root &&
    !(
      current.vmInstanceUuid &&
      [VmInstanceState.Paused, VmInstanceState.VolumeRecovering].indexOf(
        current.vmInstance?.[0]?.state as VmInstanceState,
      ) > -1
    ) &&
    !isHaveMemorySnapshot) as boolean;
};

// 云盘创建备份
export const verifyBackup = async (_current: any, source: any) => {
  /**
   * 注意：有灾备的license或者是试用版的license
   * 1, 云盘status 要为 'Ready'
   * 2, 普通云盘，非共享云盘
   * 3, 要挂载云主机，并且云主机的状态为：['Running', 'Paused', 'Stopped']
   * 4, 普通云盘只能挂载到一个云主机上
   */

  const current = (source?.current || _current) as IVolume;
  const validVmStates = ["Running", "Paused", "Stopped"];
  const attachedVmState = current?.vmInstance?.[0]?.state;

  return (
    _.includes(["Ready"], current.status) &&
    !current.isShareable &&
    !!current.vmInstanceUuid &&
    _.includes(validVmStates, attachedVmState)
  );
};

// 云盘挂载灾备任务
export const verifyAttachBackupJob = async (_current: IVolume) => {
  // 没有备份任务
  // 有云主机备份任务，但是没有CDP任务
  return (
    !_current?.backupTaskType ||
    (!_current?.cdpTaskStatus &&
      _current?.backupTaskType === VolumeBackupTaskType.OtherTasks)
  );
};

// 多选,并且是相同的owner
export const verifyMultiSelectAndSameOwner = (
  selectedList: IVolume[],
): boolean => {
  if (selectedList.length < 1 || !selectedList) {
    return false;
  }

  return _.every(
    selectedList,
    (item) => item?.owner?.uuid === selectedList?.[0]?.owner?.uuid,
  );
};

// 云盘创建镜像
export const verifyVolumeCreateImage = async (
  current: IVolume,
  source: any,
) => {
  /**
   * 1, Root类型云盘创建镜像不能是共享云盘，镜像服务器类型是Root的话参考云主机创建镜像
   * 2, 以下几种状态不准创建镜像，status为: ['Deleted', 'NotInstantiated']，state为: 'Disabled'
   * 3, 主存储为SharedBlock的共享云盘要求挂载的云主机状态不能为: 'Running'
   */
  if (source && source.type === "baremetal2" && !source.clusterUuid) {
    // 弹性裸金属实例如果没有clusterUuid则直接置灰
    return false;
  }

  if (!vmNotInCdpTask(source)) {
    return false;
  }
  const vmInstance: IVM[] = current.vmInstance as IVM[];
  const primaryStorage: IPrimaryStorage =
    current.primaryStorage as IPrimaryStorage;
  if (current.type === VolumeType.Root && !!current.vmInstanceUuid) {
    const vm = vmInstance?.[0];
    const { data } = await apolloClient.query({
      query: gql`
        query backupStorageList($conditions: [Condition!]) {
          backupStorageList(conditions: $conditions) {
            list {
              uuid
              type
            }
          }
        }
      `,
      variables: {
        conditions: [
          {
            key: "status",
            op: Op.eq,
            value: "Connected",
          },
          {
            key: "state",
            op: Op.eq,
            value: "Enabled",
          },
          {
            key: "zone.uuid",
            op: Op.eq,
            value: vm?.zoneUuid,
          },
        ],
      },
    });
    const { list: bsListInCurrentZone = [] } = data?.backupStorageList ?? {};
    if (vm.state === "Stopped" && bsListInCurrentZone?.length > 0) {
      return true;
    }
    if (vm.state === "Running") {
      return _.some(bsListInCurrentZone, (bs) =>
        _.includes(["ImageStoreBackupStorage", "AliyunEBS", "Ceph"], bs.type),
      );
    }
  }

  if (
    primaryStorage?.type === "SharedBlock" &&
    current.isShareable &&
    vmInstance?.length > 0
  ) {
    return vmInstance.every((vm) => vm.state !== "Running");
  }
  return (
    !_.includes(["Deleted", "NotInstantiated"], current.status) &&
    !_.includes(["Disabled"], current.state)
  );
};

export const verifyBaremetal2InstanceAttachVolume = (
  selectedList: IVolume[],
  source: IBareMetal2Instance,
) => {
  return (!selectedList || selectedList?.length <= 0) && !!source.clusterUuid;
};

export const verifyBaremetal2InstanceCreateVolume = (
  selectedList: IVolume[],
  source: IBareMetal2Instance,
) => {
  return (!selectedList || selectedList?.length <= 0) && !!source.clusterUuid;
};

// 创建快照
export const verifyCreateSnapshot = (current: IVolume) => {
  /**
   * 1, 云盘状态不能为：['Deleted', 'NotInstantiated']
   * 2, 不能是共享云盘
   */
  return (
    !_.includes(["Deleted", "NotInstantiated"], current.status) &&
    !current.isShareable
  );
};

// 设置云盘Qos
export const verifySetVolumeQoS = (current: IVolume, source?: any): boolean => {
  /**
   * 1, 主存储为AliyunEBS的云盘不支持设置云盘Qos
   * 2, 共享云盘不支持设置云盘Qos
   * 3, 弹性裸金属root volume 不支持设置云盘Qos
   */
  if (
    current?.type === VolumeType.Root &&
    current?.vmInstance?.[0]?.type === "baremetal2"
  ) {
    return false;
  }
  return (
    !current.isShareable &&
    current?.primaryStorage?.type !== "AliyunEBS" &&
    vmNotInCdpTask(source)
  );
};

// 设置云盘Qos |  取消云盘Qos
// export const verifySetVolumeQoS = (current: IVolume): boolean => {
//   return _verifySetVolumeQoS(current) || _verifyDeleteVolumeQos(current)
// }

// 取消云盘Qos
export const _verifyDeleteVolumeQos = (current: IVolume): boolean => {
  /**
   * 1, 如果云盘(普通云盘)挂载了云主机，云主机状态为Paused时不支持取消Qos。——只能挂载到一个云主机上
   * 2, 云盘设置过Qos
   * 3, 非admin环境, Threshold没有设置过。
   */
  const { currentUser } = usePlatformStore();
  const currentIdentity = currentUser?.currentIdentity;
  const adminIdentity = _.includes(
    [Identity.PlatformAdmin, Identity.Admin],
    currentIdentity,
  );

  const bandwidth: IVolumeBandwidth = current?.bandwidth || {
    volumeBandwidth: -1,
    volumeBandwidthRead: -1,
    volumeBandwidthWrite: -1,
    iopsTotal: -1,
    iopsRead: -1,
    iopsWrite: -1,
    volumeBandwidthUpthreshold: -1,
    volumeBandwidthReadUpthreshold: -1,
    volumeBandwidthWriteUpthreshold: -1,
  };

  const volumeBandwidth = bandwidth?.volumeBandwidth || -1;
  const volumeBandwidthRead = bandwidth?.volumeBandwidthRead || -1;
  const volumeBandwidthWrite = bandwidth?.volumeBandwidthWrite || -1;
  const iopsTotal = bandwidth?.iopsTotal || -1;
  const iopsRead = bandwidth?.iopsRead || -1;
  const iopsWrite = bandwidth?.iopsWrite || -1;
  const volumeBandwidthUpthreshold =
    bandwidth?.volumeBandwidthUpthreshold || -1;
  const volumeBandwidthReadUpthreshold =
    bandwidth?.volumeBandwidthReadUpthreshold || -1;
  const volumeBandwidthWriteUpthreshold =
    bandwidth?.volumeBandwidthWriteUpthreshold || -1;

  return (
    [
      volumeBandwidth,
      volumeBandwidthRead,
      volumeBandwidthWrite,
      iopsTotal,
      iopsRead,
      iopsWrite,
    ].some((it) => it > 0) &&
    !(
      !adminIdentity &&
      [
        volumeBandwidthUpthreshold,
        volumeBandwidthReadUpthreshold,
        volumeBandwidthWriteUpthreshold,
      ].some((it) => it > 0)
    ) &&
    !(
      !!current.vmInstanceUuid &&
      _.includes(["Paused"], current?.vmInstance?.[0]?.state)
    )
  );
};

// 云盘扩容
export const verifyResizeDataVolume = (
  current: IVolume,
  source?: any,
): boolean => {
  /**
   * 1, 状态为['Deleted', 'NotInstantiated']的云盘不支持扩容。
   * 2, 主存储为SharedBlock的共享云盘不支持扩容。
   * 3, 主存储不是SharedBlock的共享云盘，如果挂载了运行中的云盘，则不支持扩容。
   * 4, 云盘如果挂在了弹性裸金属实例，如果实例不是停止状态，则不支持扩容
   */

  const result =
    !_.includes(["Deleted", "NotInstantiated"], current.status) &&
    !(
      current.isShareable &&
      (current.primaryStorage?.type === "SharedBlock" ||
        (current?.vmInstance &&
          current?.vmInstance?.length > 0 &&
          current?.vmInstance?.some((vm) => vm.state === "Running")))
    );
  if (current?.vmInstance?.[0]?.hypervisorType === "baremetal2") {
    return (
      result &&
      current?.vmInstance?.[0]?.state === VmInstanceState.Stopped &&
      !!current?.vmInstance?.[0]?.clusterUuid
    );
  }
  return result && vmNotInCdpTask(source);
};

// 云盘恢复
export const verifyRecoverDataVolume = (current: IVolume): boolean => {
  return current.status === VolumeStatus.Deleted;
};

// 云盘彻底删除
export const verifyExpungeDataVolume = (current: IVolume): boolean => {
  return current.status === VolumeStatus.Deleted;
};

// 更改所有者
export const verifyChangeResourceOwner = (current: IVolume): boolean => {
  return (
    !_.includes(
      [VolumeStatus.NotInstantiated, VolumeStatus.Deleted],
      current.status,
    ) && current.type !== VolumeType.Root
  );
};

// 设置为根盘
export const verifySetVmRootVolume = (current: IVolume, vm: IVM): boolean => {
  return (
    vm?.state === VmInstanceState.Stopped && current.type !== VolumeType.Root
  );
};

//验证灾备服务license配额是否足够
export const verifyDisasterRecoveryLicense = async (
  _current: IVolume,
  _source: any,
) => {
  return true;
};

//云盘创建备份
export const verifyVolumeCreateBackup = (current: IVolume) => {
  const { isShareable, vmInstanceUuid, vmInstance, cdpTaskStatus } = current;
  //非共享云盘，绑定云主机，云主机不是关机状态，没有开启cdp服务
  return (
    !isShareable &&
    !!vmInstanceUuid &&
    !cdpTaskStatus &&
    (vmInstance?.[0]?.state === VmInstanceState.Running ||
      vmInstance?.[0]?.state === VmInstanceState.Paused ||
      vmInstance?.[0]?.state === VmInstanceState.Pausing)
  );
};

// 扁平合并，不支持共享云盘类型
export const verifyVolumeFlatten = (current: IVolume) => {
  if (
    current?.cdpTaskStatus === CdpTaskStatus.Running &&
    current?.primaryStorage?.type !== "Ceph"
  ) {
    return false;
  }
  return VolumeState.Enabled === current?.state && !current?.isShareable;
};

export const verifybackupTaskEnable = (_current: IVM) => {
  return _current?.backupTaskStatus === State.Disabled;
};

export const verifybackupTaskDisable = (_current: IVM) => {
  return _current?.backupTaskStatus === State.Enabled;
};
