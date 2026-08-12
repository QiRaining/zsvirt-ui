import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";

import BasicInfo from "./basic-info";
import ConfigInfo from "./config-info";

interface IProps {
  current: IBaremetalPxeServer;
  refetch: any;
}

const Overview: FC<IProps> = ({ current, refetch }) => {
  return (
    <div>
      <div className="flex gap-5">
        <div className="flex-1">
          <BasicInfo detail={current} refetch={refetch} />
        </div>
        <div className="flex-1">
          <ConfigInfo detail={current} />
        </div>
      </div>
    </div>
  );
};

export default Overview;
