import { useQuery } from "@apollo/client";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useEffect } from "react";

import { zopsSupportable } from "../gql/zops.gql";

export const useZOps = () => {
  const { data } = useQuery<{ zopsSupportable: boolean }>(zopsSupportable);
  // 只订阅 setZOpsSupportable 方法，避免订阅整个 store
  const setZOpsSupportable = usePlatformStore(
    (state) => state.setZOpsSupportable,
  );

  useEffect(() => {
    if (data) {
      setZOpsSupportable(data.zopsSupportable);
    }
  }, [data, setZOpsSupportable]);
};
