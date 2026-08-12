import { gql, useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Link, Progress } from "@zstack/zsphere-components";
import type { LeftNavType } from "@zstack/zsphere-types";
import type { L3Network } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import { find as _find } from "lodash-es";
import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useInView } from "react-intersection-observer";

import AutoSkeleton from "../../components/auto-skeleton";
import Empty from "../../components/empty";
import { useDashboardStore } from "../../store/use-dashboard-store";
import { formatUnit, getPercentageColor } from "../../utils";
import type { IMetricConfig } from "./metric-config";
import useMetricConfig from "./metric-config";

import style from "./style.module.less";

const queryWidgetMonitorTop = gql`
  query queryWidgetMonitorTop(
    $namespace: String!
    $metricName: String!
    $limit: Int!
    $zoneUuid: String
  ) {
    queryWidgetMonitorTop(
      namespace: $namespace
      metricName: $metricName
      limit: $limit
      zoneUuid: $zoneUuid
    ) {
      list {
        uuid
        name
        value
      }
      valueMax
    }
  }
`;

const queryWidgetMonitorL3NetworkTop = gql`
  query queryWidgetMonitorL3NetworkTop(
    $namespace: String!
    $metricName: String!
    $limit: Int!
    $zoneUuid: String
  ) {
    queryWidgetMonitorL3NetworkTop(
      namespace: $namespace
      metricName: $metricName
      limit: $limit
      zoneUuid: $zoneUuid
    ) {
      list {
        uuid
        name
        value
        l3Network {
          uuid
          networkType
        }
      }
      valueMax
    }
  }
`;

