import { gql, useQuery } from "@apollo/client";
import { BusinessMonitor, MonitorSelect } from "@zstack/zsphere-components";
import { NVMeLunType, Op } from "@zstack/zsphere-types";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import BlockDeviceChart from "./lun-chart";

const { MonitorCard } = BusinessMonitor;

const blockDeviceLunList = gql`
  query blockDeviceLunList(
    $scsiConditions: [Condition!]
    $nvmeConditions: [Condition!]
    $nvmeType: NVMeLunType
  ) {
    scsiLunList(conditions: $scsiConditions) {
      list {
        uuid
        name
        wwid
      }
    }
    nvmeLunList(conditions: $nvmeConditions, type: $nvmeType) {
      list {
        uuid
        name
        wwid
      }
    }
  }
`;

interface LunListItem {
  name?: string | null;
  wwid?: string | null;
}

interface LunOptionItem {
  name: string;
  wwid: string;
}

interface LunListQueryData {
  scsiLunList?: {
    list?: LunListItem[];
  };
  nvmeLunList?: {
    list?: LunListItem[];
  };
}

export interface IProps {
  uuid: string;
}

export default function BlockDeviceCard({ uuid, ...props }: IProps) {
  const intl = useIntl();
  const [labels, setLabels] = useState<string[]>([]);

  const { data } = useQuery<LunListQueryData>(blockDeviceLunList, {
    variables: {
      scsiConditions: [
        {
          key: "scsiLunHostRef.hostUuid",
          op: Op.eq,
          value: uuid,
        },
      ],
      nvmeConditions: [
        {
          key: "nvmeLunHostRef.hostUuid",
          op: Op.eq,
          value: uuid,
        },
      ],
      nvmeType: NVMeLunType.TransportNotPcie,
    },
  });

  const [options, optionMap] = useMemo(() => {
    const luns = [
      ...(data?.scsiLunList?.list ?? []),
      ...(data?.nvmeLunList?.list ?? []),
    ];
    const list: Array<{ label: string; value: string }> = luns
      .filter((item): item is LunOptionItem => !!item.name && !!item.wwid)
      .map((item) => ({
        label: item.name,
        value: item.wwid,
      }));
    const map = new Map(list.map((item) => [item.value, item.label]));
    return [list, map];
  }, [data]);

  useEffect(() => {
    const optionValues = options.map((item) => item.value);
    setLabels((prevLabels) => {
      if (!optionValues.length) {
        return prevLabels.length ? [] : prevLabels;
      }

      const optionValueSet = new Set(optionValues);
      const validLabels = prevLabels.filter((label) =>
        optionValueSet.has(label),
      );

      if (validLabels.length) {
        return validLabels.length === prevLabels.length
          ? prevLabels
          : validLabels;
      }

      return [optionValues[0]];
    });
  }, [options]);

  return (
    <MonitorCard
      title={intl.formatMessage({
        id: "block.device",
        defaultMessage: "LUN",
      })}
      extra={
        <MonitorSelect value={labels} onChange={setLabels} options={options} />
      }
      monitorKeys={["LunSpeed", "LunIops", "LunLatency"]}
      {...props}
    >
      <BlockDeviceChart
        uuid={uuid}
        labels={labels}
        labelFormatter={(value) => optionMap.get(value) ?? value}
      />
    </MonitorCard>
  );
}
