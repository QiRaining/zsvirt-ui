import { BaremetalInstanceState } from "@zstack/zsphere-types";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";

// verifySingle
const verifySingle = async (selectedList: IBaremetalInstance[]) => {
  return selectedList.length === 1;
};

// verifySelect
const verifySelect = async (selectedList: IBaremetalInstance[]) => {
  return selectedList.length >= 0;
};
// 没有选中
const verifyNotSelect = (selectedList: IBaremetalInstance[]): boolean => {
  return selectedList?.length <= 0 || !selectedList;
};
// verifyMultiSelect
const verifyMultiSelect = async (selectedList: IBaremetalInstance[]) => {
  return selectedList.length >= 1;
};

// 启动
const verifyStart = async (current: IBaremetalInstance) => {
  return ![
    BaremetalInstanceState.Running,
    BaremetalInstanceState.Rebooting,
  ].includes(current?.state ?? -1);
};

// 停止
const verifyStop = async (current: IBaremetalInstance) => {
  return ![
    BaremetalInstanceState.Stopped,
    BaremetalInstanceState.Rebooting,
  ].includes(current?.state ?? -1);
};

// 启动
const verifyReboot = async (current: IBaremetalInstance) => {
  return current?.state === BaremetalInstanceState.Running;
};

// 解绑标签
const verifyDetachTag = async (current: IBaremetalInstance) => {
  return current?.tag?.length !== 0;
};

const verifyOpenConsole = (current: IBaremetalInstance) => {
  return current?.state === BaremetalInstanceState.Running;
};

export {
  verifySingle,
  verifyNotSelect,
  verifySelect,
  verifyStart,
  verifyStop,
  verifyReboot,
  verifyMultiSelect,
  verifyDetachTag,
  verifyOpenConsole,
};
