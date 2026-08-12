import { gql } from "@apollo/client";
import { genUuid, bus } from "@zstack/zsphere-utils";
import { omit } from "lodash-es";
import { useRef, useEffect, useCallback } from "react";

import type { IActionParams, IActionResult, ITaskResult } from "./type";
import { MiddleState } from "./type";

function useAction() {
  const isDestory = useRef(false);
  const actionRespSubject = window.g_action_subscribe;

  const doAction = useCallback(function _<T = any>(params: IActionParams<T>) {
    const { apolloClient } = window.g_main;
    const actionId = genUuid();
    const {
      mutation,
      name,
      total,
      payload,
      middleState,
      refetchPolicy = "finish",
      forceRunCallback = false,
      silent,
      type: refetchResourceTypename,
      successMessage,
      onProgress,
      onFinish,
    } = params;

    // 触发信息弹窗提示
    bus.emit("addAction", actionId, name, total, successMessage, silent);
    console.log("[useAction] dispatch", {
      actionId,
      name,
      total,
      type: refetchResourceTypename,
      forceRunCallback,
      hasOnFinish: !!onFinish,
      hasOnProgress: !!onProgress,
    });

    let cacheMap: { [prop: string]: any } = {};

    if (middleState) {
      const { type, uuids, field, data } = middleState;
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

        actionRespSubject.next({
          data: {
            type,
            actionId,
            id: uuid,
            fields: field,
            state: MiddleState.Running,
            sessionId: localStorage.getItem("sessionId"),
          },
          type: "progress",
        });
      });
    }

    // 超时兜底：如果 action 因网络错误等原因永远不完成，listener 闭包会一直持有
    // apolloClient、cacheMap 等引用导致内存泄漏。10 分钟后强制清理。
    const ACTION_TIMEOUT = 10 * 60 * 1000;
    const cleanupTimer = setTimeout(() => {
      bus.removeListener(`action:progress:${actionId}`);
      bus.removeListener(`action:finish:${actionId}`);
      cacheMap = {};
    }, ACTION_TIMEOUT);

    bus.addListener(`action:progress:${actionId}`, (result: ITaskResult) => {
      console.log("[useAction] progress listener fired", {
        actionId,
        name,
        destroyed: isDestory.current,
        forceRunCallback,
        hasOnProgress: !!onProgress,
        result,
      });
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
      if (onProgress && (forceRunCallback || !isDestory.current)) {
        onProgress(result);
      }
    });

    bus.addListener(`action:finish:${actionId}`, (result: IActionResult) => {
      console.log("[useAction] finish listener fired", {
        actionId,
        name,
        destroyed: isDestory.current,
        forceRunCallback,
        hasOnFinish: !!onFinish,
        result,
      });
      clearTimeout(cleanupTimer);
      bus.removeListener(`action:finish:${actionId}`);
      cacheMap = {};

      // 搭配 TableList 组件 type, refetchPolicy props, 达到刷新资源列表的功能
      if (refetchResourceTypename && refetchPolicy === "finish") {
        bus.emit(`action:refetch:${refetchResourceTypename}`);
      }

      // 组件卸载后将不再调用 onFinish，防止内存泄漏。但如果是 onFinish 是无副作用的，可以通过 forceRunCallback 设置调用
      if (onFinish && (forceRunCallback || !isDestory.current)) {
        onFinish({ ...result, actionId });
      }
    });

    return apolloClient
      .mutate({
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
      })
      .then((r: unknown) => {
        console.log("[useAction] mutate resolved", {
          actionId,
          name,
          data: (r as { data?: unknown })?.data,
        });
        return r;
      })
      .catch((e: unknown) => {
        console.warn("[useAction] mutate rejected", {
          actionId,
          name,
          error: e,
        });
        throw e;
      });
  }, []);

  useEffect(() => {
    return () => {
      isDestory.current = true;
    };
  }, []);

  return doAction;
}

export default useAction;
