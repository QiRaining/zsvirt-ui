import type { VmInstance } from "@zstack/zsphere-types/graphql";

import { useActionConfig } from "../../../../../../../../shared/engine/src/vm";
import AttachVm from "../../../action/attach-vm";
import DetachVm from "../../../action/detach-vm";

export default () => {
  return useActionConfig<VmInstance>([
    {
      key: "virtualization.snapshotStrategy.attachVm",
      autoInjectPreValidator: false,
      ActionWrapper: AttachVm,
    },
    {
      key: "virtualization.snapshotStrategy.detachVm",
      ActionWrapper: DetachVm,
    },
  ]);
};
