import {
  BaremetalChassisState,
  BaremetalChassisPowerStatusType,
} from "@zstack/zsphere-types";
import type { BaremetalChassis as IBaremetalChassis } from "@zstack/zsphere-types/graphql";
import { curry } from "lodash-es";

// 单选
export const verifySingleSelect = (
  selectedList: Array<IBaremetalChassis>,
): boolean => {
  return selectedList.length === 1;
};

export const startValidator = (current: IBaremetalChassis) => {
  return current.state !== BaremetalChassisState.Enabled;
};
export const stopValidator = (current: IBaremetalChassis) => {
  return current.state !== BaremetalChassisState.Disabled;
};

const previsionStatus = [
  "Unprovisioned",
  "Provisioned",
  "PxeBootFailed",
  "HWInfoUnknown",
  "Available",
  "PxeBooting",
  "Allocated",
];

function checkProvisionStatus({ status }: IBaremetalChassis) {
  if (!status) {
    return false;
  }

  return previsionStatus.includes(status);
}

// 电源状态校验器
const powerStatusValidator = (
  powerStatus: BaremetalChassisPowerStatusType,
  selectedList: Array<IBaremetalChassis>,
): boolean =>
  selectedList.every(
    (item) => item.powerStatus === powerStatus && checkProvisionStatus(item),
  );

const powerStatusValidatorCurry = curry(powerStatusValidator);

export const onValidator = powerStatusValidatorCurry(
  BaremetalChassisPowerStatusType.PowerOff,
);
export const offValidator = powerStatusValidatorCurry(
  BaremetalChassisPowerStatusType.PowerOn,
);

export const openConsoleValidator = (
  selectedList: Array<IBaremetalChassis>,
): boolean =>
  verifySingleSelect(selectedList) &&
  selectedList[0].powerStatus !== BaremetalChassisPowerStatusType.Unknown;

// 更新ipmi信息
export const verifyUpdateIPMIInfo = (current: IBaremetalChassis): boolean => {
  return current.powerStatus === BaremetalChassisPowerStatusType.Unknown;
};

export const verifyCreateBaremetalInstance = (current: IBaremetalChassis) => {
  return !current?.baremetalInstance;
};
