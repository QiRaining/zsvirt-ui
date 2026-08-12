import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Identity } from "@zstack/zsphere-types";
import { useMemo } from "react";

const adminRoleList = [
  Identity.Admin,
  Identity.PlatformAdmin,
  Identity.PlatformUser,
];

const accountRoleList = ["AccountNormalUser", "NormalAccount"];

const UseCheckCurrentLogin = () => {
  const { currentUser } = usePlatformStore();
  const { currentIdentity } = currentUser;

  return useMemo(() => {
    let isAdmin = false;
    let isAccount = false;

    if (accountRoleList.includes(currentIdentity)) {
      isAccount = true;
    }
    if (adminRoleList.includes(currentIdentity)) {
      isAdmin = true;
    }

    return {
      isAdmin,
      isAccount,
    };
  }, [currentIdentity]);
};

export default UseCheckCurrentLogin;
