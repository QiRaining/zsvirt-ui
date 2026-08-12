import type { Cluster } from "@zstack/zsphere-types/graphql";
import React from "react";

import BareMetalChassisList from "../../../baremetal-chassis/list";

interface IProps {
  current: Cluster;
}

const BareMetalDevice: React.FC<IProps> = ({ current }) => {
  return (
    <div className="main-list">
      <BareMetalChassisList
        source={current}
        defaultQuery={{
          conditions: [
            {
              key: "cluster.uuid",
              value: current.uuid,
            },
          ],
        }}
        view="main"
      />
    </div>
  );
};

export default BareMetalDevice;
