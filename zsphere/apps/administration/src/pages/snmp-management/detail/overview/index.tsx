import { Action } from "@zstack/zsphere-components";
// import { ProfileType } from '@zstack/zsphere-types'
import type { SnmpAgent } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import { useActionConfig } from "../../config";
import BasicInfo from "./basic-info";

const STYLE_ACTION_WRAPPER = { marginBottom: "12px" } as const;
const STYLE_INFO_WRAPPER = { width: "70%" } as const;

interface IProps {
  current: SnmpAgent;
  refetch: Function;
}

const Overview: React.FC<IProps> = ({ current, refetch }) => {
  const { list, viewMap } = useActionConfig();
  const memoizedSelectedList = useMemo(() => [current], [current]);

  // const dataSet = React.useMemo(() => {
  //   const result: any = {
  //     basicInfo: {
  //       resourceKey: 'basicInfo',
  //       x: 0,
  //       y: 0,
  //       node: (props: Omit<IDraggableCardProps, 'detail'>) => (
  //         <BasicInfo {...props} current={current} />
  //       )
  //     }
  //   }

  //   return result
  // }, [current])

  return (
    <>
      <div style={STYLE_ACTION_WRAPPER}>
        <Action
          view="virtualization.main"
          menuList={list}
          viewMap={viewMap}
          position="header"
          refetch={refetch}
          selectedList={memoizedSelectedList}
        />
      </div>

      <div style={STYLE_INFO_WRAPPER}>
        {/* <ResponsiveDndCardsLayout
          profileType={ProfileType.OverviewLayoutConfig}
          resourceType="snmp-management"
          cols={2}
          dataSet={dataSet}
        /> */}

        <BasicInfo current={current} />
      </div>
    </>
  );
};

export default Overview;
