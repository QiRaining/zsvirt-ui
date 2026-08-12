import { AccountType } from "@zstack/zsphere-types";
import type {
  AccountVO as IAccount,
  UserGroup as IUserGroup,
} from "@zstack/zsphere-types/graphql";

export const analyzeAccountTypes = (
  selectedList: IAccount[] | IUserGroup[] = [],
) => {
  if (selectedList?.[0]?.__typename === "UserGroup") {
    return {
      isUserGroup: true,
      isMixed: false,
    };
  }

  const types = selectedList.map((account) => (account as IAccount)?.type);
  const allNormal = types.every((type) => type === AccountType.Normal);
  const allSystemAdmin = types.every(
    (type) => type === AccountType.SystemAdmin,
  );
  const allThirdParty = types.every((type) => type === AccountType.ThirdParty);

  const onlyNormalAndThirdParty = types.every(
    (type) => type === AccountType.Normal || type === AccountType.ThirdParty,
  );

  const allowBindRole =
    allNormal || allSystemAdmin || allThirdParty || onlyNormalAndThirdParty;

  return {
    allNormal,
    allSystemAdmin,
    allowBindRole,
    onlyNormalAndThirdParty,
  };
};
