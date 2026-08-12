import {
  ResponsiveDndCardsLayout,
  TagAndAttribute,
} from "@zstack/zsphere-components";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";

import EditTemplateConfig from "../../action/edit-config-form-vm";
import BasicInfo from "./basic-info";
import VmHardware from "./hardware";
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
  const selectedList = useMemo(() => [current as any], [current]);

  const dataSet = useMemo(() => {
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
        x: 1,
        y: 0,
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
      tagAndAttribute: {
        resourceKey: "tagAndAttribute",
        x: 1,
        y: 2,
        node: (props: Omit<IDraggableCardProps, "detail">) => {
          return <TagAndAttribute current={current} {...props} />;
        },
      },
    };
  }, [current, resourceConfig, resourceConfigLoading]);

  return (
    <>
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-resource-vm"
        cols={2}
        dataSet={dataSet}
      />
      <EditTemplateConfig
        visible={editConfigVisible}
        setVisible={setEditConfigVisible}
        selectedList={selectedList}
        view=""
        position="row"
      />
    </>
  );
};

export default Overview;
