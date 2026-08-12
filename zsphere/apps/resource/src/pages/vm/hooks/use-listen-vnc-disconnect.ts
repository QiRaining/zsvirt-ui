import { useApolloClient, gql } from "@apollo/client";
import { Op, VmInstanceState } from "@zstack/zsphere-types";
import { useInterval } from "ahooks";
import { get } from "lodash-es";
import { useRef, useEffect } from "react";

const queryVmState = gql`
  query vmInstanceList($conditions: [Condition!]) {
    vmInstanceList(conditions: $conditions) {
      list {
        uuid
        state
      }
    }
  }
`;

export default function useListenVncDisconnect() {
  const apolloClient = useApolloClient();
  const refreshVmUuids = useRef(new Map<string, number>()).current;

  // 监听 VNC 断开连接
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const source = get(event.data, "source");
      const type = get(event.data, "type");
      const uuid = get(event.data, "uuid");
      if (
        source === "novnc" &&
        type === "disconnect" &&
        uuid &&
        !refreshVmUuids.has(uuid)
      ) {
        refreshVmUuids.set(uuid, 0);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [apolloClient, refreshVmUuids]);

  // 刷新断开连接的 VM 的 state
  useInterval(() => {
    if (refreshVmUuids.size) {
      apolloClient
        .query({
          query: queryVmState,
          variables: {
            conditions: [
              { key: "uuid", op: Op.in, values: [...refreshVmUuids.keys()] },
            ],
          },
          fetchPolicy: "network-only",
        })
        .then(({ data }) => {
          (data?.vmInstanceList?.list ?? []).forEach(({ uuid, state }: any) => {
            const retry = refreshVmUuids.get(uuid) ?? 0;
            if (state !== VmInstanceState.Running || retry > 15) {
              refreshVmUuids.delete(uuid);
            } else {
              refreshVmUuids.set(uuid, retry + 1);
            }
          });
        })
        .catch(() => {
          // ignore
        });
    }
  }, 3000);
}