interface ITopMonitorBarProps {
  uuid: string;
  name: string;
  value: string;
  unit: string;
  valueMax: number;
  colorInverse: boolean;
  microAppName: string;
  prefixPath: string;
  iconType: IconTypes;
  l3Network?: L3Network;
  metricName?: string;
  leftNav?: LeftNavType;
  auth?: {
    resource: string;
    type: string;
    authKey: string;
  };
}
const TopMonitorBar: React.FC<ITopMonitorBarProps> = React.memo(
  ({
    uuid,
    name,
    value,
    unit,
    valueMax,
    colorInverse,
    microAppName,
    prefixPath,
    iconType,
    metricName,
    _leftNav,
    auth,
  }) => {
    const formattedValue = formatUnit(unit, +value, valueMax);

    const isProgressReverse = metricName?.toLowerCase()?.includes("available");

    // 稳定化 style 对象
    const valueStyle = useMemo(
      () => ({
        color: getPercentageColor(
          formattedValue[0],
          unit !== "percentage",
          colorInverse,
          true,
        ),
      }),
      [formattedValue, unit, colorInverse],
    );

    return (
      <>
        <div className={style.topMonitorBarContainer} key={uuid}>
          <div className={style.icon}>
            <Icon type={iconType} />
          </div>
          <div className={style.name}>
            <Link
              microAppName={microAppName}
              to={`${prefixPath}${uuid}`}
              auth={auth}
              isRouterManaged
            >
              <Text>{`${name}`}</Text>
            </Link>
          </div>
          <div className={style.barContainer}>
            <Progress.Bar
              mode="light"
              className={cls(isProgressReverse ? style.progressReverse : "")}
              strokeColor={getPercentageColor(
                formattedValue[0],
                unit !== "percentage",
                colorInverse,
              )}
              percent={Number(formattedValue[2]?.split("%")?.[0])}
              format={() => formattedValue[1]}
              showInfo={false}
            />
          </div>
          <div className={style.value} style={valueStyle}>
            {formattedValue[1]}
          </div>
        </div>
      </>
    );
  },
);
interface IProps {
  [key: string]: any;
  resource: string;
  metricName: string;
  limit: number;
  zoneUuid?: string;
}
const TopMonitorWidget: React.FC<IProps> = React.memo(
  ({ topResource: resource, topMetricName: metricName, limit }) => {
    const { metricConfig } = useMetricConfig();
    const zoneUuid = useDashboardStore((state) => state.zoneUuid);
    const isFirstLoad = useRef(true);
    const currentResource: IMetricConfig | undefined = _find(metricConfig, {
      value: resource,
    });
    const currentItem = _find(currentResource?.children, { value: metricName });
    const [_queryWidgetMonitorTopData, { loading, data }] = useLazyQuery(
      resource !== "l3network"
        ? queryWidgetMonitorTop
        : queryWidgetMonitorL3NetworkTop,
      {
        fetchPolicy: "no-cache",
        onCompleted: () => {
          isFirstLoad.current = false;
        },
      },
    );

    // 使用 ref 存储函数引用，避免 useEffect 依赖不稳定
    const queryWidgetMonitorTopDataRef = useRef(_queryWidgetMonitorTopData);
    queryWidgetMonitorTopDataRef.current = _queryWidgetMonitorTopData;

    // 这个组件目前在页面的最下面，第一屏进来是看不到的，等用户滑到显示的时候再去请求数据
    const { ref, inView } = useInView({});

    const fetchTopData = useCallback(() => {
      queryWidgetMonitorTopDataRef.current({
        variables: {
          namespace: currentResource?.namespace,
          metricName,
          limit,
          zoneUuid,
        },
      });
    }, [currentResource?.namespace, metricName, limit, zoneUuid]);

    useEffect(() => {
      if (inView) {
        fetchTopData();
      }
    }, [inView, fetchTopData]);
    const list =
      resource !== "l3network"
        ? data?.queryWidgetMonitorTop?.list || []
        : data?.queryWidgetMonitorL3NetworkTop?.list || [];
    const valueMax =
      resource !== "l3network"
        ? data?.queryWidgetMonitorTop?.valueMax || 0
        : data?.queryWidgetMonitorL3NetworkTop?.valueMax;

    const getPrefix = useCallback(
      (e: any) => {
        //看看怎么扩展
        if (resource === "l3network") {
          return `/l3-network/${e?.l3Network?.networkType}-network/detail?uuid=`;
        }
        return currentResource?.prefixPath ?? "";
      },
      [resource, currentResource?.prefixPath],
    );

    const resourceType = useMemo(() => {
      return resource === "vm-in"
        ? `virtualization.vm`
        : `virtualization.${resource}`;
    }, [resource]);

    return (
      <div className={style.container} ref={ref}>
        <AutoSkeleton
          name={`top-monitor-${resource}-${metricName}`}
          loading={isFirstLoad.current && loading}
        >
          <div className={style.title}>
            Top{limit} : {currentResource?.name}
            {currentItem?.label}
            {currentResource?.extraLabel && (
              <Text className={style.extraLabel}>
                {currentResource?.extraLabel}
              </Text>
            )}
          </div>
          <Empty show={list?.length === 0} />
          {list?.length > 0 && (
            <div className={style.content}>
              {list.map((e: ITopMonitorBarProps) => (
                <TopMonitorBar
                  key={e.uuid}
                  uuid={e.uuid}
                  name={e.name}
                  value={e.value}
                  unit={currentItem?.unit ?? ""}
                  valueMax={valueMax}
                  colorInverse={!!currentItem?.colorInverse}
                  microAppName={currentResource?.microAppName ?? ""}
                  iconType={currentResource?.iconType as IconTypes}
                  auth={{
                    resource: resourceType,
                    authKey: "list",
                    type: "view",
                  }}
                  prefixPath={getPrefix(e)}
                  metricName={metricName}
                />
              ))}
              {Array.from({ length: limit - list.length })
                .fill("")
                ?.map((e, i: number) => (
                  <div key={i} className={style.topMonitorBarContainer} />
                ))}
            </div>
          )}
        </AutoSkeleton>
      </div>
    );
  },
);

export default TopMonitorWidget;
