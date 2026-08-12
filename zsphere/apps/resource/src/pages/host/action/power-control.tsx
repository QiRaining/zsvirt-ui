import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { UpdateHostPowerStatus } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import React from "react";

import ZSVBaseAction from "./zsv-power-control";

export const PowerOnAction: React.FC<IActionWrapperProps<IHost>> = (props) => {
  return (
    <ZSVBaseAction
      {...props}
      powerControlType={UpdateHostPowerStatus.PowerOn}
    />
  );
};

export const PowerOffAction: React.FC<IActionWrapperProps<IHost>> = (props) => {
  return (
    <ZSVBaseAction
      {...props}
      powerControlType={UpdateHostPowerStatus.PowerOff}
    />
  );
};

export const PowerRebootAction: React.FC<IActionWrapperProps<IHost>> = (
  props,
) => {
  return (
    <ZSVBaseAction
      {...props}
      powerControlType={UpdateHostPowerStatus.PowerReboot}
    />
  );
};
