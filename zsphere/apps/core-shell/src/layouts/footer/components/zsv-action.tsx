import type { ApolloError } from "@apollo/client";
import { gql, useLazyQuery, useSubscription } from "@apollo/client";
import { Drawer, DrawerHeader, DrawerBody } from "@zstack/design";
import { Icon } from "@zstack/icon";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { ActionTaskState, Op } from "@zstack/zsphere-types";
import type {
  ActionTaskResult,
  QueryOperationLogResp,
} from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import {
  useInterval,
  useMount,
  usePersistFn,
  useUnmount,
  useUpdateEffect,
} from "ahooks";
import { message } from "antd";
import { produce } from "immer";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import OperationDetail from "zsv_shared/operation-log/detail";

import apollo from "../../../utils/apollo";

import style from "../style.module.less";

// 替代 lodash-es keys 的原生方法 (bundle-barrel-imports)
const getObjectKeys = <T extends object>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[];
};

// 替代 lodash-es isEqual 的简单比较 (bundle-barrel-imports)
const shallowEqual = (a: unknown[], b: unknown[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

const LISTEN_ACTION_RESP = gql`
  subscription listenActionResp($sessionId: String!) {
    listenActionResp(sessionId: $sessionId) {
      sessionId
      actionId
      state
      type
      listenerType
      id
      fields
      inventory
      error
      listenerType
    }
  }
`;

const QUERY_OPERATION_LOG_LIST = gql`
  query operationLogList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    operationLogList(
      conditions: $conditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        loginIp
        actionId
        name
        status
        createDate
        lastOpDate
        accountName
        userName
        isValid
        progress
        longjobs {
          longJobUuid
          clientJobUuid
          jobName
          resourceType
          state
          progress
          data
          createDate
          lastOpDate
        }
        resourceNames
        operationTasks {
          actionId
          taskId
          status
          createDate
          lastOpDate
          operationApis {
            longjob {
              longJobUuid
              clientJobUuid
              jobName
              resourceType
              state
              progress
              createDate
              lastOpDate
            }
            resourceName
            taskId
            apiId
            name
            status
            req
            resp
            createDate
            lastOpDate
          }
        }
      }
    }
  }
`;

const isDev = process.env.NODE_ENV === "development";

interface IActionMap {
  [key: string]: IActionResult;
}

interface IMessageShow {
  actionState: "loading" | "success" | "fail" | "exception";
  actionResult: IActionResult;
  actionId: string;
}

export const ZSVAction = ({ refetch }: { refetch: () => void }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState<boolean>(false);
  const [currentActionId, setCurrentActionId] = useState<string>();
  const [actionMap, setActionMap] = useState<IActionMap>({});
  const [intervalTime, setIntervalTime] = useState<number>();
  const [logList, setLoglist] = useState<{
    operationLogList: QueryOperationLogResp;
  }>();
  const actionRespSubject = window.g_action_subscribe;

  // 使用 ref 同步追踪 actionMap，解决 WebSocket 消息到达时 state 还未更新的竞态问题
  const actionMapRef = useRef<IActionMap>({});
  // 缓存早到的 WebSocket 消息，等 action 被添加后再处理
  const pendingMessagesRef = useRef<Map<string, ActionTaskResult[]>>(new Map());
  const syncedOperationLogIdsRef = useRef<Set<string>>(new Set());

  const { data } = useSubscription<{ listenActionResp: ActionTaskResult }>(
    LISTEN_ACTION_RESP,
    {
      variables: { sessionId: localStorage.getItem("sessionId") },
    },
  );

  const [queryLog] = useLazyQuery<
    { operationLogList: QueryOperationLogResp },
    IQuery
  >(QUERY_OPERATION_LOG_LIST, {
    onCompleted(_data) {
      if (_data) {
        setLoglist(_data);
        const newActionLogIds =
          _data.operationLogList?.list?.reduce<string[]>((ids, item) => {
            const { actionId } = item;
            if (
              actionId &&
              actionMapRef.current[actionId] &&
              !syncedOperationLogIdsRef.current.has(actionId)
            ) {
              ids.push(actionId);
            }
            return ids;
          }, []) ?? [];
        if (newActionLogIds.length) {
          newActionLogIds.forEach((actionId) => {
            syncedOperationLogIdsRef.current.add(actionId);
          });
          bus.emit("operationLogProgress");
        }
        try {
          apollo.writeQuery({
            query: QUERY_OPERATION_LOG_LIST,
            data: _data,
          });
        } catch (e) {
          console.log("******fecth", e);
        }
      }
    },
  });

  useInterval(
    usePersistFn(() => {
      const newActionIds = getObjectKeys(actionMap);
      queryLog({
        variables: {
          conditions: [
            {
              key: "actionId",
              op: Op.in,
              values: newActionIds,
            },
          ],
        },
      });
    }),
    intervalTime,
  );

  const actionIdsRef = useRef<string[]>(getObjectKeys(actionMap));

  const refreshTaskCount = () => {
    refetch();
  };

  // 用于取消上一次 debounce 查询的定时器
  const queryTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useUpdateEffect(() => {
    const newActionIds = getObjectKeys(actionMap);
    const equal = shallowEqual(actionIdsRef.current, newActionIds);
    if (newActionIds.length) {
      if (equal) {
        const logIds =
          logList?.operationLogList?.list?.map((cv) => cv.actionId) ?? [];
        if (newActionIds.some((cv) => !logIds.includes(cv))) {
          setIntervalTime(1 * 1000);
        } else {
          setIntervalTime(5 * 1000);
        }
      } else {
        actionIdsRef.current = newActionIds;
        // 取消上一次的延迟查询，避免旧闭包捕获过期 actionIds
        if (queryTimerRef.current) {
          clearTimeout(queryTimerRef.current);
        }
        // 保持轮询运行（1s 间隔），不再停止轮询
        setIntervalTime(1 * 1000);
        // 延迟查询使用 actionMapRef 读取最新 actionIds，避免闭包陷阱
        queryTimerRef.current = setTimeout(() => {
          const latestActionIds = getObjectKeys(actionMapRef.current);
          if (latestActionIds.length) {
            queryLog({
              variables: {
                conditions: [
                  {
                    key: "actionId",
                    op: Op.in,
                    values: latestActionIds,
                  },
                ],
              },
            });
          }
        }, 800);
      }
    } else {
      setIntervalTime(undefined);
      if (queryTimerRef.current) {
        clearTimeout(queryTimerRef.current);
      }
    }
  }, [actionMap, queryLog, logList]);

  // 渲染message内容
  const renderDescription = usePersistFn(
    (action: IActionResult, key: string) => {
      const { success, fail, total, current, successMessage } = action;
      const getInfo = () => {
        if (success === total) {
          return intl.formatMessage({
            id: "action.success",
            defaultMessage: " Succeeded",
          });
        }
        if (fail === total) {
          return intl.formatMessage({
            id: "action.fail",
            defaultMessage: " Failed",
          });
        }
        if (success && fail) {
          return intl.formatMessage({
            id: "action.exception",
            defaultMessage: "Operation Exception",
          });
        }
        if (current >= 1 && total > 1) {
          return intl.formatMessage(
            {
              id: "action.started.count",
              defaultMessage: "Ongoing {current}/{total}",
            },
            { current, total },
          );
        }
        return intl.formatMessage({
          id: "action.started",
          defaultMessage: " Ongoing",
        });
      };
      const getExceptionDetail = () => {
        if (success && fail) {
          return (
            <div style={{ marginTop: "4px", textAlign: "left" }}>
              {intl.formatMessage(
                {
                  id: "action.result.exception",
                  defaultMessage: "{success} succeeded, {fail} failed",
                },
                { success, fail },
              )}
            </div>
          );
        }
        if (success === total && successMessage) {
          return <div className={style.successMessage}>{successMessage}</div>;
        }
      };

      return (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            setCurrentActionId(key);
            setVisible(true);
            messageDestroy(key);
          }}
        >
          <div className={style.messageContainer} data-testid="actionPanel">
            <div className={style.textContainer}>
              {/* 不能使用 Text 组件，因为 antd message 渲染在 React 树之外，没有 IntlProvider 上下文 */}
              <span>{`${action.name}${intl.locale === "zh-CN" ? "" : " "}${getInfo()}`}</span>
            </div>
            <Icon
              className={style.closeIcon}
              type="close"
              onClick={(e) => {
                messageDestroy(key);
                e.stopPropagation();
              }}
            />
          </div>
          {getExceptionDetail()}
        </div>
      );
    },
  );

  // 触发通知
  const messageShow: (params: IMessageShow) => void = usePersistFn(
    ({ actionState, actionResult, actionId }) => {
      if (actionResult.silent || !actionResult.name) {
        return;
      }
      const config = {
        key: actionId,
        duration: 0,
        content: renderDescription(actionResult, actionId),
        // 注意：antd v4 的 message.success/error/loading 等方法不支持 getContainer 参数
        // getContainer 只能通过 message.config() 全局配置
        // getContainer: () => document.getElementById('main-nav-right') as HTMLElement,
        style: {
          textAlign: "right" as const,
          marginRight: "18px",
        },
      };
      switch (actionState) {
        case "success":
          // 先销毁旧消息，避免 antd v4 在更新消息时出现问题
          message.destroy(actionId);
          message.success({
            ...config,
            className: `${style.messageBox} ${style.success}`,
            icon: (
              <Icon
                type="checkmark-circle-fill"
                color="positive"
                key={actionState}
              />
            ),
          });
          break;
        case "fail":
          // 先销毁旧消息，避免 antd v4 在更新消息时出现问题
          message.destroy(actionId);
          message.error({
            ...config,
            className: `${style.messageBox} ${style.fail}`,
            icon: (
              <Icon type="close-circle-fill" color="danger" key={actionState} />
            ),
          });
          break;
        case "exception":
          // 先销毁旧消息，避免 antd v4 在更新消息时出现问题
          message.destroy(actionId);
          message.warning({
            ...config,
            className: `${style.messageBox} ${style.exception}`,
            icon: (
              <Icon
                type="alert-triangle-fill"
                color="alert"
                key={actionState}
              />
            ),
          });
          break;
        case "loading":
          message.loading({
            ...config,
            className: `${style.messageBox} ${style.loading}`,
            icon: (
              <Icon
                type="loader"
                key={actionState}
                className={style.loadingIcon}
              />
            ),
          });
          break;
      }
    },
  );

  // 关闭通知
  const messageDestroy = usePersistFn((actionId: string) => {
    message.destroy(actionId);
    setActionMap((prevActionMap) =>
      produce(prevActionMap, (draft) => {
        if (draft[actionId]) {
          draft[actionId].messageDestroyed = true;
        }
      }),
    );
  });

  const timeoutCallback = usePersistFn((actionId: string) => {
    if (actionMap[actionId]) {
      refreshTaskCount();
    }
  });

  const timeoutDestroyLoading = usePersistFn((actionId: string) => {
    if (actionMap?.[actionId]?.current !== actionMap?.[actionId]?.total) {
      messageDestroy(actionId);
    }
  });

  // 处理单条 WebSocket 消息的核心逻辑
  const processActionResp = usePersistFn((respData: ActionTaskResult) => {
    const {
      actionId,
      state,
      type,
      listenerType,
      id,
      fields,
      inventory,
      error,
    } = respData;

    // 更新缓存
    if (inventory && fields) {
      try {
        apollo.writeFragment({
          id: apollo.cache.identify({
            __typename: type,
            uuid: id,
          }),
          fragment: gql`
            fragment ${type}Fragment on ${type} {
              ${fields}
            }
          `,
          data: JSON.parse(inventory as string),
          broadcast: false,
        });
      } catch (e) {
        console.log(e);

        if (isDev) {
          const msg = (e as ApolloError)?.message;
          if (msg?.startsWith("Missing field")) {
            const regExp = new RegExp("(?<=Missing field ')w+?'", "gi");
            const keys = [...msg.matchAll(regExp)];

            if (!keys.length) {
              message.error(
                "Apollo 缓存更新失败，可能 fields 中定义的字段未出现在 inventory 中",
              );
            } else {
              message.error(
                `Apollo 缓存更新失败，fields 中定义的 ${keys.join(
                  "  ",
                )} 字段未出现在 inventory 中`,
              );
            }
          } else if (msg?.startsWith("Could not identify object")) {
            message.error(
              `Apollo 缓存更新失败，可能 ${type} 未定义在缓存配置中`,
            );
          } else {
            message.error("Apollo 缓存更新失败，通过控制台可以看到详细信息");
          }
        }
      }
    }

    // 使用 ref 检查，避免 state 异步更新导致的竞态问题
    if (!actionMapRef.current[actionId]) {
      // 没有ID就只更新下action面板数据,同步下进行中的任务
      refreshTaskCount();
      // 在断点续传的情况下，用户刷新页面后，仍旧可以触发刷新前上传任务的状态变更，需要推送
      actionRespSubject.next({
        data: respData,
        type: "progress",
        isCurrentWindow: false,
      });
      actionRespSubject.next({
        data: respData,
        type: "finish",
        isCurrentWindow: false,
      });
      return;
    }

    const needUpdateActionMap = !(
      ([ActionTaskState.suspended, ActionTaskState.running].indexOf(state) !==
        -1 &&
        type === "Image") ||
      (state === ActionTaskState.running &&
        listenerType === "RevertVmFromSnapshotGroupWithMemory")
    );

    // 同步更新 ref
    if (needUpdateActionMap) {
      actionMapRef.current[actionId][state] += 1;
      actionMapRef.current[actionId].current += 1;
    }

    const currentAction = actionMapRef.current[actionId];

    // 异步更新 state
    setActionMap((prevActionMap) =>
      produce(prevActionMap, (draft) => {
        if (needUpdateActionMap && draft[actionId]) {
          draft[actionId][state] += 1;
          draft[actionId].current += 1;
        }
      }),
    );

    // 安全解析 JSON，处理 null/undefined 情况
    let parsedInventory = null;
    let parsedError = null;
    try {
      parsedInventory = inventory ? JSON.parse(inventory as string) : null;
    } catch {
      // ignore parse error
    }
    try {
      parsedError = error ? JSON.parse(error as string) : null;
    } catch {
      // ignore parse error
    }
    const taskResult: ITaskResult = {
      id,
      current: currentAction.current,
      inventory: parsedInventory,
      error: parsedError,
    };

    // action子任务完成
    console.log("[ActionPanel] progress emit", {
      actionId,
      current: currentAction.current,
      total: currentAction.total,
      success: currentAction.success,
      fail: currentAction.fail,
      taskResult,
    });
    bus.emit(`action:progress:${actionId}`, taskResult);
    // 广播
    actionRespSubject.next({
      data: respData,
      type: "progress",
    });

    // 所有任务完成
    if (currentAction.current === currentAction.total) {
      if (currentAction.success === currentAction.total) {
        // 全部成功
        messageShow({
          actionState: "success",
          actionId,
          actionResult: currentAction,
        });
      } else if (currentAction.fail === currentAction.total) {
        // 全部失败
        messageShow({
          actionState: "fail",
          actionId,
          actionResult: currentAction,
        });
      } else if (currentAction.fail && currentAction.success) {
        // 部分成功
        messageShow({
          actionState: "exception",
          actionId,
          actionResult: currentAction,
        });
      }
      // 添加计时器,操作结束后确保弹窗一定关闭
      setTimeout(() => {
        messageDestroy(actionId);
      }, 3 * 1000);

      let inventoryParse;

      try {
        inventoryParse = JSON.parse(inventory!);
      } catch {
        // ignore error
      }
      // action 全部完成
      console.log("[ActionPanel] finish emit", {
        actionId,
        currentAction,
        inventoryParse,
      });
      bus.emit(`action:finish:${actionId}`, {
        ...currentAction,
        inventory: inventoryParse,
      });
      actionRespSubject.next({
        data: respData,
        type: "finish",
      });
      // 刷新action面板数据
      refreshTaskCount();
      // 更新 ref 和 state（先更新，再判断是否可以清缓存）
      delete actionMapRef.current[actionId];
      syncedOperationLogIdsRef.current.delete(actionId);
      setActionMap((prevActionMap) =>
        produce(prevActionMap, (draft) => {
          delete draft[actionId];
        }),
      );
      // 只有当所有 action 都完成时才清理操作日志缓存，
      // 避免 action1 完成时清除缓存导致 action2 的日志数据丢失
      if (getObjectKeys(actionMapRef.current).length === 0) {
        apollo.cache.evict({
          id: "ROOT_QUERY",
          fieldName: "operationLogList",
        });
        apollo.cache.gc();
      }
    }
  });

  const addActionFn = usePersistFn(
    (
      actionId: string,
      name: string,
      total: number,
      successMessage?: string | React.ReactNode,
      silent?: boolean,
    ) => {
      // 添加 action
      const action: IActionResult = {
        name,
        total,
        current: 0,
        success: 0,
        suspended: 0,
        running: 0,
        fail: 0,
        exception: 0,
        createDate: Date.now(),
        messageDestroyed: false,
        silent,
        successMessage,
      };

      // 同步更新 ref，确保 WebSocket 消息到达时能立即找到
      // 注意：必须存储深拷贝，因为 immer 会冻结传入 produce 的对象，导致 ref 中的对象也变成只读
      actionMapRef.current[actionId] = { ...action };

      setActionMap((prevActionMap) =>
        produce(prevActionMap, (draft) => {
          draft[actionId] = action;
        }),
      );
      messageShow({ actionId, actionResult: action, actionState: "loading" });

      // 处理在 action 添加前就已经到达的 WebSocket 消息
      const pendingMessages = pendingMessagesRef.current.get(actionId);
      if (pendingMessages && pendingMessages.length > 0) {
        pendingMessages.forEach((msg) => {
          processActionResp(msg);
        });
        pendingMessagesRef.current.delete(actionId);
      }

      // 单独抽出去是为了避免闭包的影响
      setTimeout(() => timeoutCallback(actionId), 100);
      setTimeout(() => timeoutDestroyLoading(actionId), 3 * 1000);
    },
  );

  const graphqlErrorCallback = usePersistFn((actionId: string) => {
    // 检查 actionId 是否存在于 actionMap 中
    if (!actionMap[actionId]) {
      console.warn(`Action ${actionId} not found in actionMap`);
      return;
    }

    const newActionMap = produce(actionMap, (draft) => {
      if (draft[actionId]) {
        draft[actionId].fail = draft[actionId].total ?? 0;
      }
    });

    setActionMap((prevActionMap) =>
      produce(prevActionMap, (draft) => {
        if (draft[actionId] && newActionMap[actionId]) {
          draft[actionId].fail = newActionMap[actionId].fail;
        }
      }),
    );

    if (newActionMap[actionId]) {
      messageShow({
        actionState: "fail",
        actionId,
        actionResult: newActionMap[actionId],
      });
    }

    setTimeout(() => {
      messageDestroy(actionId);
    }, 3000);

    // 刷新action面板数据
    refreshTaskCount();
    // 更新ActionMap
    setActionMap((prevActionMap) =>
      produce(prevActionMap, (draft) => {
        delete draft[actionId];
      }),
    );
  });

  useMount(() => {
    if (isDev) {
      bus.addListener(
        "GraphQLError",
        (actionId: string, graphqlErrorMessage: string) => {
          graphqlErrorCallback(actionId);
          console.log(`[GraphQL error]: Message: ${graphqlErrorMessage}`);
        },
      );
    }
  });

  useUnmount(() => {
    if (isDev) {
      bus.removeListener("GraphQLError");
    }
  });

  useMount(() => {
    bus.addListener("addAction", addActionFn);
    message.config({
      getContainer: () => document.body,
      top: 64,
    });
  });

  useUnmount(() => {
    bus.removeListener("addAction");
    message.config({
      getContainer: () => document.body,
      top: 32,
    });
  });

  useEffect(() => {
    if (data && data.listenActionResp) {
      const respData = data.listenActionResp;
      const { actionId } = respData;

      // 使用 ref 检查 action 是否已注册，避免 state 异步更新导致的竞态问题
      if (!actionMapRef.current[actionId]) {
        // 检查是否是当前窗口发起的操作（通过检查是否有 pending 消息或者稍后会添加的 action）
        // 如果 actionId 不在 ref 中，可能是：
        // 1. 其他窗口的操作 - 直接处理
        // 2. 当前窗口的操作，但 WebSocket 消息比 addAction 先到达 - 需要缓存
        // 这里我们给一个短暂的缓冲时间，如果在这段时间内 action 被添加，则处理缓存的消息
        const existingPending = pendingMessagesRef.current.get(actionId) || [];
        existingPending.push(respData);
        pendingMessagesRef.current.set(actionId, existingPending);

        // 设置一个短暂的超时，如果 action 在这段时间内没有被添加，则认为是其他窗口的操作
        setTimeout(() => {
          const pendingMessages = pendingMessagesRef.current.get(actionId);
          if (
            pendingMessages &&
            pendingMessages.length > 0 &&
            !actionMapRef.current[actionId]
          ) {
            // action 仍未被添加，说明是其他窗口的操作，直接处理
            pendingMessagesRef.current.delete(actionId);
            // 没有ID就只更新下action面板数据,同步下进行中的任务
            refreshTaskCount();
            // 在断点续传的情况下，用户刷新页面后，仍旧可以触发刷新前上传任务的状态变更，需要推送
            pendingMessages.forEach((msg) => {
              actionRespSubject.next({
                data: msg,
                type: "progress",
                isCurrentWindow: false,
              });
              actionRespSubject.next({
                data: msg,
                type: "finish",
                isCurrentWindow: false,
              });
            });
          }
        }, 100); // 100ms 的缓冲时间，足够 React 完成状态更新
        return;
      }

      // action 已存在，直接处理
      processActionResp(respData);
    }
  }, [data, processActionResp]);

  if (OperationDetail.displayName === "ErrorFallbackComponent") {
    return (
      <Drawer open={visible} setOpen={setVisible}>
        <DrawerHeader onClose={() => setVisible(false)}>
          ErrorFallbackComponent
        </DrawerHeader>
        <DrawerBody>
          <OperationDetail />
        </DrawerBody>
      </Drawer>
    );
  }

  return (
    <OperationDetail
      actionId={currentActionId}
      visible={visible}
      setVisible={setVisible}
    />
  );
};
