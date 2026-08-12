export interface ITimerMap {
  second: number;
  minute: number;
  hour: number;
  day: number;
  [key: string]: number;
}

export interface IOperatorMap {
  ">": string;
  ">=": string;
  "<": string;
  "<=": string;
  [key: string]: string;
}

const timerMap: ITimerMap = {
  second: 1,
  minute: 60,
  hour: 60 * 60,
  day: 60 * 60 * 24,
};

const [cpuUsedPercentStr, memoryUsedPercentStr, cpuAndMemoryUsedPercentStr] = [
  "cpuUsedPercentThreshold",
  "memoryUsedPercentThreshold",
  "cpuUsedPercentThreshold,memoryUsedPercentThreshold",
];

const monitorItemList = [
  {
    name: "drs.rateOfCpu",
    value: cpuUsedPercentStr,
  },
  {
    name: "drs.rateOfMemory",
    value: memoryUsedPercentStr,
  },
  {
    name: "drs.rateOfCpuAndMemory",
    value: cpuAndMemoryUsedPercentStr,
  },
];

const timeUnitList = [
  {
    name: "common.second",
    value: "second",
  },
  {
    name: "common._minute",
    value: "minute",
  },
  {
    name: "common.hour",
    value: "hour",
  },
];

const operatorMap: IOperatorMap = {
  ">": "＞",
  ">=": "≥",
  "<": "＜",
  "<=": "≤",
};

const conditionNameList = [
  {
    name: "drs.vmUuid",
    value: "vmUuid",
  },
];

const automationLevelList = ["Manual", "Automatic"];

export {
  timerMap,
  cpuUsedPercentStr,
  memoryUsedPercentStr,
  cpuAndMemoryUsedPercentStr,
  monitorItemList,
  timeUnitList,
  operatorMap,
  conditionNameList,
  automationLevelList,
};
