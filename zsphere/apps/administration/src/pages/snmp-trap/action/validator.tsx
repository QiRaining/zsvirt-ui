import type { SnmpTrapReceiver } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (
  selectedList: SnmpTrapReceiver[],
): boolean => {
  return selectedList.length === 1;
};

export const verifyDelete = (current: SnmpTrapReceiver) => {
  return !!current.uuid;
};
