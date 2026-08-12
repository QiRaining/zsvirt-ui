import { gql, useApolloClient } from "@apollo/client";
import { genUuid, bus } from "@zstack/utils";
import { omit } from "lodash-es";
import { useRef, useEffect, useCallback } from "react";

import type { IActionParams, IActionResult, ITaskResult } from "./type";
import { MiddleState } from "./type";

export function useAction() {
  const isDestroy = useRef(false);
  const apolloClient = useApolloClient();

  const doAction = useCallback(function _<T = any>(params: IActionParams<T>) {
    const actionId = genUuid();
    const {
      mutation,
      name,
      total,
      payload,
      middleState,
      refetchPolicy = "finish",
      forceRunCallback = false,
      type: refetchResourceTypename,
      successMessage,
      onProgress,
      onFinish,
    } = params;

    // 触发信息弹窗提示
    bus.emit("addAction", actionId, name, total, successMessage);

    let cacheMap: { [prop: string]: any } = {};

    if (middleState) {
      const middleStateList = Array.isArray(middleState)
        ? middleState
        : [middleState];
      middleStateList.forEach((item) => {
        const { type, uuids, field, data } = item;
        uuids.forEach((uuid: string) => {
          const id = apolloClient.cache.identify({
            __typename: type,
            uuid,
          });
          const fragment = gql`
          fragment ${type}Fragment on ${type} {
            ${field}
          }
        `;
          // 读取并保存初始状态
          cacheMap[uuid] = {
            id,
            fragment,
            data: omit(
              apolloClient.readFragment({
                id,
                fragment,
              }),
              "__typename",
            ),
          };

          // 写入缓存
          apolloClient.writeFragment({
            id,
            fragment,
            data,
            broadcast: false, // 只更新需要修改的字段,其余字段不通过fetchPolicy更新
          });

          // 广播进度事件（替代 RxJS）
          bus.emit("action:event", {
            data: {
              type,
              actionId,
              id: uuid,
              fields: field,
              state: MiddleState.Running,
              sessionId: localStorage.getItem("sessionId"),
            },
            type: "progress",
            isCurrentWindow: true,
          });
        });
      });
    }

    // 搭配 main/src/layouts/main-nav 中的 useSubscription，做到操作反馈回来后，调用 onProgress
    bus.addListener(`action:progress:${actionId}`, (result: ITaskResult) => {
      if (result.current === total) {
        bus.removeListener(`action:progress:${actionId}`);
      }

      if (result.id && result.error && cacheMap[result.id]) {
        // 操作失败恢复缓存
        const { id, fragment, data } = cacheMap[result.id];
        apolloClient.writeFragment({
          id,
          fragment,
          data,
          broadcast: false, // 只更新需要修改的字段,其余字段不通过fetchPolicy更新
        });
        delete cacheMap[result.id];
      }

      // 搭配 TableList 组件 type, refetchPolicy props, 达到刷新资源列表的功能
      if (refetchResourceTypename && refetchPolicy === "progress") {
        bus.emit(`action:refetch:${refetchResourceTypename}`);
      }

      // 组件卸载后将不再调用 onProgress，防止内存泄漏。但如果是 onProgress 是无副作用的，可以通过 forceRunCallback 设置调用
      if (onProgress && (forceRunCallback || !isDestroy.current)) {
        onProgress(result);
      }
    });

    // 搭配 main/src/layouts/main-nav 中的 useSubscription，做到操作反馈回来后，调用 onFinish
    bus.addListener(`action:finish:${actionId}`, (result: IActionResult) => {
      bus.removeListener(`action:finish:${actionId}`);
      cacheMap = {};

      // 搭配 TableList 组件 type, refetchPolicy props, 达到刷新资源列表的功能
      if (refetchResourceTypename && refetchPolicy === "finish") {
        bus.emit(`action:refetch:${refetchResourceTypename}`);
      }

      // 组件卸载后将不再调用 onFinish，防止内存泄漏。但如果是 onFinish 是无副作用的，可以通过 forceRunCallback 设置调用
      if (onFinish && (forceRunCallback || !isDestroy.current)) {
        onFinish({ ...result, actionId });
      }
    });

    return apolloClient.mutate({
      mutation,
      variables: {
        input: {
          payload,
          action: {
            name,
            total,
            actionId,
          },
        },
      },
    });
  }, []);

  useEffect(() => {
    return () => {
      isDestroy.current = true;
    };
  }, []);

  return doAction;
}
