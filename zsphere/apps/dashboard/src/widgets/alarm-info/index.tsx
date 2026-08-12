import { gql, useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useCommandInfo, Link } from "@zstack/zsphere-components";
import { getMenuList } from "@zstack/zsphere-config";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { EmergencyLevel, Op, VmInstanceState } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import cls from "classnames";
import React, { useMemo, useCallback } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import AutoSkeleton from "../../components/auto-skeleton";
import Empty from "../../components/empty";

import style from "./style.module.less";

const QUERY_WIDGET_ALARM_INFO = gql`
  query queryWidgetAlarmInfo($conditions: [Condition!]) {
    queryWidgetAlarmInfo(conditions: $conditions) {
      emergentCount
      importantCount
      normalCount
      top5ResourceList {
        uuid
        namespace
        resourceInfo {
          resourceName
          state
        }
        emergent
        important
      }
    }
  }
`;

export interface IProps {
  isEditable?: boolean;
}

const AlarmInfo: React.FC<IProps> = React.memo(({ isEditable }) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const [iconMap, namespaceMap] = useMemo(() => {
    const menuList = getMenuList();
    const menuMap = new Map();
    const resIconMap = new Map();
    const resNamespaceMap = new Map();
    menuList.forEach((item: any) => {
      menuMap.set(item.key, item);
      if (item.namespace) {
        resNamespaceMap.set(item.namespace, item);
      }
    });
    Array.from(resNamespaceMap.entries()).forEach(([namespace, item]) => {
      let current = item;
      while (current) {
        if (current.iconKey) {
          resIconMap.set(namespace, current.iconKey);
          return;
        }
        current = current.parentKey ? menuMap.get(current.parentKey) : null;
      }
    });
    return [resIconMap, resNamespaceMap];
  }, []);

  const getIconType = useCallback(
    (namespace: string) => {
      return iconMap.get(namespace) ?? "";
    },
    [iconMap],
  );

  const getResourcePath = useCallback(
    (item: any) => {
      if (
        !item.resourceInfo ||
        item.resourceInfo.state === VmInstanceState.Destroyed
      ) {
        return null;
      }
      return namespaceMap.get(item.namespace)?.path;
    },
    [namespaceMap],
  );

  const handleResourceNavigate = useCallback(
    (uuid: string, path?: string | null) => () => {
      if (!path) {
        return;
      }
      const targetPath = path.includes("?")
        ? path.replace("?", `/detail?uuid=${uuid}&`)
        : `${path}/detail?uuid=${uuid}`;

      navigate(targetPath);
    },
    [navigate],
  );

  const [_queryWidgetAlarmInfo, { loading, data, refetch: refetchCount }] =
    useLazyQuery(QUERY_WIDGET_ALARM_INFO, {
      fetchPolicy: "no-cache",
    });
  const {
    emergentCount = 0,
    importantCount = 0,
    normalCount = 0,
  } = data?.queryWidgetAlarmInfo ?? {};

  useMount(() => {
    _queryWidgetAlarmInfo({
      variables: {
        conditions: [
          {
            key: "readStatus",
            op: Op.eq,
            value: "false",
          },
        ],
      },
    });
  });

  const top5ResourceList = data?.queryWidgetAlarmInfo?.top5ResourceList;

  const refetchFn = useCallback(() => {
    refetchCount?.();
  }, [refetchCount]);

  useActionSubscribe({
    resourceTypeList: ["AlarmHistories"],
    onFinish: () => {
      refetchFn();
    },
  });

  const commandInfo = useCommandInfo("view.alarm.message");

  return (
    <div className={style.container}>
      <AutoSkeleton name="alarm-info" loading={loading}>
        <div className={style.header}>
          <div className={style.title}>
            {intl.formatMessage({
              id: "dashboard.realtime.alarm.statistics.last.7.days",
              defaultMessage: "Triggered Alarms in Recent 1 Week",
            })}
          </div>
          {!isEditable && (
            <Tooltip
              title={
                intl.formatMessage({
                  id: "read.more",
                  defaultMessage: "More",
                }) + (commandInfo ? ` (${commandInfo.keyLabel})` : "")
              }
            >
              <div className={style["jump-icon"]}>
                <Link
                  to="/alarm-message"
                  microAppName="virtualization-monitoring-om"
                  isRouterManaged
                >
                  <Icon type="arrow-right" />
                </Link>
              </div>
            </Tooltip>
          )}
        </div>
        <div className={style.board}>
          <Link
            to={`/alarm-message?emergencyLevel=${EmergencyLevel.Emergent}`}
            microAppName="virtualization-monitoring-om"
            isRouterManaged
          >
            <div className={style.boardItem}>
              <div className={style.emergent}>
                <Text>{emergentCount}</Text>
              </div>
              <div className={style.boardLabel}>
                {intl.formatMessage({
                  id: "emergencyLevel.emergent",
                  defaultMessage: "Emergent",
                })}
              </div>
            </div>
          </Link>
          {/* <div className={style.dot} /> */}
          <Link
            to={`/alarm-message?emergencyLevel=${EmergencyLevel.Important}`}
            microAppName="virtualization-monitoring-om"
            isRouterManaged
          >
            <div className={style.boardItem}>
              <div className={style.important}>
                <Text>{importantCount}</Text>
              </div>
              <div className={style.boardLabel}>
                {intl.formatMessage({
                  id: "emergencyLevel.import",
                  defaultMessage: "Major",
                })}
              </div>
            </div>
          </Link>
          {/* <div className={style.dot} /> */}
          <Link
            to={`/alarm-message?emergencyLevel=${EmergencyLevel.Normal}`}
            microAppName="virtualization-monitoring-om"
            isRouterManaged
          >
            <div className={style.boardItem}>
              <div className={style.normal}>
                <Text>{normalCount}</Text>
              </div>
              <div className={style.boardLabel}>
                {intl.formatMessage({
                  id: "emergencyLevel.normal",
                  defaultMessage: "Info",
                })}
              </div>
            </div>
          </Link>
        </div>
        {/* <Divider className={style.divider} /> */}
        <div className={style.alarmTopFiveTitleWrapper}>
          <span className={style.alarmTopFiveTitle}>
            {intl.formatMessage({
              id: "dashboard.alarm.resource.top.5.title",
              defaultMessage: "Top 5 Alarm Resources",
            })}
          </span>
          <Tooltip
            title={intl.formatMessage({
              id: "dashboard.alarm.resource.top.5.tooltip",
              defaultMessage:
                "Only resource's alarms are counted. Alarms related to system data directories, management nodes, and licenses are excluded from this statistic.",
            })}
          >
            <span>
              <Icon className="info-icon" type="info" />
            </span>
          </Tooltip>
        </div>
        <div className={style.alarmTopFiveList}>
          <span className={style.alarmTopFiveHeader}>
            {intl.formatMessage({
              id: "alarm.message.resource",
              defaultMessage: "Resource",
            })}
          </span>
          <span className={style.alarmTopFiveHeader}>
            <div className={style.emergentIcon}>
              <Icon type="alert-triangle-fill" />
            </div>
            {intl.formatMessage({
              id: "emergencyLevel.emergent",
              defaultMessage: "Emergent",
            })}
          </span>
          <span className={style.alarmTopFiveHeader}>
            <div className={style.importantIcon}>
              <Icon type="alert-triangle-fill" />
            </div>
            {intl.formatMessage({
              id: "emergencyLevel.important",
              defaultMessage: "Major",
            })}
          </span>
          {top5ResourceList?.length ? (
            top5ResourceList.map((item: any) => {
              const path = getResourcePath(item);
              return (
                <React.Fragment key={item.uuid}>
                  <div
                    className={cls(style.resourceNameWrapper, {
                      [style.resourceLink]: !!path,
                    })}
                    onClick={handleResourceNavigate(item.uuid, path)}
                  >
                    <div className={style.resourceNameIcon}>
                      <Icon type={getIconType(item.namespace)} />
                    </div>
                    <div className={style.resourceName}>
                      <Text>
                        {item.resourceInfo?.resourceName || item.uuid}
                      </Text>
                    </div>
                  </div>
                  <span className={style.alarmTopFiveCount}>
                    {item.emergent ?? 0}
                  </span>
                  <span className={style.alarmTopFiveCount}>
                    {item.important ?? 0}
                  </span>
                </React.Fragment>
              );
            })
          ) : (
            <div className={style.alarmTopFiveListEmpty}>
              <Empty />
            </div>
          )}
        </div>
      </AutoSkeleton>
    </div>
  );
});

export default AlarmInfo;
