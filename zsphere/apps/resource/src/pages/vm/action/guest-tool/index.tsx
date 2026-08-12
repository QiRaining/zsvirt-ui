import { GuestTools } from "@zstack/virtualization-resource/src/pages/vm/components/configuration-info";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React from "react";

const GuestToolAction: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  return (
    <GuestTools
      detail={selectedList?.[0]}
      visible={visible}
      setVisible={setVisible}
    />
  );
};

export default GuestToolAction;
