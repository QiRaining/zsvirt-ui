import type {
  IDraggableCardProps,
  ILayoutItem,
} from "@zstack/zsphere-components";
import {
  ResponsiveDndCardsLayout,
  TagAndAttribute,
} from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";

import EditConfig from "../../action/edit-config";
import Alerts from "./alerts";
import BasicInfo from "./basic-info";
import CapacityUsage from "./capacity-usage";
import VmHardware from "./hardware";
import PropertyConfig from "./property-config";
import RelativeResource from "./relative-object";

interface IProps {
  current: IVM;
  refetch?: any;
  resourceConfig?: any;
  resourceConfigLoading?: boolean;
}

const Overview: React.FC<IProps> = ({
  current,
  resourceConfig,
  resourceConfigLoading,
}) => {
  const [editConfigVisible, setEditConfigVisible] = useState(false);

  const dataSet = useMemo(() => {
    if (!current || current?.uuid === "") {
      return {} as { [key: string]: ILayoutItem };
    }
    return {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo
            setEditConfigVisible={setEditConfigVisible}
            detail={current}
            {...props}
          />
        ),
      },
      vmHardware: {
        resourceKey: "vmHardware",
        x: 0,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <VmHardware
            setEditConfigVisible={setEditConfigVisible}
            detail={current}
            resourceConfig={resourceConfig}
            resourceConfigLoading={resourceConfigLoading}
            {...props}
          />
        ),
      },
      capacityUsage: {
        resourceKey: "capacityUsage",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <CapacityUsage detail={current} {...props} />
        ),
      },
      relativeResource: {
        resourceKey: "relativeResource",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RelativeResource
            setEditConfigVisible={setEditConfigVisible}
            detail={current}
            {...props}
          />
        ),
      },
      propertyConfig: {
        resourceKey: "propertyConfig",
        x: 1,
        y: 2,
        node: (props: Omit<IDraggableCardProps, "detail">) => {
          return <PropertyConfig detail={current} {...props} />;
        },
      },
      tagAndAttribute: {
        resourceKey: "tagAndAttribute",
        x: 1,
        y: 3,
        node: (props: Omit<IDraggableCardProps, "detail">) => {
          return <TagAndAttribute current={current} {...props} />;
        },
      },
    };
  }, [current, resourceConfig, resourceConfigLoading]);

  const memoizedSelectedList = useMemo(() => [current], [current]);

  return (
    <>
      <Alerts current={current} setEditConfigVisible={setEditConfigVisible} />

      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-resource-vm"
        cols={2}
        dataSet={dataSet}
      />

      <EditConfig
        visible={editConfigVisible}
        setVisible={setEditConfigVisible}
        selectedList={memoizedSelectedList}
        source={current}
        position="header"
        view="virtualization"
      />
    </>
  );
};

export default Overview;
