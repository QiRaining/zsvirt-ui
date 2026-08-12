import type { IpRange as IIpRange } from "@zstack/zsphere-types/graphql";

// 添加网络段
const addIpRange = async () => {
  return true;
};

// 删除网络段
const deleteIpRange = (current: IIpRange) => {
  return !!current.l3NetworkUuid;
};

const actionValidatorGroup = {
  addIpRange: {
    validators: [addIpRange],
  },
  deleteIpRange: {
    validators: [deleteIpRange],
  },
};

export { actionValidatorGroup };
