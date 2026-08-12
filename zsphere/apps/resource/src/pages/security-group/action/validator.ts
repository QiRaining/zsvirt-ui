import { SecurityGroupState } from "@zstack/zsphere-types";
import type { SecurityGroup as ISecurityGroup } from "@zstack/zsphere-types/graphql";
import {
  isCidr,
  isIP,
  isLegalIPRange,
  isPortExclude0,
  isPortRange,
} from "@zstack/zsphere-utils";
import { isEmpty as _isEmpty } from "lodash-es";

// 数组长度校验
const length = async (selectedList: ISecurityGroup[]) => {
  return selectedList.length === 1;
};

// 启用
const enableSecurityGroup = (current: ISecurityGroup) => {
  return current.state !== SecurityGroupState.Enabled;
};

// 禁用
const disableSecurityGroup = (current: ISecurityGroup) => {
  return current.state !== SecurityGroupState.Disabled;
};

// 加载三层网络
const loadL3 = () => {
  return true;
};

// 卸载三层网络
const unloadL3 = (current: ISecurityGroup) => {
  return !!current.attachedL3NetworkUuids?.length;
};

// 删除
const deleteSecurityGroup = () => {
  return true;
};

export const verifyIdentity = () => {
  const loginType = JSON.parse(
    window.localStorage.getItem("loginType") ?? '""',
  );
  const IAM2View = JSON.parse(window.localStorage.getItem("IAM2View") ?? '""');

  return !(loginType === "IAM2" && IAM2View === "project");
};

// 默认安全组 & 身份
export const verifyDefaultSGAndIdentity = (
  securityGroupList: ISecurityGroup[],
) => {
  return _isEmpty(securityGroupList.filter((sg) => sg.projectUuid))
    ? true
    : verifyIdentity();
};

export const validatorIp = (inputIp: string) => {
  const ipList = inputIp.split(",");
  let flag;
  for (const ip of ipList) {
    const i = ip.trim();
    flag = !i || (!isIP(i) && !isLegalIPRange(i) && !isCidr(i));
    if (flag) {
      break;
    }
  }
  if (ipList.length === 1 && !ipList[0].trim().replace(/^\n+|\n+$/g, "")) {
    flag = false;
  }
  return !flag;
};

export const validatorIpLength = (inputIp: string) => {
  const ipList = inputIp.split(",");
  if (ipList.length > 10) {
    return false;
  }
  return true;
};

export const validatorPort = (inputPort: string) => {
  const portList = inputPort.split(",");
  let flag;
  for (const port of portList) {
    const i = port.trim();
    flag = (isPortExclude0(i) || isPortRange(i)) && i;
    if (!flag) {
      break;
    }
  }
  if (portList.length === 1 && !portList[0].trim().replace(/^\n+|\n+$/g, "")) {
    flag = true;
  }
  return flag;
};

export const validatorPortLength = (inputPort: string) => {
  const portList = inputPort.split(",");
  let { length } = portList;
  if (portList.some((p) => p.includes("-"))) {
    length += portList.filter((p) => p.includes("-")).length;
  }
  if (length > 10) {
    return false;
  }
  return true;
};

const isValInRange = (val: string, range: string[]) =>
  Number(val) >= Number(range[0]) && Number(val) <= Number(range[1]);

export const validatePortNotConflict = (inputPort: string) => {
  const portList = inputPort.split(",");
  const portRange = portList.filter((port) => port.includes("-"));
  const portVal = portList.filter((port) => !port.includes("-"));
  // 每个端口都不存在于每个端口范围里面
  return portVal.every((port) => {
    return portRange.every((range) => !isValInRange(port, range.split("-")));
  });
};

// Check if at least one item is selected
const hasSelection = async (selectedList: ISecurityGroup[]) => {
  return selectedList.length >= 1;
};

// Check if security group has rules for export
const hasRulesForExport = (current: ISecurityGroup) => {
  return !!current.rules?.length;
};

const actionValidatorGroup = {
  edit: {
    preValidators: [verifyDefaultSGAndIdentity],
  },
  enable: {
    validators: [enableSecurityGroup],
    preValidators: [hasSelection, verifyDefaultSGAndIdentity],
  },
  disable: {
    validators: [disableSecurityGroup],
    preValidators: [hasSelection, verifyDefaultSGAndIdentity],
  },
  loadL3: {
    validators: [loadL3],
    preValidators: [length],
  },
  unloadL3: {
    validators: [unloadL3],
    preValidators: [length],
  },
  delete: {
    validators: [deleteSecurityGroup],
    preValidators: [hasSelection, verifyDefaultSGAndIdentity],
  },
  importRules: {
    preValidators: [length, verifyDefaultSGAndIdentity],
  },
  exportRules: {
    validators: [hasRulesForExport],
    preValidators: [length, verifyDefaultSGAndIdentity],
  },
};

export { actionValidatorGroup };
