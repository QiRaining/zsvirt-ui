import { systemAlarmUuidList } from "@zstack/zsphere-components";
import type { ZWatchAlarmVO as IZWatchAlarm } from "@zstack/zsphere-types/graphql";

// verifySingle
export const verifySingle = async (selectedList: IZWatchAlarm[]) => {
  return selectedList.length === 1;
};

// verifyMulti
export const verifyMulti = async (selectedList: IZWatchAlarm[]) => {
  return selectedList.length >= 1;
};

// 启动
export const verifyStart = async (current: IZWatchAlarm): Promise<boolean> => {
  return current.state !== "Enabled";
};

// 停止
export const verifyStop = async (current: IZWatchAlarm) => {
  return current.state !== "Disabled";
};

// 删除 (不能删除系统自带报警器)
export const verifyDelete = async (selectedList: IZWatchAlarm[]) => {
  return !selectedList
    ?.map((it) => it?.uuid)
    ?.some((uuid) => systemAlarmUuidList.some((item) => item === uuid));
};
