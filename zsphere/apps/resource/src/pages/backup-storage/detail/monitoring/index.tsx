import type {
  IBusinessMonitorTimeRefs,
  IDraggableCardProps,
  ISelectOption,
} from "@zstack/zsphere-components";
import {
  BusinessMonitor,
  ResponsiveDndCardsLayout,
  useIsCurrentTab,
  useMonitorItems,
} from "@zstack/zsphere-components";
import { GetMetricDataQueryType, ProfileType } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import { reduce, filter, map, isEmpty, includes } from "lodash-es";
import type { FC } from "react";
import { useMemo, useRef, useEffect } from "react";
import { useIntl } from "react-intl";

import CapacityCard from "./capacity-card";

import style from "./style.module.less";

const { MonitorTime, MonitorProvider } = BusinessMonitor;

export interface IProps {
  uuid: string;
  isCeph?: boolean;
}

const Monitoring: FC<IProps> = ({ uuid, isCeph: _isCeph }) => {
  const intl = useIntl();

  const resourceType = "virtualization-resource-backupStorage";
  const defaultMonitorItems = ["UsedCapacityInPercent"];
  const {
    getMonitorItems,
    loadingMonitorItems,
    monitorItems,
    refetchMonitorItems,
  } = useMonitorItems(resourceType, defaultMonitorItems);

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
          id: "capacity.monitor",
          defaultMessage: "Capacity Monitoring",
        }),
        value: "capacity",
        options: [
          {
            label: intl.formatMessage({
              id: "UsedCapacityInPercent",
              defaultMessage: "Capacity Percent Used",
            }),
            value: "UsedCapacityInPercent",
          },
        ],
      },
    ],
    [intl],
  );

  const dataSet = useMemo(() => {
    const monitorProps = {
      uuid,
      namespace: "ZStack/BackupStorage",
      resourceType: GetMetricDataQueryType.BackupStorage,
      resourceKey: "BackupStorageUuid",
    };
    return reduce(
      monitorItemOptions,
      (prev, cur, index) => {
        const curKey = cur.value;
        const curOptions = filter(cur.options, (option) =>
          includes(monitorItems, option.value),
        );
        const monitorKeys = map(curOptions, "value");
        if (!isEmpty(monitorKeys)) {
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
                case "capacity":
                  return <CapacityCard {...resourceProps} />;
                default:
                  return <></>;
              }
            },
          };
        }
        return prev;
      },
      {} as Record<string, any>,
    );
  }, [monitorItemOptions, monitorItems, uuid]);

  return (
    <div>
      <div className={`flex justify-between ${style["action-bar"]}`}>
        <div>
          <MonitorTime ref={timeRef} />
        </div>
        <div>
          <BusinessMonitor.MonitorItems
            options={monitorItemOptions}
            resourceType={resourceType}
            initialValue={monitorItems}
            defaultValue={defaultMonitorItems}
            onSave={refetchMonitorItems}
          />
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
