import type {
  IDraggableCardProps,
  ISelectOption,
} from "@zstack/zsphere-components";
import { useIsCurrentTab } from "@zstack/zsphere-components";
import type { IBusinessMonitorTimeRefs } from "@zstack/zsphere-components";
import {
  ResponsiveDndCardsLayout,
  BusinessMonitor,
  useMonitorItems,
} from "@zstack/zsphere-components";
import type { IResponsiveDndCardsLayout } from "@zstack/zsphere-components/dist/responsive-dnd-cards-layout";
import { GetMetricDataQueryType, ProfileType } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import _ from "lodash-es";
import type { FC } from "react";
import React, { useRef, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import IPCard from "./ip-card";

import style from "./style.module.less";

const { MonitorTime, MonitorProvider } = BusinessMonitor;
interface IProps {
  uuid: string;
}

const Monitoring: FC<IProps> = ({ uuid }) => {
  const intl = useIntl();

  const resourceType = "virtualization-resource-l3network";
  const defaultMonitorItems = ["UsedIPInPercent", "AvailableIPInPercent"];
  const { getMonitorItems, loadingMonitorItems, monitorItems } =
    useMonitorItems(resourceType, defaultMonitorItems);

  const timeRef = useRef<IBusinessMonitorTimeRefs>(null);
  const equal = useIsCurrentTab("main-tab", "monitoring");

  useEffect(() => {
    if (equal) {
      timeRef.current?.refresh();
      timeRef.current?.startInterval();
    } else {
      timeRef.current?.stopInterval();
    }
  }, [equal]);

  useMount(() => {
    getMonitorItems();
  });

  const monitorItemOptions: ISelectOption<string>[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "ip.monitor",
          defaultMessage: "Network Protocol Monitoring",
        }),
        value: "ip",
        options: [
          {
            label: intl.formatMessage({
              id: "UsedIPInPercent",
              defaultMessage: "Used IP Percentage (IPv4)",
            }),
            value: "UsedIPInPercent",
          },
          {
            label: intl.formatMessage({
              id: "AvailableIPInPercent",
              defaultMessage: "Available IP Percent",
            }),
            value: "AvailableIPInPercent",
          },
        ],
      },
    ],
    [intl],
  );

  const dataSet = useMemo(() => {
    const monitorProps = {
      uuid,
      namespace: "ZStack/L3Network",
      resourceType: GetMetricDataQueryType.L3Network,
    };
    return _.reduce(
      monitorItemOptions,
      (prev, cur, index) => {
        const curKey = cur.value;
        const curOptions = _.filter(cur.options, (option) =>
          _.includes(monitorItems, option.value),
        );
        const monitorKeys = _.map(curOptions, "value");
        if (!_.isEmpty(monitorKeys)) {
          prev[curKey] = {
            resourceKey: curKey,
            x: 0,
            y: index,
            node: (cardProps: IDraggableCardProps) => {
              const resourceProps = {
                monitorKeys,
                monitorProps,
                cardProps,
              };
              switch (curKey) {
                case "ip":
                  return <IPCard {...resourceProps} />;
                default:
                  return <></>;
              }
            },
          };
        }
        return prev;
      },
      {} as IResponsiveDndCardsLayout["dataSet"],
    );
  }, [monitorItemOptions, monitorItems, uuid]);

  return (
    <div>
      <div
        className={`${style["action-bar"]} flex items-center justify-between`}
      >
        <div>
          <MonitorTime ref={timeRef} />
        </div>
      </div>
      <MonitorProvider>
        <ResponsiveDndCardsLayout
          profileType={ProfileType.MonitoringLayoutConfig}
          resourceType={resourceType}
          cols={1}
          dataSet={dataSet}
          loading={loadingMonitorItems}
        />
      </MonitorProvider>
    </div>
  );
};

export default Monitoring;
