import { useApolloClient, gql } from "@apollo/client";
import { Op, VmInstanceState } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import { useInterval } from "ahooks";
import { useRef, useCallback } from "react";

// 过渡状态：处于这些状态的云主机需要轮询直到到达最终态
// @see
const TRANSITIONAL_STATES: Set<string> = new Set([
  VmInstanceState.Starting,
  VmInstanceState.Stopping,
  VmInstanceState.Rebooting,
  VmInstanceState.Destroying,
  VmInstanceState.Migrating,
  VmInstanceState.Pausing,
  VmInstanceState.Resuming,
  VmInstanceState.VolumeMigrating,
  VmInstanceState.VolumeRecovering,
  VmInstanceState.Expunging,
]);

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

const POLL_INTERVAL = 3000;

/**
 * 轮询处于过渡状态的云主机，自动刷新其状态。
 * 模仿 useListenVncDisconnect 的实现方式：
 * - apolloClient.query + fetchPolicy: 'network-only' 查询最新状态
 * - Apollo Cache 根据 __typename + uuid 自动合并，TableList 响应缓存变化重新渲染
 */
export default function usePollingTransitionalVm() {
  const apolloClient = useApolloClient();
  const transitionalUuids = useRef(new Set<string>());

  // 当 TableList 拉取到新数据后调用，同步需要轮询的 uuid 集合
  const onFetchChange = useCallback(
    ({ list }: { list: VmInstance[]; total: number }) => {
      const newSet = new Set<string>();
      for (const vm of list) {
        if (vm.state && TRANSITIONAL_STATES.has(vm.state)) {
          newSet.add(vm.uuid);
        }
      }
      transitionalUuids.current = newSet;
    },
    [],
  );

  // 定时轮询过渡状态的云主机
  useInterval(() => {
    const uuids = transitionalUuids.current;
    if (uuids.size === 0) {
      return;
    }

    apolloClient
      .query({
        query: queryVmState,
        variables: {
          conditions: [{ key: "uuid", op: Op.in, values: [...uuids] }],
        },
        fetchPolicy: "network-only",
      })
      .then(({ data }) => {
        const list = data?.vmInstanceList?.list ?? [];
        for (const { uuid, state } of list) {
          if (!TRANSITIONAL_STATES.has(state)) {
            uuids.delete(uuid);
          }
        }
      })
      .catch(() => {
        // 网络异常静默忽略，下次轮询重试
      });
  }, POLL_INTERVAL);

  return { onFetchChange };
}
