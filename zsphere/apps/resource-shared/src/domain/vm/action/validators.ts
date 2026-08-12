import { VmInstanceState } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";

// 打开控制台
export const verifyOpenConsole = (current: IVM) => {
  return _.includes(
    [
      VmInstanceState.Running,
      VmInstanceState.Crashed,
      VmInstanceState.VolumeRecovering,
      VmInstanceState.NoState,
    ],
    current.state,
  );
};

// 启动
export const verifyStart = (current: IVM) => {
  return ["stopped", "Stopped"].indexOf(current.state || "") >= 0;
};

// 停止
export const verifyStop = (current: IVM) => {
  return (
    ["Running", "running", "paused", "Paused", "Crashed", "NoState"].indexOf(
      current.state || "",
    ) >= 0
  );
};

// 强制停止
export const verifyForceStop = (current: IVM) => {
  return ["Unknown", "unknown"].indexOf(current.state || "") >= 0;
};

// 关机
export const verifyPoweroff = (current: IVM) => {
  return _.includes(
    [VmInstanceState.Running, VmInstanceState.Paused, VmInstanceState.Crashed],
    current.state,
  );
};
