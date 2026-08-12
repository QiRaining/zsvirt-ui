import { useActionConfig } from "@zstack/zsphere-engine/src/gpu-device";
import type { PciDevice as IPciDevice } from "@zstack/zsphere-types/graphql";
import SetShareTypeFromNoGroup from "zsv_administration_shared/account-information/action/set-share-type-from-noGroup";

import GenerateModal from "../action/generate-modal";
import StartModal from "../action/start-modal";
import StopModal from "../action/stop-modal";
import UngenerateModal from "../action/ungenerate-modal";
import {
  verifyEnabled,
  verifyDisabled,
  verifyGenerateSriov,
  verifyUngenerateSriov,
} from "../action/validator";

export default () => {
  return useActionConfig<IPciDevice>([
    // 集群
    {
      key: "cluster.gpu.enable",
      validators: [verifyEnabled],
      ActionWrapper: StartModal,
    },
    {
      key: "cluster.gpu.disable",
      validators: [verifyDisabled],
      ActionWrapper: StopModal,
    },
    {
      key: "cluster.gpu.set.share.type",
      ActionWrapper: SetShareTypeFromNoGroup,
    },
    {
      key: "cluster.gpu.generate",
      validators: [verifyGenerateSriov],
      ActionWrapper: GenerateModal,
    },
    {
      key: "cluster.gpu.ungenerate",
      validators: [verifyUngenerateSriov],
      ActionWrapper: UngenerateModal,
    },
    // 物理机
    {
      key: "host.gpu.enable",
      validators: [verifyEnabled],
      ActionWrapper: StartModal,
    },
    {
      key: "host.gpu.disable",
      validators: [verifyDisabled],
      ActionWrapper: StopModal,
    },
    {
      key: "host.gpu.set.share.type",
      ActionWrapper: SetShareTypeFromNoGroup,
    },
    {
      key: "host.gpu.generate",
      validators: [verifyGenerateSriov],
      ActionWrapper: GenerateModal,
    },
    {
      key: "host.gpu.ungenerate",
      validators: [verifyUngenerateSriov],
      ActionWrapper: UngenerateModal,
    },
  ]);
};
