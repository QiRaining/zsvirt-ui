import type { ApolloError } from "@apollo/client";
import { gql, useLazyQuery, useSubscription } from "@apollo/client";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Progress } from "@zstack/zsphere-components";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  ActionTaskResult,
  QueryOperationLogResp,
} from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
//import OpreationDetail from '@zstack/virtualization-monitoring-om/src/pages/operation-log/operation-detail'
import {
  useInterval,
  useMount,
  usePersistFn,
  useUnmount,
  useUpdateEffect,
} from "ahooks";
import { message } from "antd";
import { produce } from "immer";
import { keys as _keys, isEqual } from "lodash-es";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import apollo from "zsv-core-shell/src/utils/apollo";

import style from "zsv-core-shell/src/layouts/footer/style.module.less";

const LISTEN_ACTION_RESP = gql`
  subscription listenActionResp($sessionId: String!) {
    listenActionResp(sessionId: $sessionId) {
      actionId
      state
      type
      id
      fields
      inventory
      error
    }
  }
`;

const OPERATION_LOG_LIST = gql`
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
      list {
        actionId
        progress
        longjobs {
          progress
        }
      }
    }
  }
`;

const Bar = Progress.Bar;
const isDev = process.env.NODE_ENV === "development";

interface IActionMap {
  [key: string]: IActionResult;
}

interface IMessageShow {
  actionState: "loading" | "success" | "fail" | "exception";
  actionResult: IActionResult;
  actionId: string;
}

