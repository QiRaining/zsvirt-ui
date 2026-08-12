import type {
  Zone as IZone,
  ZSVBackupStorage as IZSVBackupStorage,
} from "@zstack/zsphere-types/graphql";

// 停止
const verifyStop = (current: IZone) => {
  return ["Enabled"].indexOf(current.state || "") >= 0;
};

// 加载
const verifyAttach = (selectedList: IZone[]) => {
  return selectedList.length === 0;
};

const verifyUninstall = (current: IZone, source: any) => {
  const defaultUuid = source?.current?.attachedZoneRefUuids?.[0];
  return current.uuid !== defaultUuid;
};

const single = async (current: IZSVBackupStorage[]) => {
  return current.length === 1;
};

const selected = async (current: any[]) => {
  return current.length !== 0;
};

// 启用
const verifyEnable = (current: IZSVBackupStorage): boolean => {
  return current.state === "Disabled";
};

// 停用
const verifyDisable = (current: IZSVBackupStorage): boolean => {
  return current.state === "Enabled";
};

export {
  verifyStop,
  verifyAttach,
  verifyUninstall,
  single,
  selected,
  verifyEnable,
  verifyDisable,
};
