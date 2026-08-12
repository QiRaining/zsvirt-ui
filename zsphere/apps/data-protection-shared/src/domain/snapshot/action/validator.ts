import { VmInstanceState } from "@zstack/zsphere-types";
import type {
  VolumeSnapshot as IVolumeSnapshot,
  VolumeSnapshotGroup as IVolumeSnapshotGroup,
} from "@zstack/zsphere-types/graphql";

export const verifyIsShareable = (_: any, source?: any) => {
  //列表row、快照树dir、详情
  const {
    attachedShareableVolumeUuidList = [],
    state = "",
    haveScsiLun = false,
  } = _?.[0]?.vmInstance || source || source?.vmInstance || {};

  /**
   * 1.存在共享盘
   * 2.虚拟机状态为Destroyed
   * 3.存在RDM(ScsiLun)盘
   */

  if (
    attachedShareableVolumeUuidList.length > 0 ||
    state === VmInstanceState.Destroyed ||
    haveScsiLun
  ) {
    return false;
  }
  return true;
};

// 启动
export const verifyStart = (_: any, source: any) => {
  const { state } =
    _?.volume?.vmInstance?.[0] || source?.attr || _?.vmInstance || {};
  return ["stopped", "Stopped"].indexOf(state || "") >= 0;
};

// 停止
export const verifyStop = (_: any, source: any) => {
  const { state } =
    _?.volume?.vmInstance?.[0] || source?.attr || _?.vmInstance || {};
  return (
    ["Running", "running", "paused", "Paused", "Crashed"].indexOf(
      state || "",
    ) >= 0
  );
};

export const verifyDelete = async (
  selectedList: (IVolumeSnapshot | IVolumeSnapshotGroup)[],
  _source: any,
  _intl?: any,
) => {
  if (!selectedList?.length) {
    return { deleteAble: false };
  }

  return {
    deleteAble: true,
  };
};
//存在内存快照 （ 创建云主机）
export const verifyMemorySnapshot = (current: any) => {
  const { volumeSnapshotRefs } = current?.group ?? current ?? {};

  const haveMemorySnapshot: boolean = volumeSnapshotRefs?.some(
    (it: { volumeType: string }) => it.volumeType === "Memory",
  );

  return !haveMemorySnapshot;
};
