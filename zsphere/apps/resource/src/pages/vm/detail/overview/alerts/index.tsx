import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React from "react";

import DuplicateIpAlert from "./duplicate-ip";
import VmToolsAlert from "./guest-tools";

interface IProps {
  current: IVM;
  setEditConfigVisible: (visible: boolean) => void;
}

const Alerts: React.FC<IProps> = ({ current, setEditConfigVisible }) => {
  return (
    <React.Fragment>
      <VmToolsAlert current={current} />
      <DuplicateIpAlert
        current={current}
        setEditConfigVisible={setEditConfigVisible}
      />
    </React.Fragment>
  );
};

export default Alerts;