export const VNCAction = () => {
  const intl = useIntl();
  const [actionMap, setActionMap] = useState<IActionMap>({});
  const [intervalTime, setIntervalTime] = useState<number>();
  const [logList, setLoglist] = useState<{
    operationLogList: QueryOperationLogResp;
  }>();
  const actionRespSubject = window.g_action_subscribe;

  const { data } = useSubscription<{ listenActionResp: ActionTaskResult }>(
    LISTEN_ACTION_RESP,
    {
      variables: { sessionId: localStorage.getItem("sessionId") },
    },
  );
  const [queryLog] = useLazyQuery<
    { operationLogList: QueryOperationLogResp },
    IQuery
  >(OPERATION_LOG_LIST, {
    onCompleted(data) {
      if (data) {
        setLoglist(data);
        try {
          apollo.writeQuery({
            query: OPERATION_LOG_LIST,
            data,
          });
        } catch (__e) {
          console.log("******fecth", e);
        }
      }
    },
  });

  useInterval(
    usePersistFn(() => {
      const newActionIds = _keys(actionMap);
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

  const actionIdsRef = useRef<string[]>(_keys(actionMap));

  // const refreshTaskCount = () => {
  //   //refetch()
  // }

  useUpdateEffect(() => {
    const newActionIds = _keys(actionMap);
    const equal = isEqual(actionIdsRef.current, newActionIds);
    // const _query = refetch || queryLog
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
        setIntervalTime(undefined);
        actionIdsRef.current = newActionIds;
        setTimeout(() => {
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
        }, 800);
      }
    } else {
      setIntervalTime(undefined);
    }
  }, [actionMap, queryLog, logList]);

  const getProgress = usePersistFn(
    ({
      total,
      current,
      key,
    }: {
      total: number;
      current: number;
      key: string;
    }) => {
      if (total === current) {
        return 100;
      }
      const { list = [] } = logList?.operationLogList ?? {};
      const log = list.find((cv) => cv.actionId === key);
      if (!log) {
        return 0;
      }

      return log?.longjobs?.[0]
        ? (log?.longjobs?.[0]?.progress ?? 0)
        : (log?.progress ?? 0);
    },
  );

  const getActionState = usePersistFn((action: IActionResult) => {
    const { success, fail, total } = action;
    let actionState: IMessageShow["actionState"] = "loading";
    if (success === total) {
      actionState = "success";
    }
    if (fail === total) {
      actionState = "fail";
    }
    if (fail && success) {
      actionState = "exception";
    }
    return actionState;
  });

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
              id: "action.running.count",
              defaultMessage: "Onging {current}/{total}",
            },
            { current, total },
          );
        }
        return intl.formatMessage({
          id: "action.running",
          defaultMessage: "Ongoing",
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
      const actionState = getActionState(action);
      return (
        <div
          onClick={() => {
            messageDestroy(key);
          }}
        >
          <div className={style.messageContainer} data-testid="actionPanel">
            <div className={style.textContainer}>
              <Text>{`${action.name}${intl.locale === "zh-CN" ? "" : " "}${getInfo()}`}</Text>
              {actionState === "loading" && (
                <Bar
                  style={{ width: "200px", marginTop: "2px" }}
                  size="small"
                  mode="dark"
                  colorful={false}
                  percent={getProgress({
                    total,
                    current,
                    key,
                  })}
                  needDecimal={false}
                  format={false}
                />
              )}
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
        getContainer: () =>
          document.getElementById("main-nav-right") as HTMLElement,
        style: {
          textAlign: "right",
          marginRight: "18px",
        },
      };
      if (actionState === "success") {
        message.success(
          Object.assign({}, config, {
            className: `${style.messageBox} ${style.success}`,
            icon: (
              <Icon
                type="checkmark-circle-fill"
                color="positive"
                key={actionState}
              />
            ),
          }),
        );
      }
      if (actionState === "fail") {
        message.error(
          Object.assign({}, config, {
            className: `${style.messageBox} ${style.fail}`,
            icon: (
              <Icon type="close-circle-fill" color="danger" key={actionState} />
            ),
          }),
        );
      }
      if (actionState === "exception") {
        message.warning(
          Object.assign({}, config, {
            className: `${style.messageBox} ${style.exception}`,
            icon: (
              <Icon
                type="alert-triangle-fill"
                color="alert"
                key={actionState}
              />
            ),
          }),
        );
      }
      if (actionState === "loading") {
        message.loading(
          Object.assign({}, config, {
            className: `${style.messageBox} ${style.loading}`,
            icon: <Icon type="loader" key={actionState} />,
          }),
        );
      }
    },
  );

  // 关闭通知
  const messageDestroy = usePersistFn((actionId: string) => {
    message.destroy(actionId);
    setActionMap((prevActionMap) =>
      produce(prevActionMap, (draft: IActionMap) => {
        if (draft[actionId]) {
          draft[actionId].messageDestroyed = true;
        }
      }),
    );
  });

  // const timeoutCallback = usePersistFn((actionId: string) => {
  //   if (actionMap[actionId]) refreshTaskCount()
  // })

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
      setActionMap((prevActionMap) =>
        produce(prevActionMap, (draft: IActionMap) => {
          draft[actionId] = action;
        }),
      );
      messageShow({ actionId, actionResult: action, actionState: "loading" });
      // 单独抽出去是为了避免闭包的影响
      // setTimeout(() => timeoutCallback(actionId), 0)
    },
  );

  const graphqlErrorCallback = usePersistFn((actionId: string) => {
    const newActionMap = produce(actionMap, (draft: IActionMap) => {
      draft[actionId].fail = draft[actionId].total;
    });

    setActionMap((prevActionMap) =>
      produce(prevActionMap, (draft: IActionMap) => {
        draft[actionId].fail = newActionMap[actionId].fail;
      }),
    );

    messageShow({
      actionState: "fail",
      actionId,
      actionResult: newActionMap[actionId],
      // actionResult: {
      //   ...newActionMap[actionId],
      //   message: 'graphql error'
      // }
    });

    setTimeout(() => {
      messageDestroy(actionId);
    }, 3000);

    // 刷新action面板数据
    //refreshTaskCount()
    // 更新ActionMap
    setActionMap((prevActionMap) =>
      produce(prevActionMap, (draft: IActionMap) => {
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

  useMount(() => {
    bus.addListener("addAction", addActionFn);
    message.config({
      getContainer: () => document.getElementById("app-root") as HTMLElement,
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
      const { actionId, state, type, id, fields, inventory, error } =
        data.listenActionResp;

      //更新缓存
      if (inventory && fields) {
        try {
          // 更新 cache
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
            broadcast: false, // 只更新需要修改的字段,其余字段不通过fetchPolicy更新
          });
        } catch (__e) {
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

      // 防止多开网页操作报错
      // 后面看需求,可能把bus和subscribe也触发一下以便同步数据
      if (!actionMap[actionId]) {
        // 没有ID就只更新下action面板数据,同步下进行中的任务
        //refreshTaskCount()
        //在断点续传的情况下，用户刷新页面后，仍旧可以触发刷新前上传任务的状态变更，需要推送
        actionRespSubject.next({
          data: data.listenActionResp,
          type: "progress",
          isCurrentWindow: false,
        });
        actionRespSubject.next({
          data: data.listenActionResp,
          type: "finish",
          isCurrentWindow: false,
        });
        return;
      }

      const newActionMap = produce(actionMap, (draft: IActionMap) => {
        draft[actionId][state] += 1;
        draft[actionId].current += 1;
      });
      setActionMap((prevActionMap) =>
        produce(prevActionMap, (draft: IActionMap) => {
          draft[actionId][state] += 1;
          draft[actionId].current += 1;
        }),
      );

      const taskResult: ITaskResult = {
        id,
        current: newActionMap[actionId].current,
        inventory: JSON.parse(inventory as string),
        error: JSON.parse(error as string),
      };

      //#region action子任务完成
      bus.emit(`action:progress:${actionId}`, taskResult);
      // 广播
      actionRespSubject.next({
        data: data.listenActionResp,
        type: "progress",
      });
      //#endregion

      //#region  所有任务完成
      if (newActionMap[actionId].current === newActionMap[actionId].total) {
        if (newActionMap[actionId].success === newActionMap[actionId].total) {
          // 全部成功
          messageShow({
            actionState: "success",
            actionId,
            actionResult: newActionMap[actionId],
          });
        } else if (
          newActionMap[actionId].fail === newActionMap[actionId].total
        ) {
          // 全部失败
          messageShow({
            actionState: "fail",
            actionId,
            actionResult: newActionMap[actionId],
          });
        } else if (
          newActionMap[actionId].fail &&
          newActionMap[actionId].success
        ) {
          // 部分成功
          messageShow({
            actionState: "exception",
            actionId,
            actionResult: newActionMap[actionId],
          });
        }
        // 添加计时器,操作结束后确保弹窗一定关闭
        setTimeout(() => {
          messageDestroy(actionId);
        }, 4 * 1000);

        let inventoryParse;

        try {
          inventoryParse = JSON.parse(inventory!);
        } catch (__e) {
          // ignore error
        }
        // action 全部完成
        bus.emit(`action:finish:${actionId}`, {
          ...newActionMap[actionId],
          inventory: inventoryParse,
        });
        actionRespSubject.next({
          data: data.listenActionResp,
          type: "finish",
        });
        // 刷新action面板数据
        //  refreshTaskCount()
        // 更新ActionMap
        setActionMap((prevActionMap) =>
          produce(prevActionMap, (draft: IActionMap) => {
            delete draft[actionId];
          }),
        );
        //#endregion
        // } else {
        // 部分任务完成
        // messageShow({
        //   actionState: 'loading',
        //   actionId,
        //   actionResult: newActionMap[actionId]
        // })
      }
    }
  }, [data]);

  useUpdateEffect(() => {
    const timer = setInterval(() => {
      const actionIds = _keys(actionMap);
      if (!actionIds.length) {
        clearInterval(timer);
      }
      actionIds.forEach((actionId) => {
        const actionState = getActionState(actionMap[actionId]);
        if (actionState !== "loading" || actionMap[actionId].messageDestroyed) {
          clearInterval(timer);
          return;
        }
        messageShow({
          actionId,
          actionResult: actionMap[actionId],
          actionState,
        });
      });
    }, 500);
    return () => clearInterval(timer);
  }, [actionMap, getActionState, messageShow]);
  return <></>;
  //return <OpreationDetail actionId={currentActionId} visible={visible} setVisible={setVisible} />
};
