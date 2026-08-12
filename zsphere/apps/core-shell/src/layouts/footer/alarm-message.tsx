import { gql, useLazyQuery, useQuery, useSubscription } from "@apollo/client";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import type { ITableListController } from "@zstack/zsphere-components";
import {
  Constant,
  State,
  useBuildTriggerActionName,
} from "@zstack/zsphere-components";
import { ConstantEnum } from "@zstack/zsphere-constant";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { EmergencyLevel } from "@zstack/zsphere-types";
import type { AlarmSummary } from "@zstack/zsphere-types/graphql";
import { usePersistFn, useUpdateEffect } from "ahooks";
import { Popover, notification } from "antd";
import cs from "classnames";
import { debounce } from "lodash-es";
import React, { useEffect, useState, useMemo, memo } from "react";
import { useIntl } from "react-intl";
import DetailModal from "zsv_shared/alarm-message/detail-modal";

import { getAlarmSummary } from "../../gql/footer.gql";
import { listenZWatch } from "../../gql/message.gql";
import { redirect } from "../../utils/apollo";
import {
  type AlarmFilterType,
  createAlarmFilterParams,
} from "./alarm-message-popover";
import { shouldRefreshHaVmState } from "./ha-progress-vm-state";
import type { AlarmResult, EventResult } from "./types";
import { transferMessageKey } from "./utils";

import styles from "./style.module.less";

const levelToColor = new Map<EmergencyLevel, "danger" | "alert" | "info">([
  [EmergencyLevel.Emergent, "danger"],
  [EmergencyLevel.Important, "alert"],
  [EmergencyLevel.Normal, "info"],
]);

const _gql = gql`
  query vmInstance($uuid: String!) {
    vmInstance(uuid: $uuid) {
      uuid
      type
      state
    }
  }
`;
export interface ZwatchResult {
  sessionId: string;
  payload: string;
}

export interface HAResult {
  haProgress: {
    taskResult: string;
    [prop: string]: any;
  };
}

