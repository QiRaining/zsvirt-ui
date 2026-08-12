import { automationLevelList } from "@zstack/virtualization-resource/src/pages/cluster/detail/drs/drs-panel-config-info/constant";
import { DraggableCard, State } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { reverseFormateTimer, useUnit } from "./utils";

export interface IProps {
  detail: ICluster;
  refetch: Function;
  drs: any;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const SchedulingInformationInfo: React.FC<IProps> = ({
  detail,
  drs,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();
  const { unitMap } = useUnit();

  const { isSupported, detail: drsDetail } = drs;
  const {
    automationLevel = automationLevelList[0],
    balancedState = "Unknown",
  } = drsDetail ?? {};

  const balancedStateEle = useMemo(() => {
    if (!isSupported) {
      return (
        <State
          type="disabled"
          name={intl.formatMessage({
            id: "unknown",
            defaultMessage: "Unknown",
          })}
          prefix="dot"
        />
      );
    }
    const balanceStateMap: any = {
      Unknown: (
        <State
          type="disabled"
          name={intl.formatMessage({
            id: "unknown",
            defaultMessage: "Unknown",
          })}
          prefix="dot"
        />
      ),
      Balanced: (
        <State
          type="success"
          name={intl.formatMessage({
            id: "balance",
            defaultMessage: "Balance",
          })}
          prefix="dot"
        />
      ),
      Unbalanced: (
        <State
          type="error"
          name={intl.formatMessage({
            id: "unbalance",
            defaultMessage: "Imbalanced",
          })}
          prefix="dot"
        />
      ),
    };
    return balanceStateMap[balancedState];
  }, [isSupported, intl, balancedState]);

  const getDispatchModeContent = () => {
    const dispatchModeMap: any = {
      Manual: () =>
        intl.formatMessage({
          id: "manual.scheduling",
          defaultMessage: "Manual Scheduling",
        }),
      Automatic: () =>
        intl.formatMessage({
          id: "automatic.scheduling",
          defaultMessage: "Auto Scheduling",
        }),
    };
    return dispatchModeMap[automationLevel]?.();
  };

  const list = useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "dispatchMode",
          defaultMessage: "DRS Mode",
        }),
        value: getDispatchModeContent(),
      },
      {
        label: intl.formatMessage({
          id: "balanceStatus",
          defaultMessage: "Balance Status",
        }),
        value: balancedStateEle,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.create.field.automationLevel.drs.migrateVm.concurrent",
          defaultMessage: "VM Migration Concurrency",
        }),
        value: `${detail?.resourceConfigValue?.drsDrsMigrateVmConcurrent} ${intl.formatMessage(
          {
            id: "virtualization.cluster.create.field.automationLevel.drs.migrateVm.concurrent.unit",
            defaultMessage: " ",
          },
        )}`,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.create.field.automationLevel.drs.schedulingInterval",
          defaultMessage: "Cluster Scanning Interval",
        }),
        value: `${
          reverseFormateTimer(
            (detail?.resourceConfigValue?.drsDrsSchedulingInterval ??
              0) as number,
            unitMap,
          )?.num
        }${
          reverseFormateTimer(
            (detail?.resourceConfigValue?.drsDrsSchedulingInterval ??
              0) as number,
            unitMap,
          )?.unit
        }`,
      },
    ],
    [intl, balancedStateEle, detail],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "scheduling.information",
        defaultMessage: "DRS Info",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default SchedulingInformationInfo;
