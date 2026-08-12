import { gql, useLazyQuery } from "@apollo/client";
import { bus } from "@zstack/zsphere-utils";
import { useEffect } from "react";

const queryGlobalConfig = gql`
  query globalConfig {
    globalConfig(
      category: "accessControl"
      name: "enable.request.source.ip.address.check"
    ) {
      name
      category
      value
      uuid
    }
  }
`;

export function useGlobalConfigAuth() {
  const [query, { data, loading }] = useLazyQuery(queryGlobalConfig);

  useEffect(() => {
    query();
  }, [query]);

  useEffect(() => {
    if (!loading && data?.globalConfig?.value !== "true") {
      bus.emit("ADD_REMOVE_AUTHLIST", [
        `ip.black.list||view||list`,
        `ip.white.list||view||list`,
        `virtualization.ip-blocklist.allowlist||view||list`,
      ]);
    }
    return () => {
      bus.emit("CLEAR_REMOVE_AUTHLIST", [
        `ip.black.list||view||list`,
        `ip.white.list||view||list`,
        `virtualization.ip-blocklist.allowlist||view||list`,
      ]);
    };
  }, [data, loading]);
}
