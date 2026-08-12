import { gql, useQuery } from "@apollo/client";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useEffect } from "react";

const queryCustomColumnConfig = gql`
  query queryCustomColumnConfig {
    queryCustomColumnConfig {
      userId
      customColumnConfig
    }
  }
`;

export const useGetCustomColumnConfig = () => {
  const { data } = useQuery(queryCustomColumnConfig);
  // 分开订阅，避免订阅整个 store
  const setCustomColumnConfig = usePlatformStore(
    (state) => state.setCustomColumnConfig,
  );
  useEffect(() => {
    const customColumnConfig =
      data?.queryCustomColumnConfig?.customColumnConfig;
    if (customColumnConfig) {
      setCustomColumnConfig(JSON.parse(customColumnConfig || "{}"));
    }
  }, [data]);
};
