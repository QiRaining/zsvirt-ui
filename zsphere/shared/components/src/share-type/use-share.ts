import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Identity } from "@zstack/zsphere-types";
import { useCallback } from "react";

const useShare = () => {
  const { currentUser } = usePlatformStore();
  const isShareResource = useCallback(
    (resourceList: any[]) =>
      [Identity.Admin, Identity.PlatformAdmin].indexOf(
        currentUser.currentIdentity!,
      ) === -1 &&
      resourceList.every(
        (resource) => resource?.owner?.uuid !== currentUser.accountUuid,
      ),
    [currentUser],
  );

  const verifyShareResource = useCallback(
    (current: any) =>
      [Identity.Admin, Identity.PlatformAdmin].indexOf(
        currentUser.currentIdentity!,
      ) === -1 && current?.owner?.uuid !== currentUser.accountUuid,
    [currentUser],
  );
  return { isShareResource, verifyShareResource };
};

export default useShare;
