import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  L2Network as IL2Network,
} from "@zstack/zsphere-types/graphql";
import React from "react";

import CreateL3Network from "../../l3-network/create";

const AttachCluster: React.FC<
  IActionWrapperProps<
    IL2Network & { __typename: string },
    (ICluster | IL2Network) & { __typename: string }
  >
> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  view,
  position,
  source,
}) => {
  return (
    <CreateL3Network
      visible={visible}
      setVisible={setVisible}
      selectedList={selectedList}
      setSelectedList={setSelectedList}
      source={source}
      view={view}
      position={position}
    />
  );
};

export default AttachCluster;
