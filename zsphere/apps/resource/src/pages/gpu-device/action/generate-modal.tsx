import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PciDevice as IPciDevice } from "@zstack/zsphere-types/graphql";
import React from "react";

import GenerateMdevModal from "./generate-mdev-modal";
import GenerateSriovModal from "./generate-sriov-modal";

const GenerateAction: React.FC<IActionWrapperProps<IPciDevice>> = (props) => {
  const isMdevDevice: boolean = props?.selectedList?.[0]?.vendorId !== "1002";

  if (isMdevDevice) {
    // N卡
    return <GenerateMdevModal {...props} />;
  }
  return <GenerateSriovModal {...props} />;
};

export default GenerateAction;