const AlarmNotification = memo(() => {
  const intl = useIntl();

  const [detailVisible, setDetailVisible] = useState(false);
  const [dataUuid, setDataUuid] = useState("");

  const buildAlarmName = useBuildTriggerActionName();

  const { data } = useSubscription<{ listenZWatch: ZwatchResult }>(
    listenZWatch,
    {
      variables: { sessionId: localStorage.getItem("sessionId") },
    },
  );

  const handledHaVmStateRefreshEventsRef = React.useRef(new Set<string>());

  const [getVMState] = useLazyQuery<{
    vmInstance: { uuid: string; state: string; type: string };
  }>(_gql, {
    fetchPolicy: "network-only",
    onCompleted(_data) {
      if (_data?.vmInstance) {
        const actionRespSubject = window.g_action_subscribe;
        actionRespSubject.next({
          data: { type: "VmInstance", uuid: _data.vmInstance.uuid },
          type: "progress",
        });
      }
    },
  });

  const getVMStateDebounced = useMemo(
    () =>
      debounce((uuid: string) => {
        getVMState({ variables: { uuid } });
      }, 1000),
    [getVMState],
  );

  useEffect(() => {
    return () => {
      getVMStateDebounced.cancel();
    };
  }, [getVMStateDebounced]);

  useEffect(() => {
    const { shouldRefresh, resourceUuid } = shouldRefreshHaVmState({
      handledEventKeys: handledHaVmStateRefreshEventsRef.current,
      payload: data?.listenZWatch?.payload,
    });

    if (shouldRefresh && resourceUuid) {
      getVMStateDebounced(resourceUuid);
    }
  }, [data, getVMStateDebounced]);

  const messageDetail = useMemo(() => {
    if (data?.listenZWatch) {
      const result: EventResult | AlarmResult | HAResult = JSON.parse(
        data.listenZWatch.payload,
      );
      if ((result as HAResult).haProgress) {
        return null;
      }
      if ((result as EventResult).name === "SessionForceLogout") {
        redirect(true);
        return null;
      }
      const transferResult = transferMessageKey(
        result as EventResult | AlarmResult,
      );
      // 需要手动转换一下以便翻译。
      if (
        ["ZStack/KVMHost", "ZStack/XDragonHost"].includes(
          transferResult.namespace,
        )
      ) {
        transferResult.namespace = "ZStack/Host";
      }
      return transferResult;
    }
    return null;
  }, [data]);

  const onClickName = usePersistFn((msgDataUuid: string) => {
    setDataUuid(msgDataUuid);
    setDetailVisible(true);
    notification.close(msgDataUuid);
  });

  const buildName = usePersistFn((val) => {
    return buildAlarmName(val);
  });

  // 报警消息推送弹窗
  useUpdateEffect(() => {
    if (messageDetail) {
      notification.info({
        key: messageDetail.dataUuid,
        closeIcon: <Icon type="close" />,

        message: (
          <div
            onClick={() => onClickName(messageDetail.dataUuid)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.alarmTitle}>
              {buildName(messageDetail as any)}
            </div>
            {messageDetail?.resourceName && (
              <Text className={styles.alarmResourceText}>{`${intl.formatMessage(
                {
                  id: "dataSource",
                  defaultMessage: "Data Source",
                },
              )}: ${
                messageDetail?.resourceName === "ZCE-X-from-ZCE-X"
                  ? intl.formatMessage({
                      id: "storageAlarmMessage",
                      defaultMessage: "Storage Alarms",
                    })
                  : messageDetail?.resourceName
              }`}</Text>
            )}
          </div>
        ),
        className: cs(styles.zwatchAlarm, styles[messageDetail.emergencyLevel]),
        icon: (
          <Icon
            type="alert-triangle-fill"
            color={levelToColor.get(
              messageDetail?.emergencyLevel as EmergencyLevel,
            )}
            colorNumber={500}
          />
        ),
        //   嵌入布局里面，notification的横幅是dom的创建和销毁，会造成页面回流而导致闪烁。
        // getContainer: () => document.getElementById('main-nav-right') as HTMLElement,
        top: 72, // 24 + 48
        // duration: 0
      });
    }
  }, [messageDetail]);

  if (DetailModal.displayName === "ErrorFallbackComponent") {
    return null;
  }

  return (
    <DetailModal
      visible={detailVisible}
      setVisible={setDetailVisible}
      dataUuid={dataUuid}
    />
  );
});

AlarmNotification.displayName = "AlarmNotification";

const Tag: React.FC<
  React.PropsWithChildren<{ color?: string; className?: string }>
> = memo(({ color, children, className }) => {
  return (
    <span
      style={{ backgroundColor: color }}
      className={cs(styles.tag, className)}
    >
      {children}
    </span>
  );
});

Tag.displayName = "Tag";

export interface IAlarmMessageTabProps {
  title?: string;
  gql?: any;
  resourceType?: string;
  listController?: React.MutableRefObject<ITableListController | undefined>;
  filterKey?: string;
  defaultQuery?: any;
}

