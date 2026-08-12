import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { ProfileType } from "@zstack/zsphere-types";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import CapacityUsage from "./capacity-usage";
import HostSummary from "./host-summary";
import MNInfo from "./mn-info";
import VMSymmary from "./vm-summary";

import style from "./style.module.less";

interface IProps {
  current: any;
  refetch?: any;
  resourceData?: any;
}

const Overview: React.FC<IProps> = React.memo(
  ({ current: _current, resourceData }) => {
    const { managementNode } = usePlatformStore();

    const dataSet = useMemo(() => {
      const result: any = {
        basicInfo: {
          resourceKey: "basicInfo",
          x: 0,
          y: 0,
          node: (props: Omit<IDraggableCardProps, "detail">) => (
            <BasicInfo {...props} resourceData={resourceData} />
          ),
        },
        capacityUsage: {
          resourceKey: "capacityUsage",
          x: 1,
          y: 0,
          node: (props: Omit<IDraggableCardProps, "detail">) => (
            <CapacityUsage {...props} />
          ),
        },
        hostSummary: {
          resourceKey: "hostSummary",
          x: 1,
          y: 1,
          node: (props: Omit<IDraggableCardProps, "detail">) => (
            <HostSummary {...props} resourceData={resourceData} />
          ),
        },
        vmSymmary: {
          resourceKey: "vmSymmary",
          x: 1,
          y: 2,
          node: (props: Omit<IDraggableCardProps, "detail">) => (
            <VMSymmary {...props} resourceData={resourceData} />
          ),
        },
      };
      if (managementNode?.isDoubleManagementNode) {
        result.mnInfo = {
          resourceKey: "vmHardware",
          x: 0,
          y: 1,
          node: (props: Omit<IDraggableCardProps, "detail">) => (
            <MNInfo {...props} />
          ),
        };
      }
      return result;
    }, [managementNode, resourceData]);

    return (
      <div className={style.container}>
        <ResponsiveDndCardsLayout
          profileType={ProfileType.OverviewLayoutConfig}
          resourceType="virtualization-resource-vm"
          cols={2}
          dataSet={dataSet}
        />
      </div>
    );
  },
);
Overview.displayName = "Overview";

export default Overview;
