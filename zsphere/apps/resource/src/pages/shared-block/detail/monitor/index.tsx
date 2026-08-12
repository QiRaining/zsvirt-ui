import {
  BusinessMonitor,
  ResponsiveDndCardsLayout,
} from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { SharedBlock } from "@zstack/zsphere-types/graphql";
import React from "react";

import Performance from "./performance";

const { MonitorTime, MonitorProvider } = BusinessMonitor;

const divMarginBottomStyle = { marginBottom: 12 } as const;

export interface IProps {
  current: SharedBlock;
}

export default function Monitor({ current }: IProps) {
  const dataSet = React.useMemo(() => {
    return {
      performance: {
        resourceKey: "performance",
        x: 0,
        y: 0,
        node: (props: any) => <Performance {...props} current={current} />,
      },
    };
  }, [current]);

  return (
    <>
      <div style={divMarginBottomStyle}>
        <MonitorTime />
      </div>
      <MonitorProvider>
        <ResponsiveDndCardsLayout
          profileType={ProfileType.MonitoringLayoutConfig}
          resourceType="shared-block"
          cols={1}
          dataSet={dataSet}
        />
      </MonitorProvider>
    </>
  );
}
