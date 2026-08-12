import { useActionConfig } from "@zstack/zsphere-engine/src/vgpu-device";
import type { VGpuDevice as IVGpuDevice } from "@zstack/zsphere-types/graphql";
import SetShareTypeFromNoGroup from "zsv_administration_shared/account-information/action/set-share-type-from-noGroup";

import DetachModal from "../action/detach-modal";
import StartModal from "../action/start-modal";
import StopModal from "../action/stop-modal";
import {
  verifyEnabled,
  verifyDisabled,
  verifyDetachFromVmInstace,
} from "../action/validator";

export default () => {
  return useActionConfig<IVGpuDevice>([
    {
      key: "detach.vgpu.device",
      validators: [verifyDetachFromVmInstace],
      ActionWrapper: DetachModal,
    },
    // 集群
    {
      key: "cluster.vgpu.enable",
      validators: [verifyEnabled],
      ActionWrapper: StartModal,
    },
    {
      key: "cluster.vgpu.disable",
      validators: [verifyDisabled],
      ActionWrapper: StopModal,
    },
    {
      key: "cluster.vgpu.set.share.type",
      ActionWrapper: SetShareTypeFromNoGroup,
    },
    // 物理机
    {
      key: "host.vgpu.enable",
      validators: [verifyEnabled],
      ActionWrapper: StartModal,
    },
    {
      key: "host.vgpu.disable",
      validators: [verifyDisabled],
      ActionWrapper: StopModal,
    },
    {
      key: "host.vgpu.set.share.type",
      ActionWrapper: SetShareTypeFromNoGroup,
    },
  ]);
};
