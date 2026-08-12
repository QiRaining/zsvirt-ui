import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { Sensor } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import type { IntlShape } from "react-intl";

import BasicInfo from "./basic-info";
import MonitorData from "./monitor-data";

export interface IProps {
  current: Sensor;
  hostUuid: string;
}

export default function Overview({ current, hostUuid }: IProps) {
  const intl = useIntl();
  const metricProps = getMetricProps(intl, current);
  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-resource-host-physical-nic-overview"
      cols={1}
      dataSet={{
        basicInfo: {
          resourceKey: "basicInfo",
          x: 0,
          y: 0,
          node: (props) => <BasicInfo current={current} {...props} />,
        },
        ...(metricProps && {
          configInfo: {
            resourceKey: "configInfo",
            x: 0,
            y: 1,
            node: (props) => (
              <MonitorData
                current={current}
                hostUuid={hostUuid}
                metricProps={metricProps}
                {...props}
              />
            ),
          },
        }),
      }}
    />
  );
}

function getMetricProps(intl: IntlShape, current: Sensor) {
  const cpuTempMatch = current.name.match(
    /^(?:cpu(\d*) temp|cpu(\d*)_temp|cpu(\d*) core rem|cpu(\d*)_core_temp|cpu_temp_(\d*))$/i,
  );
  if (cpuTempMatch) {
    const cpuId = cpuTempMatch.slice(1).find((val) => val !== undefined)!;
    return {
      metricNames: ["CpuTemperature"],
      metricNameMap: new Map([
        [
          "CpuTemperature",
          intl.formatMessage({
            id: "CpuTemperature",
            defaultMessage: "CPU Temperature",
          }),
        ],
      ]),
      labelName: "CPUNum",
      labels: [`CPU${cpuId}`],
      valueType: "temperature",
    };
  }
  return null;
}