const AlarmMessageTab: React.FC<IAlarmMessageTabProps> = memo(
  ({
    title,
    gql = getAlarmSummary,
    defaultQuery,
    resourceType = "AlarmHistories",
    filterKey,
    listController,
  }) => {
    const intl = useIntl();
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    const { data, refetch } = useQuery<{ [key: string]: AlarmSummary }>(gql, {
      variables: defaultQuery,
      fetchPolicy: "no-cache",
    });
    const summary = useMemo(() => {
      const field =
        gql.definitions?.[0]?.selectionSet?.selections?.[0]?.name?.value ?? "";
      return data?.[field];
    }, [data, gql]);

    useActionSubscribe({
      resourceTypeList: [resourceType],
      onFinish: () => {
        refetch?.();
      },
    });

    const { data: dataSub } = useSubscription<{ listenZWatch: ZwatchResult }>(
      listenZWatch,
      {
        variables: { sessionId: localStorage.getItem("sessionId") },
      },
    );

    React.useEffect(() => {
      if (dataSub && dataSub.listenZWatch) {
        refetch?.();
      }
    }, [dataSub, refetch]);

    const filterList = React.useMemo(() => {
      if (!listController) {
        return null;
      }
      return (
        <ul className={styles.filterList}>
          <FilterItem
            filterKey={filterKey}
            type="All"
            listController={listController}
            onSelect={() => setPopoverOpen(false)}
          />
          <FilterItem
            filterKey={filterKey}
            type="Emergent"
            data={summary}
            listController={listController}
            onSelect={() => setPopoverOpen(false)}
          />
          <FilterItem
            filterKey={filterKey}
            type="Important"
            data={summary}
            listController={listController}
            onSelect={() => setPopoverOpen(false)}
          />
          <FilterItem
            filterKey={filterKey}
            type="Normal"
            data={summary}
            listController={listController}
            onSelect={() => setPopoverOpen(false)}
          />
        </ul>
      );
    }, [summary, listController, filterKey]);

    const TagList = React.useMemo(() => {
      const { emergent, important, normal } = summary || {};
      return [
        emergent && (
          <Tag color="#F4454C" className={styles.tagList} key="emergent">
            {emergent}
          </Tag>
        ),
        important && (
          <Tag color="#FF9000" className={styles.tagList} key="important">
            {important}
          </Tag>
        ),
        normal && (
          <Tag color="#0076F7" className={styles.tagList} key="normal">
            {normal}
          </Tag>
        ),
      ].filter(Boolean);
    }, [summary]);

    const content = (
      <div
        className={`flex items-center gap-[0px] ${styles.alarmPopoverTrigger}`}
      >
        <span style={{ marginRight: TagList ? 4 : 0 }}>
          {title ||
            intl.formatMessage({
              id: "platform.realtime.alarm.message",
              defaultMessage: "Platform Alarms",
            })}
        </span>
        {TagList}
      </div>
    );

    if (!filterList) {
      return content;
    }

    return (
      <Popover
        placement="topLeft"
        overlayClassName={styles.alarmPopover}
        getPopupContainer={(triggerNode) => triggerNode}
        autoAdjustOverflow={false}
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        content={filterList}
      >
        {content}
      </Popover>
    );
  },
);

AlarmMessageTab.displayName = "AlarmMessageTab";

const AlarmMessageContent: React.FC<{
  children: React.ReactElement;
  resourceType?: string;
}> = memo(({ resourceType = "AlarmHistories", children }) => {
  const [key, setKey] = React.useState(0);
  useActionSubscribe({
    resourceTypeList: [resourceType],
    onFinish: (_: any, isLayoutList?: boolean) => {
      if (!isLayoutList) {
        setKey?.((pre) => pre + 1);
      }
    },
  });

  const { data } = useSubscription<{ listenZWatch: ZwatchResult }>(
    listenZWatch,
    {
      variables: { sessionId: localStorage.getItem("sessionId") },
    },
  );

  useEffect(() => {
    if (data && data.listenZWatch) {
      setKey((pre) => pre + 1);
    }
  }, [data]);

  return React.cloneElement(children, { key });
});

AlarmMessageContent.displayName = "AlarmMessageContent";

export { AlarmMessageContent, AlarmMessageTab, AlarmNotification };

interface IFilterItem {
  listController: React.MutableRefObject<ITableListController | undefined>;
  type: AlarmFilterType;
  data?: AlarmSummary;
  filterKey?: string;
  onSelect?: () => void;
}

const dataKeyMap = {
  Emergent: "emergent",
  Important: "important",
  Normal: "normal",
} as const;

const FilterItem = memo(function FilterItem({
  listController,
  type,
  data,
  filterKey = "emergencyLevel",
  onSelect,
}: IFilterItem) {
  const intl = useIntl();
  return (
    <li
      className={styles.filterListItem}
      onClick={() => {
        listController.current?.filter(
          createAlarmFilterParams(type, filterKey),
        );
        onSelect?.();
      }}
    >
      {type === "All" ? (
        <State
          prefix="icon"
          icon="grid-fill"
          color={{ color: "neutral", number: 600 }}
          name={intl.formatMessage({ id: "all", defaultMessage: "All" })}
        />
      ) : (
        <Constant value={ConstantEnum[type]} />
      )}
      {type !== "All" && (data?.[dataKeyMap[type]] ?? 0)}
    </li>
  );
});
