import { useQuery } from "@apollo/client";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { UIEnvInfo } from "@zstack/zsphere-types/graphql";
import { useEffect } from "react";

import { getUIEnv, getBootStrapInfo } from "../gql/ui-env.gql";

export const useBootstrapEnv = () => {
  // 使用精确的选择器，只订阅需要的方法
  const setOpenPlatformStatus = usePlatformStore(
    (state) => state.setOpenPlatformStatus,
  );
  const setIsBootstrap = usePlatformStore((state) => state.setIsBootstrap);
  const { data } = useQuery<{ UIEnv: UIEnvInfo }>(getUIEnv);

  const { data: bootStrapData } = useQuery(getBootStrapInfo);

  useEffect(() => {
    if (data) {
      const { isOpenPlatform } = data.UIEnv;
      setOpenPlatformStatus(isOpenPlatform);
    }
    if (bootStrapData) {
      const { isBootstrap } = bootStrapData.isBootstrap;
      setIsBootstrap(isBootstrap);
    }
  }, [data, bootStrapData, setOpenPlatformStatus, setIsBootstrap]);
};
