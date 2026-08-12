import { gql, useLazyQuery } from "@apollo/client";
import type { IconTypes } from "@zstack/icon";
import { Link, State } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { LeftNavType, Op } from "@zstack/zsphere-types";
import type { Condition as ICondition } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useIntl } from "react-intl";

import AutoSkeleton from "../../components/auto-skeleton";
import { useDashboardStore } from "../../store/use-dashboard-store";
import useCheckCurrentLogin from "../useCheckCurrentLogin";

import style from "./style.module.less";

const QUERY_WIDGET_RESOURCE_STATE_COUNT = gql`
  query queryWidgetResourceStateCount(
    $conditions: [Condition!]
    $type: String!
    $hypervisorType: String
  ) {
    queryWidgetResourceStateCount(
      conditions: $conditions
      type: $type
      hypervisorType: $hypervisorType
    ) {
      total
      running
      stopped
      connected
      disconnected
      other
    }
  }
`;

interface IProps {
  [key: string]: any;
}

enum TitleEnum {
  vmInstance = "vmInstance",
  host = "host",
}

const StateMonitorWidget: React.FC<IProps> = React.memo(({ resource }) => {
  const intl = useIntl();
  const { isAccount } = useCheckCurrentLogin();
  const zoneUuid = useDashboardStore((state) => state.zoneUuid);
  const isFirstLoad = useRef(true);

  type ITitleMap = {
    [key in TitleEnum]: string;
  };
  const titleMap: ITitleMap = useMemo(() => {
    return {
      vmInstance: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
      host: intl.formatMessage({ id: "host", defaultMessage: "Host" }),
    };
  }, [intl]);
  const stateTypes = ["vmInstance"];
  const statusTypes = ["host"];

  // type 对应node端表名
  const type = resource;

  // 接口查询条件
  let conditions: ICondition[] = [];

  let zoneKey;
  let _resourceIcon: IconTypes;
  switch (resource) {
    case "host":
      zoneKey = "zone.uuid";
      _resourceIcon = "disk-2";
      conditions = conditions.concat([
        {
          key: "hypervisorType",
          op: Op.notIn,
          values: ["ESX", "baremetal2"],
        },
      ]);
      break;
    case "vmInstance":
      zoneKey = "zone.uuid";
      _resourceIcon = "monitor";
      // conditions already set, no modification needed
      break;
    default:
      zoneKey = "zoneUuid";
      _resourceIcon = "question-mark-circle-fill";
      break;
  }

  if (zoneUuid && !isAccount) {
    conditions.push({
      key: zoneKey,
      value: zoneUuid,
      op: Op.eq,
    });
  }

  const [getResourceStateData, { loading, data }] = useLazyQuery(
    QUERY_WIDGET_RESOURCE_STATE_COUNT,
    {
      fetchPolicy: "no-cache",
      onCompleted: () => {
        isFirstLoad.current = false;
      },
    },
  );

  // 使用 ref 存储函数引用，避免 useEffect 依赖不稳定
  const getResourceStateDataRef = useRef(getResourceStateData);
  getResourceStateDataRef.current = getResourceStateData;

  // 使用 useMemo 稳定 conditions 引用
  const stableConditions = useMemo(
    () => conditions,
    [zoneUuid, resource, isAccount],
  );

  const fetchData = useCallback(() => {
    getResourceStateDataRef.current({
      variables: {
        conditions: stableConditions,
        type,
      },
    });
  }, [stableConditions, type]);

  const resourceTypeMap: Record<string, string[]> = useMemo(
    () => ({
      vmInstance: ["VmInstance"],
      host: ["HostVO"],
    }),
    [],
  );

  useActionSubscribe({
    resourceTypeList: resourceTypeMap[resource] ?? [],
    onFinish: () => {
      fetchData();
    },
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const result = data?.queryWidgetResourceStateCount;

  // 使用 useMemo 缓存 linkProps 计算结果
  const linkProps = useMemo(() => {
    switch (resource) {
      case "host":
        return {
          to: `/zone/detail?uuid=${zoneUuid}&leftnav=${LeftNavType.ClusterHost}&toSubHostList=host`,
          microAppName: "virtualization-resource",
          auth: {
            authKey: "list",
            resource: "virtualization.host",
            type: "view",
          },
        };
      case "vmInstance":
        return {
          to: `/zone/detail?uuid=${zoneUuid}&leftnav=${LeftNavType.ClusterHost}&toSubVmList=vm`,
          microAppName: "virtualization-resource",
          auth: {
            authKey: "list",
            resource: "virtualization.vm",
            type: "view",
          },
        };
      default:
        return null;
    }
  }, [resource, zoneUuid]);

  // 保留原函数以兼容现有代码
  const renderLinkProps = useCallback(
    (_resourceType: string) => {
      return linkProps;
    },
    [linkProps],
  );

  return (
    <div className={style.container}>
      <AutoSkeleton
        name={`state-monitor-${resource}`}
        loading={isFirstLoad.current && loading}
      >
        <div className={style.title}>{titleMap[resource as TitleEnum]}</div>
        <div className={style.content}>
          <div className={style.left}>
            <span className={style.label}>
              <div className={style.linkCount}>
                {(result?.total ?? 0) > 0 ? (
                  <Link
                    to={`${renderLinkProps(resource)?.to}&dashboardState=''`}
                    microAppName={renderLinkProps(resource)?.microAppName}
                    auth={renderLinkProps(resource)?.auth}
                    isRouterManaged
                  >
                    {result?.total}
                  </Link>
                ) : (
                  <span>0</span>
                )}
              </div>
              <div className={style.name}>
                {intl.formatMessage({
                  id: "totalCount",
                  defaultMessage: "Total",
                })}
              </div>
            </span>
          </div>
          <div className={style.right}>
            {stateTypes.includes(resource) && (
              <>
                <div className={style["state-row"]}>
                  <State
                    type="success"
                    name={intl.formatMessage({
                      id: "running",
                      defaultMessage: "Running",
                    })}
                    icon="play-circle-fill"
                    prefix="icon"
                  />
                  <div className={style.linkCount}>
                    {(result?.running ?? 0) > 0 ? (
                      <Link
                        to={`${renderLinkProps(resource)?.to}&dashboardState=Running`}
                        microAppName={renderLinkProps(resource)?.microAppName}
                        auth={renderLinkProps(resource)?.auth}
                        isRouterManaged
                      >
                        {result?.running}
                      </Link>
                    ) : (
                      <span>0</span>
                    )}
                  </div>
                </div>
                <div className={style["state-row"]}>
                  <State
                    type="error"
                    name={intl.formatMessage({
                      id: "stopped",
                      defaultMessage: "Stopped",
                    })}
                    icon="stop-circle-fill"
                    prefix="icon"
                  />
                  <div className={style.linkCount}>
                    {(result?.stopped ?? 0) > 0 ? (
                      <Link
                        to={`${renderLinkProps(resource)?.to}&dashboardState=Stopped`}
                        microAppName={renderLinkProps(resource)?.microAppName}
                        auth={renderLinkProps(resource)?.auth}
                        isRouterManaged
                      >
                        {result?.stopped}
                      </Link>
                    ) : (
                      <span>0</span>
                    )}
                  </div>
                </div>
              </>
            )}

            {statusTypes.includes(resource) && (
              <>
                <div className={style["state-row"]}>
                  <State
                    type="success"
                    name={intl.formatMessage({
                      id: "connected",
                      defaultMessage: "Connected",
                    })}
                    prefix="dot"
                  />
                  <div className={style.linkCount}>
                    {(result?.connected ?? 0) > 0 ? (
                      <Link
                        to={`${renderLinkProps(resource)?.to}&dashboardState=Connected`}
                        microAppName={renderLinkProps(resource)?.microAppName}
                        auth={renderLinkProps(resource)?.auth}
                        isRouterManaged
                      >
                        {result?.connected}
                      </Link>
                    ) : (
                      <span>0</span>
                    )}
                  </div>
                </div>
                <div className={style["state-row"]}>
                  <State
                    type="error"
                    name={intl.formatMessage({
                      id: "disconnected",
                      defaultMessage: "Disconnected",
                    })}
                    prefix="dot"
                  />
                  <div className={style.linkCount}>
                    {(result?.disconnected ?? 0) > 0 ? (
                      <Link
                        to={`${renderLinkProps(resource)?.to}&dashboardState=Disconnected`}
                        microAppName={renderLinkProps(resource)?.microAppName}
                        auth={renderLinkProps(resource)?.auth}
                        isRouterManaged
                      >
                        {result?.disconnected}
                      </Link>
                    ) : (
                      <span>0</span>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className={style["state-row"]}>
              <State
                type="disabled"
                name={intl.formatMessage({
                  id: "other",
                  defaultMessage: "Other",
                })}
                icon={
                  ["vmInstance"].includes(resource)
                    ? "question-mark-circle-fill"
                    : undefined
                }
                prefix={["vmInstance"].includes(resource) ? "icon" : "dot"}
              />
              <div className={style.linkCount}>
                {(result?.other ?? 0) > 0 ? (
                  <Link
                    to={`${renderLinkProps(resource)?.to}&dashboardState=other`}
                    microAppName={renderLinkProps(resource)?.microAppName}
                    auth={renderLinkProps(resource)?.auth}
                    isRouterManaged
                  >
                    {result?.other}
                  </Link>
                ) : (
                  <span>0</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </AutoSkeleton>
    </div>
  );
});

export default StateMonitorWidget;
