// diff 更新对象的方法函数

export const CommonCpuMode = ["none", "host-model", "host-passthrough"];

export const aarch64CpuMode = ["Kunpeng-920", "FT-2000+", "Tengyun-S2500"];

export const winLists = [
  "WindowsServer 2008",
  "WindowsServer 2012",
  "WindowsServer 2016",
  "WindowsServer 2019",
  "WindowsServer 2022",
  "WindowsServer 2025",
];

export const MAX_CPU_NUM = 1024;

export function diff(obj1: any, obj2: any): object {
  const result: Record<string, any> = {};

  // 遍历 obj1 的所有键
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      // 如果 obj2 没有该键，则记录下来
      if (!obj2.hasOwnProperty(key)) {
        result[key] = { removed: obj1[key] };
      } else if (
        typeof obj1[key] === "object" &&
        typeof obj2[key] === "object"
      ) {
        // 如果都是对象，则递归比较
        const nestedDiff = diff(obj1[key], obj2[key]);
        if (Object.keys(nestedDiff).length > 0) {
          result[key] = nestedDiff;
        }
      } else if (obj1[key] !== obj2[key]) {
        // 如果值不同，则记录下来
        result[key] = { old: obj1[key], new: obj2[key] };
      }
    }
  }

  // 检查 obj2 中新增的键
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
      result[key] = { added: obj2[key] };
    }
  }

  return result;
}

const winListsSet = new Set(winLists);
// 辅助函数：判断是否支持热插拔
export const allowsHotPlug = (
  guest: string,
  os: string,
  isEdit: boolean,
): boolean => {
  if (guest === "Windows") {
    return isEdit || winListsSet.has(os);
  }
  if (guest === "Other") {
    return false;
  }
  // 默认情况，即Linux或其他未明确处理的操作系统
  return true;
};

interface UpdateParams {
  guest: "Linux" | "Windows" | "Other";
  isEdit: boolean;
  lockRef: React.RefObject<boolean>;
  vnumaEnabled: boolean;
  cpuBindList: any[] | undefined;
  os: string;
}

interface UpdateResult {
  hotPlug: boolean;
  switchDisable: boolean;
}

export const updateHotPlugAndSwitchDisable = (
  params: UpdateParams,
): UpdateResult => {
  const { guest, isEdit, lockRef, vnumaEnabled, cpuBindList, os } = params;
  let hotPlug = false;
  let switchDisable = false;

  switch (guest) {
    case "Linux":
      if (!isEdit && lockRef.current) {
        hotPlug = true;
      }
      break;
    case "Windows":
      if (!isEdit) {
        hotPlug = winLists.includes(os);
      }
      switchDisable = !winLists.includes(os);
      break;
    case "Other":
      if (!isEdit) {
        hotPlug = false;
      }
      switchDisable = true;
      break;
  }

  // hotPlug与vnuma互斥
  if (vnumaEnabled && cpuBindList?.length) {
    hotPlug = false;
    switchDisable = true;
  }

  return { hotPlug, switchDisable };
};
