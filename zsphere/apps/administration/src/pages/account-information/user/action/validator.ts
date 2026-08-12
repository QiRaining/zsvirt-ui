import { platformStore } from "@zstack/zsphere-platform-store";
import { AccountType, State as StateEnum } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import { some as _some } from "lodash-es";

const ADMIN_UUID = "36c27e8ff05c4780bf6d2fa65700f22e";

export const verifyEnable = (selectedList: IAccount[]) => {
  return _some(selectedList, (it) => it.state === StateEnum.Disabled);
};

export const verifyDisable = (selectedList: IAccount[]) => {
  return _some(selectedList, (it) => it.state === StateEnum.Enabled);
};

export const verifyType = (current: IAccount) => {
  return current.type !== AccountType.SystemAdmin;
};

export const verifyBySystemAdmin = (current: IAccount) => {
  return current?.type !== "SystemAdmin";
};

export const verifyCanChangeToAdmin = (selectedList: IAccount[]) => {
  const currentUser = platformStore.getState().currentUser;
  if (currentUser?.accountUuid !== ADMIN_UUID) {
    return false;
  }

  return _some(
    selectedList,
    (it) =>
      it.type === AccountType.Normal || it.type === AccountType.ThirdParty,
  );
};
